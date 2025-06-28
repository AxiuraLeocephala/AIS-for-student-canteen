import asyncio 
from .processes.runDeleteOverdueTokens import run_delete_overdue_tokens

async def startup(app):
    app['delete_overdue_tokens_task'] = asyncio.create_task(run_delete_overdue_tokens())
