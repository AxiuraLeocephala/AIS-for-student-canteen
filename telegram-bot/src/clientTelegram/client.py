from pyrogram import Client

from src.config.configBot import API_ID, API_HASH, API_TOKEN

client = Client(
    name='bot_session',
    api_id=API_ID, 
    api_hash=API_HASH, 
    bot_token=API_TOKEN
)