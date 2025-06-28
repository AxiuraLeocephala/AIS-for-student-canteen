from aiohttp import web
from aiogram import Dispatcher
from aiogram.webhook.aiohttp_server import SimpleRequestHandler, setup_application, ip_filter_middleware
from aiogram.webhook.security import IPFilter

from src.bot.bot import bot
from src.clientTelegram.client import client
from src.routers.routers import routerServer, routerBot
from src.middlewares.cors import middlewares_cors
from src.onStartup.onStartupBot import on_startup
from src.config.configBot import WEBHOOK_PATH, WEBHOOK_PATH

dp = Dispatcher()
dp.include_router(routerBot)
dp.startup.register(on_startup)
ip_filter_middleware(IPFilter.default())

app = web.Application()
app.add_routes(routerServer)
middlewares_cors(app)

webhook_request_handler = SimpleRequestHandler(
    dispatcher=dp,
    bot=bot
)

webhook_request_handler.register(app, path=WEBHOOK_PATH)

setup_application(app, dp, bot=bot, client=client)