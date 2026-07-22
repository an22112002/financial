import datetime

from databases.index import db

def login_user(username: str):
    with db.get_cursor() as cursor:
        sql = "SELECT * FROM `users` WHERE `username` = %s"
        cursor.execute(sql, (username,))
        user = cursor.fetchone()
        if user is None:
            return None
        return user
    
def save_refresh_token(user_id: str, refresh_token: str, refresh_expired: datetime):
    with db.get_cursor() as cursor:
        sql = "UPDATE `users` SET `refreshToken` = %s, `refreshExpired` = %s WHERE `user_id` = %s"
        cursor.execute(sql, (refresh_token, refresh_expired, user_id))

def check_refresh_token(user_id: str, refresh_token: str):
    with db.get_cursor() as cursor:
        sql = "SELECT * FROM `users` WHERE `user_id` = %s AND `refreshToken` = %s AND `refreshExpired` > UTC_TIMESTAMP()"
        cursor.execute(sql, (user_id, refresh_token))
        user = cursor.fetchone()
        return user

def logout_user(user_id: str):
    with db.get_cursor() as cursor:
        sql = "UPDATE `users` SET `refreshToken` = null, `refreshExpired` = null WHERE `user_id` = %s"
        cursor.execute(sql, (user_id,))

def get_user(user_id: str):
    with db.get_cursor() as cursor:
        sql = "SELECT * FROM `users` WHERE `user_id` = %s"
        cursor.execute(sql, (user_id,))
        user = cursor.fetchone()
        return user

def create_user(id: str, permit: str, username: str, hashpass: str):
    with db.get_cursor() as cursor:
        sql = "INSERT INTO `users` (`user_id`, `permit`, `username`, `hashpass`) VALUES (%s, %s, %s, %s)"
        cursor.execute(sql, (
            id,
            permit,
            username,
            hashpass
        ))
        id = cursor.lastrowid
        return id
    
def change_user_status(user_id: str, status: str) -> bool:
    with db.get_cursor() as cursor:
        sql = "UPDATE `users` SET `status` = %s WHERE `user_id` = %s"
        cursor.execute(sql, (status, user_id))
        return cursor.rowcount > 0
    
def change_user_password(user_id: str, hashed_password: str) -> bool:
    with db.get_cursor() as cursor:
        sql = "UPDATE `users` SET `hashpass` = %s WHERE `user_id` = %s"
        cursor.execute(sql, (hashed_password, user_id))
        return cursor.rowcount > 0

def get_user_number():
    with db.get_cursor() as cursor:
        sql = "SELECT COUNT(*) AS count FROM `users`"
        cursor.execute(sql)
        result = cursor.fetchone()
        return result['count']