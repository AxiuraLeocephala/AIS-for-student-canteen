import asyncio
from datetime import datetime, timezone

from src.services.dbService import dbService

async def run_delete_overdue_tokens():
    while True:
        obj_date = datetime.now(timezone.utc)
        current_timestamp_UTC = datetime(obj_date.year, obj_date.month, obj_date.day, obj_date.hour, obj_date.minute, obj_date.second).timestamp()
        tomorrow_timestamp_UTC = datetime(obj_date.year, obj_date.month, obj_date.day + 1, 20, 45, 0).timestamp() # Часы исключительно по UTC
        delay = tomorrow_timestamp_UTC - current_timestamp_UTC

        await asyncio.sleep(delay) 

        try:
            dbService.delete_jwt_blacklist(f"WHERE `EXP`<={tomorrow_timestamp_UTC}")
            dbService.delete_jwt_whitelist(f"WHERE `EXP`<={tomorrow_timestamp_UTC}")
        except Exception as e: 
            print("ERROR: runDeleteOverdueTokens 14:", e)
