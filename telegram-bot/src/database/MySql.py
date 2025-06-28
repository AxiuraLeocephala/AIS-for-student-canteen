import atexit
import signal

import mysql.connector as connector
from mysql.connector import pooling, errorcode, Error
from typing import Tuple, Dict, Union

class MySql:
    def __init__(self, **config: dict) -> None:
        try:
            self.pool = pooling.MySQLConnectionPool(
                pool_reset_session=True,
                **config
            )
            atexit.register(self.__shutdown)
            signal.signal(signal.SIGINT, self.__handle_exit)
            signal.signal(signal.SIGTERM, self.__handle_exit)
        except connector.Error as err:
            if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
                print("Something is wrong with your user name or passmord")
            elif err.errno == errorcode.ER_BAD_DB_ERROR:
                print("Database does not exist")
            else:
                print("Error connection to database: ", err)
    
    def __get_connection(self):
        try:
            conn = self.pool.get_connection()
            cursor = conn.cursor()
            return conn, cursor
        except Error as err:
            print("Error getting connection from pool:", err)
            raise err

    def __shutdown(self):
        self.pool = None

    def query(self, sql: str, params: dict=None) -> Union[Tuple, Dict, None]:
        conn, cursor = self.__get_connection()
        try:
            cursor.execute(operation=sql, params=params)
            return cursor.fetchone()
        except connector.Error as err:
            print("Failed to complete the query: ", err)
            raise err
        finally:
            cursor.close()
            conn.close()

    def execute(self, sql: str, params: dict=None) -> None:
        conn, cursor = self.__get_connection()
        try:
            cursor.execute(operation=sql, params=params)
            conn.commit()
        except connector.Error as err:
            print("Failed to complete the query: ", err)
            raise err
        finally:
            cursor.close()
            conn.close()
        
    def __handle_exit(self, signum, frame):
        self.__shutdown()