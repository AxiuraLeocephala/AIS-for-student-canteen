import asyncio
from pyrogram import Client, handlers, raw, errors
from pyrogram.session import Auth, Session

class AssemblerClientTelegram():
    def __init__(self, api_id: int, api_hash: str):
        self.API_ID = api_id
        self.API_HASH = api_hash
        self.client = Client(name='Client', api_id=self.API_ID, api_hash=self.API_HASH)
        self.client.add_handler(
            handlers.RawUpdateHandler(
                self.update_handler
            )
        )
        self.login_event = asyncio.Event()
        self.is_logined = False
        self.is_needed2FA = False
        self.information = None
        self.mismatchedDC = False

    async def start_session(self) -> None:
        await self.client.connect()
        self.nearestDC = await self.client.invoke(raw.functions.help.GetNearestDc())
        await self.client.session.stop()
        await self.client.storage.dc_id(self.nearestDC.nearest_dc)
        await self.client.storage.auth_key(
            await Auth(
                self.client,
                await self.client.storage.dc_id(),
                await self.client.storage.test_mode()
            ).create()
        )
        self.client.session = Session(
            self.client,
            await self.client.storage.dc_id(),
            await self.client.storage.auth_key(),
            await self.client.storage.test_mode(),
        )
        await self.client.session.start()

        if not self.client.is_initialized:
            await self.client.dispatcher.start()
            self.client.is_initialized = True

    async def update_handler(self, client: Client, update: raw.base.Update, users: list, chats: list) -> None:
        if isinstance(update, raw.types.auth.LoginToken) and self.nearestDC.nearest_dc != self.client.storage.dc_id():
            await self.start_session()
        if isinstance(update, raw.types.UpdateLoginToken):
            data = None
            try:
                data = await self.get_login_token()
            except errors.exceptions.unauthorized_401.SessionPasswordNeeded as e:
                self.is_needed2FA = True
                self.login_event.set()
                return
            
            if isinstance(data, raw.types.auth.LoginTokenSuccess):
                self.is_logined = True
                self.login_event.set()
                return
            
            elif isinstance(data, raw.types.auth.LoginTokenMigrateTo):
                await self.start_session()
                data = await self.get_login_token()
                if isinstance(data, raw.types.auth.LoginToken):
                    self.mismatchedDC = True
                    return

    async def get_login_token(self) -> raw.base.auth.LoginToken:
        return await self.client.invoke(
            raw.functions.auth.ExportLoginToken(
                api_id=self.API_ID,
                api_hash=self.API_HASH,
                except_ids=[]
            )
        )
