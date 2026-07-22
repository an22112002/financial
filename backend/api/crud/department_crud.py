from databases.index import db

# Phòng ban
def create_department(id: str,name: str) -> bool:
    with db.get_cursor() as cursor:
        sql = "INSERT INTO `departments` (`department_id`, `name`) VALUES (%s, %s)"
        cursor.execute(sql, (id, name))
        if cursor.rowcount > 0:
            return True
        return False
    
def delete_department(department_id: str) -> bool:
    with db.get_cursor() as cursor:
        sql = "DELETE FROM `departments` WHERE `department_id` = %s"
        cursor.execute(sql, (department_id,))
        if cursor.rowcount > 0:
            return True
        return False
    
def get_departments():
    with db.get_cursor() as cursor:
        sql = "SELECT * FROM `departments`"
        cursor.execute(sql)
        return cursor.fetchall()
    
def is_department_id_exist(department_id: str) -> bool:
    with db.get_cursor() as cursor:
        sql = "SELECT COUNT(*) AS count FROM `departments` WHERE `department_id` = %s"
        cursor.execute(sql, (department_id,))
        result = cursor.fetchone()
        return result['count'] > 0
    
def is_department_name_exists(name: str) -> bool:
    with db.get_cursor() as cursor:
        sql = "SELECT COUNT(*) AS count FROM `departments` WHERE `name` = %s"
        cursor.execute(sql, (name,))
        result = cursor.fetchone()
        return result['count'] > 0
    
def number_contract_in_department(department_id: str) -> int:
    with db.get_cursor() as cursor:
        sql = "SELECT COUNT(*) AS count FROM `contracts` WHERE `department_id` = %s"
        cursor.execute(sql, (department_id,))
        result = cursor.fetchone()
        return result['count']