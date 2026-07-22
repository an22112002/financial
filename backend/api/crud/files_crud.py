from databases.index import db
import json

def exist_file_id(fileID: str) -> bool:
    with db.get_cursor() as cursor:
        sql = "SELECT COUNT(*) AS count FROM `files` WHERE `file_id` = %s"
        cursor.execute(sql, (fileID,))
        result = cursor.fetchone()
        return result['count'] > 0
    
def get_file(fileID: str):
    with db.get_cursor() as cursor:
        sql = "SELECT * FROM `files` WHERE `file_id` = %s"
        cursor.execute(sql, (fileID,))
        return cursor.fetchone()
    
def get_files_no_paper() -> list:
    with db.get_cursor() as cursor:
        sql = "SELECT * FROM `files` WHERE `paper_id` IS NULL"
        cursor.execute(sql)
        return cursor.fetchall()
    
def create_file(id: str, name: str, position: dict) -> bool:
    with db.get_cursor() as cursor:
        sql = "INSERT INTO `files` (`file_id`, `filename`, `position`) VALUES (%s, %s, %s)"
        cursor.execute(sql, (id, name, json.dumps(position)))
        return cursor.rowcount > 0
    
def update_file_paper(fileID: str, paperID: str | None) -> bool:
    with db.get_cursor() as cursor:
        sql = "UPDATE `files` SET `paper_id` = %s WHERE `file_id` = %s"
        cursor.execute(sql, (paperID, fileID))
        return True

def clear_file_paper(fileID: str) -> bool:
    return update_file_paper(fileID, None)
    
def delete_file(fileID: str) -> bool:
    with db.get_cursor() as cursor:
        sql = "DELETE FROM `files` WHERE `file_id` = %s"
        cursor.execute(sql, (fileID,))
        return cursor.rowcount > 0

def get_documents_with_contract_id(contractID: str) -> list:
    with db.get_cursor() as cursor:
        sql = "SELECT * FROM `files` WHERE `paper_id` = %s"
        cursor.execute(sql, (contractID,))
        return cursor.fetchall()

def get_documents_with_paper_id(paperID: str) -> list:
    with db.get_cursor() as cursor:
        sql = "SELECT * FROM `files` WHERE `paper_id` = %s"
        cursor.execute(sql, (paperID,))
        return cursor.fetchall()