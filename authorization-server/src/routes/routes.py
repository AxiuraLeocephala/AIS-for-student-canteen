from aiohttp import web

from src.handlers.handlers import check_init_data_handler, refresh_tokens_handler, authenticate_admin_handler
   
routes = [
    web.post('/auth/checkInitData', check_init_data_handler),
    web.post('/auth/refreshTokens', refresh_tokens_handler),
    web.get('/ws/auth/admin/authenticate', authenticate_admin_handler),
]