from aiohttp import web

from src.server.server import app
from src.config.serverConfig import WEB_SERVER_HOST, WEB_SERVER_PORT
from src.utils.logger import setup_logger

def main() -> None:    
    web.run_app(app, host=WEB_SERVER_HOST, port=WEB_SERVER_PORT)

if __name__ == "__main__":
    setup_logger("INFO")
    main()