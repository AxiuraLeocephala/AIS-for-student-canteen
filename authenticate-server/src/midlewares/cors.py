from aiohttp import web
import aiohttp_cors

from src.config.serverConfig import ALLOWED_ORIGIN_CORS

def add_cors_to(app: web.Application) -> None:
    cors = aiohttp_cors.setup(app, defaults={
        origin: aiohttp_cors.ResourceOptions(
            expose_headers="*",
            allow_headers=["content-type", "authorization"],
            allow_methods=["POST", "GET", "OPTIONS"]
        ) for origin in ALLOWED_ORIGIN_CORS
    })

    for route in list(app.router.routes()):
        cors.add(route)