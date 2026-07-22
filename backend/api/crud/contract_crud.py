from databases.index import db
from api.model.contract_model import Contract, SearchRequest

# Hợp đồng
def exist_id(contractID: str) -> bool:
    with db.get_cursor() as cursor:
        sql = "SELECT COUNT(*) AS count FROM `contracts` WHERE `contract_id` = %s"
        cursor.execute(sql, (contractID,))
        result = cursor.fetchone()
        return result['count'] > 0

def get_contract(contractID: str):
    with db.get_cursor() as cursor:
        sql = "SELECT * FROM `contracts` WHERE `contract_id` = %s"
        cursor.execute(sql, (contractID,))
        return cursor.fetchone()
    
def get_contracts_with_department_id(departmentID: str):
    with db.get_cursor() as cursor:
        sql = "SELECT * FROM `contracts` WHERE `department_id` = %s"
        cursor.execute(sql, (departmentID,))
        return cursor.fetchall()

def create_contract(data: Contract) -> bool:
    with db.get_cursor() as cursor:
        sql = """
            INSERT INTO `contracts` (
                `contract_id`,
                `contractCode`,
                `contractNumber`,
                `department_id`,
                `title`,
                `content`,
                `signDate`,
                `dateStart`,
                `dateEnd`,
                `status`,
                `userEdit`
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (
            data.contractID,
            data.contractCode,
            data.contractNumber,
            data.departmentID, # department_id tạm thời để null
            data.title,
            data.contractContent,
            data.signDate,
            data.startDate,
            data.finishDate.model_dump_json(), # chuyển finishDate thành JSON string
            data.status,
            '00000000-0000-0000-0000-000000000001'
        ))
        return cursor.rowcount > 0
    
def delete_contract(contractID: str) -> bool:
    with db.get_cursor() as cursor:
        sql = "DELETE FROM `contracts` WHERE `contract_id` = %s"
        cursor.execute(sql, (contractID,))
        return cursor.rowcount > 0
    
def get_contracts_by_search(search: SearchRequest):
    with db.get_cursor() as cursor:
        sql = "SELECT * FROM `contracts` WHERE 1=1"
        params = []
        if search.contractCode:
            sql += " AND `contractCode` LIKE %s"
            params.append(f"%{search.contractCode}%")
        if search.contractNumber:
            sql += " AND `contractNumber` LIKE %s"
            params.append(f"%{search.contractNumber}%")
        if search.contractTitle:
            sql += " AND `title` LIKE %s"
            params.append(f"%{search.contractTitle}%")
        if search.partner:
            sql += " AND `contract_id` IN (SELECT `contract_id` FROM `partners` WHERE `partnerName` LIKE %s)"
            params.append(f"%{search.partner}%")
        if search.signDate:
            sql += " AND `signDate` = %s"
            params.append(search.signDate)
        cursor.execute(sql, tuple(params))
        return cursor.fetchall()

def update_contract(data):
    with db.get_cursor() as cursor:
        sql = """
            UPDATE `contracts` SET
                `contractCode` = %s,
                `contractNumber` = %s,
                `department_id` = %s,
                `title` = %s,
                `content` = %s,
                `signDate` = %s,
                `dateStart` = %s,
                `dateEnd` = %s,
                `status` = %s,
                `userEdit` = %s
            WHERE `contract_id` = %s
        """
        cursor.execute(sql, (
            data.contractCode,
            data.contractNumber,
            data.departmentID, # department_id tạm thời để null
            data.title,
            data.contractContent,
            data.signDate,
            data.startDate,
            data.finishDate.model_dump_json(), # chuyển finishDate thành JSON string
            data.status,
            '00000000-0000-0000-0000-000000000001',
            data.contractID
        ))
        return True
