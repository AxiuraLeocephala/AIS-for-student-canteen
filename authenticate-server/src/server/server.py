from aiohttp import web

from src.routes.routes import routes
from src.midlewares.cors import add_cors_to
from src.bgTasks.startup import startup

app = web.Application()
app.add_routes(routes)
add_cors_to(app)
app.on_startup.append(startup)