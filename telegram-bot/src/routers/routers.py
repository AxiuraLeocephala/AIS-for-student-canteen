from aiohttp import web
from aiogram import Router
from aiogram.filters import CommandStart
from aiogram.types import Message

from src.handlers.handlers import create_new_order, remove_new_order, change_status_order, command_start

routerServer = web.RouteTableDef()
routerBot = Router()

@routerServer.post("/bot/order/createOrder")
async def handler_create_new_order(request: web.Request):
    await create_new_order(request)

@routerServer.post("/bot/order/cancelOrder")
async def handler_remove_new_order(request: web.Request):
    await remove_new_order(request)

@routerServer.post("/bot/order/changeStatusOrder")
async def handler_change_status_order(request: web.Request):
    await change_status_order(request)

@routerBot.message(CommandStart())
async def handler_command_start(message: Message) -> None:
    await command_start(message)
