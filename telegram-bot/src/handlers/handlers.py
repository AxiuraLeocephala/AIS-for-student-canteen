import os
import json
import asyncio
import logging

from aiohttp import web
from aiohttp.web_response import json_response
from aiogram.types import FSInputFile, Message, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo

from src.bot.bot import bot
from src.services.dbService import dbService
from src.utils.generateCode import generateCode

async def create_new_order(request: web.Request):
    data = await request.json()
    try:
        path_code, size_code = generateCode.code128(data["codeReceive"])
        
        formattedProducts = "<blockquote expandable>"
        i = 1
        p = 0
        for product in data["products"]:
            p += product["Quantity"] * product["ProductPrice"]
            formattedProducts += f"{i}. <b>" + product["ProductName"] + "</b>\n" + f"        Количество: {product["Quantity"]}\n" + f"        Цена: {product["ProductPrice"]}₽\n"
            i += 1
        formattedProducts += f"<b>Общая стоимость: {p}₽</b></blockquote>\n\n"

        msg = await bot.send_photo(
            chat_id=data["userId"],
            photo=FSInputFile(path_code, "barcode", size_code),
            caption="<i>Вы можете показать этот штрих-код на кассе, чтобы получить заказ</i>\n\n" +
            formattedProducts +
            f"Номер заказа: {data['orderId']}\n" +
            f"Код для получения: {data['codeReceive']}\n\n" +
            "Статус: ожидает принятия",
            parse_mode="HTML"
        )

        dbService.update_order(f"MessageId={msg.message_id}", f"WHERE OrderId={data["orderId"]} AND UserId={data["userId"]}")
        
        os.remove(path_code)
        
        return json_response({"ok": True})
    except Exception as e:
        logging.error("Error hpy:45", e)

async def remove_new_order(request: web.Request):
    data = await request.json()
    try:
        messageId = dbService.get_order("MessageId", f"WHERE OrderId={data["orderId"]} AND UserId={data["userId"]}")
    
        await bot.delete_message(
            chat_id=data["userId"],
            message_id=messageId[0]
        )

        return json_response({"ok": True})
    except:
        return  json_response({'ok': False})

async def change_status_order(request: web.Request):
    print("0", request)
    data = await request.json()
    print("1", data)
    try:
        products, codeReceive, messageId = dbService.get_order("Products, CodeReceive, MessageId", f"WHERE OrderId={data["orderId"]} AND UserId={data["userId"]}")

        products = json.loads(products)

        formattedProducts = "<blockquote expandable>"
        i = 1
        p = 0
        for product in products:
            p += product["Quantity"] * product["ProductPrice"]
            formattedProducts += f"{i}. <b>" + product["ProductName"] + "</b>\n" + f"        Количество: {product["Quantity"]}\n" + f"        Цена: {product["ProductPrice"]}₽\n"
            i += 1
        formattedProducts += f"<b>Общая стоимость: {p}₽</b></blockquote>\n\n"

        await bot.edit_message_caption(
            chat_id=data["userId"],
            message_id=messageId,
            caption="<i>Вы можете показать этот штрих-код на кассе, чтобы получить заказ</i>\n\n" +
            formattedProducts +
            f"Номер заказа: {data['orderId']}\n" +
            f"Код для получения: {codeReceive}\n\n" +
            f"Статус: {data["status"]}",
            parse_mode="HTML"
        )

        return json_response({"ok": True})
    except Exception as e:
        print(e)

async def command_start(message: Message) -> None:
    try:
        msg = "Выберите раздел"
        result = dbService.get_user("*", f"WHERE `UserId` = {message.from_user.id}")
        if result is None:
            message_texts_start = [
                "Добрый день! 😊", 
                "С помощью этого бота вы сможете сделать заказа в студенческой столовой Меридиан.",
                "Всё, что вам нужно сделать, — это ознакомиться с меню, выбрать желаемые блюда, сделать заказ и забрать его."
            ]
            for text in message_texts_start:
                await message.answer(text)
                await asyncio.sleep(2)
            dbService.set_user("`UserId`", f"{message.from_user.id}")
            dbService.set_busket("`UserId`, `Products`", f"{message.from_user.id}, '[]'")
            msg = msg + ", чтобы сделать заказ."
        await message.answer(
            msg, 
            reply_markup=InlineKeyboardMarkup(
                row_width=1, 
                inline_keyboard=[
                    [InlineKeyboardButton(text="Меню", web_app=WebAppInfo(url='https://meridian.studentcanteen.ru/menu'))],
                    [InlineKeyboardButton(text="Корзина", web_app=WebAppInfo(url='https://meridian.studentcanteen.ru/basket'))],
                ]
            ),
        )
    except Exception as e:
        logging.error("handlers:25", e)