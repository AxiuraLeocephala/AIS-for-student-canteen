from aiogram import Bot
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode

from src.config.configBot import API_TOKEN

bot = Bot(API_TOKEN,  default=DefaultBotProperties(parse_mode=ParseMode.HTML))
