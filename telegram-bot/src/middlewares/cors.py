from aiohttp import web
from aiohttp_cors import setup, ResourceOptions

from src.config.configServer import ALLOWED_ORIGIN_CORS

def middlewares_cors(app: web.Application) -> None:
    cors = setup(app, defaults={
        origin: ResourceOptions(
            allow_credentials=True,
            expose_headers="*",
            allow_headers=["content-type"],
            allow_methods=["POST", "GET"]
        ) for origin in ALLOWED_ORIGIN_CORS
    })

    for route in list(app.router.routes()):
        cors.add(route)