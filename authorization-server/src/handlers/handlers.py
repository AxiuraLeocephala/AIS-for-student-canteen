import logging
import asyncio
from base64 import urlsafe_b64encode as base64url
import functools
from json import loads

from aiohttp import web, WSMsgType
from aiohttp.web_response import json_response
from aiogram.utils.web_app import safe_parse_webapp_init_data
from pyrogram import errors
import re

from src.utils.clientTelegram import AssemblerClientTelegram
from src.utils.jwt import edcode_token, decode_token
from src.services.dbService import dbService
from src.config.serverConfig import API_TOKEN, API_ID, API_HASH, LIFETIME_JWT, ALLOWED_ORIGIN_CORS

regex = "[\u0400-\u04FF]+"

async def check_init_data_handler(request: web.Request):
    data = await request.json()
    try:
        init_data_safe = safe_parse_webapp_init_data(token=API_TOKEN, init_data=data['initData'])
        access_token = edcode_token('access', LIFETIME_JWT, user_data=dict(init_data_safe.user), query_id=init_data_safe.query_id)
        refresh_token = edcode_token('refresh', LIFETIME_JWT, user_data=dict(init_data_safe.user), query_id=init_data_safe.query_id)
        return json_response({"ok": True, "accessToken": access_token, "refreshToken": refresh_token})
    except Exception as e:
        if isinstance(e, ValueError):
            err = "Хорошая работа, исследователь"
            status = 401
            logging.warning(f"UNSAFE INITDATA: {data['initData']}")
        else:
            err = "Server Error"
            status = 500
            logging.error(f"Error checking initData {e}")
        return json_response({"ok": False, "err": err}, status=status)
    
async def refresh_tokens_handler(request: web.Request):
    data = await request.json()
    try:
        user_data_safe = decode_token(token=data['refreshToken'])
        access_token = edcode_token('access', LIFETIME_JWT, user_data=dict(user_data_safe.get("user")), query_id=user_data_safe.get("query_id"))
        refresh_token = edcode_token('refresh', LIFETIME_JWT, user_data=dict(user_data_safe.get("user")), query_id=user_data_safe.get("query_id"))
        if (data["fromAdminPanel"]):
            return json_response({"ok": True, "accessToken": access_token, "refreshToken": refresh_token, "role": user_data_safe.get("user").get("is")})
        else:
            return json_response({"ok": True, "accessToken": access_token, "refreshToken": refresh_token})
    except Exception as e:
        return json_response({'ok': False, "err": "Хорошая работа, исследователь"}, status=401)

async def authenticate_admin_handler(request: web.Request):
    if request.headers.get("Origin") not in ALLOWED_ORIGIN_CORS:
        raise web.HTTPForbidden(text="Origin not allowed")

    client_created_event = asyncio.Event()
    holder_client_obj = {}

    async with asyncio.TaskGroup() as tg:
        task1 = tg.create_task(__launch_client(client_created_event, holder_client_obj))
        task2 = tg.create_task(__launch_ws(request, client_created_event, holder_client_obj))

    try:
        await task1.result().client.stop()
    except ConnectionError:
        pass

    return task2.result()

async def __launch_client(event: asyncio.Event, hld_obj: dict):
    try:
        client = AssemblerClientTelegram(api_id=API_ID, api_hash=API_HASH)
        await client.start_session()
        hld_obj['object_client'] = client
        event.set()
        return client
    except Exception as e:
        print("Error: routes.py:93", e)
        hld_obj["object_client"] = e
        event.set()

async def __processing_qr(client: AssemblerClientTelegram, ws: web.WebSocketResponse) -> None:
    try:
        while not client.is_logined and not client.is_needed2FA:
            if not client.mismatchedDC:
                try:
                    data = await client.get_login_token()
                    await ws.send_json({"contentType": "link", "link": f"tg://login?token={base64url(data.token).decode('utf8')}"})
                except errors.exceptions.unauthorized_401.SessionPasswordNeeded:
                    client.is_needed2FA = True
                    break
            else: 
                await ws.send_json({
                    "contentType": "error", 
                    "err": "Ошибка: не совпадает дата-центр авторизации.\nУдалите последнюю сессию авторизации и повторите попытку."
                })
                client.mismatchedDC = True

            try: await asyncio.wait_for(client.login_event.wait(), 30)
            except asyncio.TimeoutError: pass

        if client.is_needed2FA:
            await ws.send_json({"contentType": "2FA", "stat": ""})
        if client.is_logined:
            user = await client.client.get_me()
            try:
                id, first_name, second_name, role = dbService.get_workers("Worker_Id, FirstName, SecondName, Role", f"WHERE PhoneNumber='{user.phone_number[1:]}'")
            except TypeError:
                await ws.send_json({"contentType": "error", "error": "Отказ в доступе.\nВы не были добавлены в систему."})
                raise 
            if role:
                access_token = edcode_token(
                    'access', 
                    LIFETIME_JWT, 
                    user_data={
                        "id": id,
                        "first_name": first_name,
                        "second_name": second_name,
                        "is": role
                    },
                    query_id="null"
                )
                refresh_token = edcode_token(
                    'refresh', 
                    LIFETIME_JWT, 
                    user_data={
                        "id": id,
                        "first_name": first_name,
                        "second_name": second_name,
                        "is": role
                    },
                    query_id="null"
                )
                await ws.send_json({"contentType": "2FA", "stat": True, "accessToken": access_token, "refreshToken": refresh_token, "role": role})
            else:
                await ws.send_json({"contentType": "error", "error": "Отказ в доступе.\nУ вас нет доступа в систему."})
    except asyncio.CancelledError: pass
    except Exception as e:
        raise e

def __listener_task_done(set_background_task: set, task: asyncio.Task) -> None:
    if task.done():
        if task.exception():
            print("Task ended with an error: ", task.exception())
    set_background_task.discard(task)

async def __launch_ws(request: web.Request, event: asyncio.Event, hld_obj: dict):
    await event.wait()
    obj = hld_obj['object_client']
    ws = web.WebSocketResponse()
    await ws.prepare(request)
    background_task = set()
    task_processing_qr = None

    try:
        if isinstance(obj, Exception): raise obj
        else: client = obj; del obj

        async for msg in ws:
            if msg.type == WSMsgType.TEXT:
                requestData = loads(msg.data)
                match requestData.get("contentType"):
                    case "ping":
                        await ws.send_json({"contentType": "pong"})
                    case "close":
                        if task_processing_qr in background_task:
                            task_processing_qr.cancel()
                            await task_processing_qr
                        await ws.close()
                    case "QR":
                        task_processing_qr = asyncio.create_task(__processing_qr(client, ws))
                        background_task.add(task_processing_qr)
                        task_processing_qr.add_done_callback(functools.partial(__listener_task_done, background_task))
                    case "2FA":
                        try:
                            if task_processing_qr in background_task:
                                task_processing_qr.cancel()
                                await task_processing_qr
                            if not requestData.get("code"):
                                await ws.send_json({"contentType": "2FA", "stat": False})
                                continue
                            user = await client.client.check_password(requestData.get("code"))
                            try:
                                id, first_name, second_name, role = dbService.get_workers("Worker_Id, FirstName, SecondName, Role", f"WHERE PhoneNumber='{user.phone_number[1:]}'")
                            except TypeError:
                                await ws.send_json({"contentType": "2FA", "stat": False, "error": "Отказ в доступе.\nВы не были добавлены в систему."})
                                continue
                            if role:
                                access_token = edcode_token(
                                    'access', 
                                    LIFETIME_JWT, 
                                    user_data={
                                        "id": id,
                                        "first_name": first_name,
                                        "second_name": second_name,
                                        "is": role
                                    },
                                    query_id="null"
                                )
                                refresh_token = edcode_token(
                                    'refresh', 
                                    LIFETIME_JWT, 
                                    user_data={
                                        "id": id,
                                        "first_name": first_name,
                                        "second_name": second_name,
                                        "is": role
                                    },
                                    query_id="null"
                                )
                                await ws.send_json({"contentType": "2FA", "stat": True, "accessToken": access_token, "refreshToken": refresh_token, "role": role})
                            else:
                                await ws.send_json({"contentType": "error", "stat": False, "error": "Отказ в доступе. У вас нет доступа в систему."})
                        except errors.BadRequest as e:
                            await ws.send_json({"contentType": "2FA", "stat": False})
                        except Exception as e:
                            logging.error(e)
                            await ws.send_json({"contentType": "error", "stat": False, "error": "Error hpy: 210"})
                    case "LP":
                        try:
                            if task_processing_qr in background_task:
                                task_processing_qr.cancel()
                                await task_processing_qr

                            if requestData.get("login") == "" or requestData.get("password") == "":
                                await ws.send_json({"contentType": "LP", "stat": False})
                                continue
                            
                            flag = False
                            for key in ("login", "password"):
                                for char in requestData.get(key):
                                    if not bool(re.search(regex, char, re.UNICODE)):
                                        flag = True
                                        break
                                if flag: break
                            if flag:
                                await ws.send_json({"contentType": "LP", "stat": False})
                                continue

                            try:
                                id, first_name, second_name, role = dbService.get_workers(
                                    "Worker_Id, FirstName, SecondName, Role", 
                                    f"WHERE Login='{requestData.get("login")}' AND Password='{requestData.get("password")}'"
                                )
                            except TypeError:
                                await ws.send_json({"contentType": "error", "stat": False, "error": "Error hpy:243"})
                                continue

                            if role:
                                access_token = edcode_token(
                                    'access', 
                                    LIFETIME_JWT, 
                                    user_data={
                                        "id": id,
                                        "first_name": first_name,
                                        "second_name": second_name,
                                        "is": role
                                    },
                                    query_id="null"
                                )
                                refresh_token = edcode_token(
                                    'refresh', 
                                    LIFETIME_JWT, 
                                    user_data={
                                        "id": id,
                                        "first_name": first_name,
                                        "second_name": second_name,
                                        "is": role
                                    },
                                    query_id="null"
                                )
                                await ws.send_json({"contentType": "LP", "stat": True, "accessToken": access_token, "refreshToken": refresh_token, "role": role})
                            else:
                                await ws.send_json({"contentType": "LP", "stat": False})
                        except Exception as e:
                            print("Error: h:258:", e)
                            await ws.send_json({"contentType": "error", "error": "Error hpy: 262"})
                    case _:
                        raise "Неизвестный contentType"
            elif msg.type == WSMsgType.ERROR:
                raise ws.exception()
    except Exception as e:
        print("Error: h:265:",  e)
    finally:
        if not ws.closed:
            await ws.close()
        return ws
