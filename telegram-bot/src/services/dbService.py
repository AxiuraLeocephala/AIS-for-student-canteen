from typing import Tuple, Dict, Union

from src.database.MySql import MySql
from src.config.configDB import *

class DBService():
    def __init__(self) -> None:
        try:
            self.mysql = MySql(
                host=HOST, 
                port=PORT,
                database=DATABASE,
                user=USER, 
                password=PASSWORD,
                pool_name=POOL_NAME,
                pool_size=POOL_SIZE
            )
        except Exception as e:
            raise e
    
    def set_busket(self, field, value) -> None:
        self.mysql.execute(f"INSERT INTO busket ({field}) VALUE ({value})")

    def get_user(self, field, condition) -> Union[Tuple, Dict, None]:
        return self.mysql.query(f"SELECT {field} FROM users {condition}")
    
    def set_user(self, field, value) -> None:
        self.mysql.execute(f"INSERT INTO users ({field}) VALUES ({value})")
    
    def get_order(self, field, condition) -> Union[Tuple, Dict, None]:
        return self.mysql.query(f"SELECT {field} FROM orders {condition}")

    def update_order(self, field, condition) -> None:
        self.mysql.execute(f"UPDATE orders SET {field} {condition}")

    def close(self) -> None:
        self.mysql.close()
    
    def __del__(self) -> None:
        self.close()

dbService = DBService()