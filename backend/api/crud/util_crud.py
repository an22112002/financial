from databases.index import db

def get_our_side():
    with db.get_cursor() as cursor:
        sql = "SELECT companyName FROM `setting` WHERE `id` = 1"
        cursor.execute(sql)
        return cursor.fetchone()["companyName"]
    
def get_banks():
    with db.get_cursor() as cursor:
        sql = "SELECT * FROM `bank`"
        cursor.execute(sql)
        return cursor.fetchall()