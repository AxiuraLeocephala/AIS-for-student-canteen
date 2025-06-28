from aiogram import Bot

from src.config.configBot import BASE_WEBHOOK_URL, WEBHOOK_PATH

async def on_startup(bot: Bot) -> None:
   await bot.set_webhook(f"{BASE_WEBHOOK_URL}{WEBHOOK_PATH}")