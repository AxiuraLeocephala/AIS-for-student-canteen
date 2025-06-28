from typing import Tuple, Dict, Union

from src.database.MySql import MySql
from src.config.dbConfig import *

class DBService:
    def __init__ (self) -> None:
        try:
            self.mysql = MySql(
                host=HOST, 
                port=PORT,
                user=USER, 
                password=PASSWORD,
                database=DATABASE,
                pool_name=POOL_NAME,
                pool_size=POOL_SIZE
            )
        except Exception as e:
            raise e
    
    def get_jwt_blacklist(self, condition: str) -> Union[Tuple, Dict, None]:
        return self.mysql.query(f"SELECT * FROM `jwt_blacklist` {condition}")
    
    def set_jwt_blacklist(self, condition: str) -> None:
        self.mysql.execute( f"INSERT INTO `jwt_blacklist` SELECT * FROM jwt_whitelist {condition}")    

    def delete_jwt_blacklist(self, condition: str) -> None:
        self.mysql.execute(f"DELETE FROM `jwt_blacklist` {condition}")

    def set_jwt_whitelist(self, columns: str, values: str) -> None:
        self.mysql.execute(f"INSERT INTO `jwt_whitelist` ({columns}) VALUES ({values})")

    def delete_jwt_whitelist(self, condition: str) -> None:
        self.mysql.execute(f"DELETE FROM `jwt_whitelist` {condition}")

    def get_workers(self, columns: str, condition: str) -> Union[Tuple, Dict, None]:
        return self.mysql.query(f"SELECT {columns} FROM `workers` {condition}")
    

dbService = DBService()