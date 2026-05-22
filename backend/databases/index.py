from mysql.connector import pooling
from contextlib import contextmanager
from databases.config import host, port, user, password, database, pool_size

class Database:

    def __init__(self):
        self.pool = None

    def init_pool(self):

        try:
            self.pool = pooling.MySQLConnectionPool(
                pool_name="mypool",
                pool_size=pool_size,

                host=host,
                port=port,
                user=user,
                password=password,
                database=database,

                autocommit=False
            )

            # ping thử kết nối
            conn = self.pool.get_connection()
            conn.ping(reconnect=True)
            conn.close()

            print("MySQL Pool khởi tạo thành công")
        except Exception as e:
            print(f"Lỗi khởi tạo MySQL Pool: {e}")
            self.pool = None
            raise Exception("MySQL Pool connect failed")

    def get_connection(self):

        if self.pool is None:
            raise Exception("Pool not initialized")

        return self.pool.get_connection()

    def get_conn_cursor(self):

        conn = self.get_connection()

        cursor = conn.cursor(dictionary=True)

        return conn, cursor

    @contextmanager
    def get_cursor(self):

        conn = self.get_connection()

        cursor = conn.cursor(dictionary=True)

        try:
            yield cursor

            conn.commit()

        except Exception:
            conn.rollback()
            raise

        finally:
            cursor.close()
            conn.close()


db = Database()