from api.model.contract_model import Payable
from databases.index import db

def exist_payable_id(payableID: str) -> bool:
    with db.get_cursor() as cursor:
        sql = "SELECT COUNT(*) AS count FROM `payable` WHERE `payable_id` = %s"
        cursor.execute(sql, (payableID,))
        result = cursor.fetchone()
        return result['count'] > 0
    
def get_payables_with_contract_id(contractID: str):
    with db.get_cursor() as cursor:
        sql = "SELECT * FROM `payable` WHERE `contract_id` = %s"
        cursor.execute(sql, (contractID,))
        return cursor.fetchall()

def number_receive_payable_in_contract(contractID: str) -> int:
    with db.get_cursor() as cursor:
        sql = "SELECT COUNT(*) AS count FROM `payable` WHERE `contract_id` = %s AND `type` = 'receive'"
        cursor.execute(sql, (contractID,))
        result = cursor.fetchone()
        return result['count']
    
def number_pay_payable_in_contract(contractID: str) -> int:
    with db.get_cursor() as cursor:
        sql = "SELECT COUNT(*) AS count FROM `payable` WHERE `contract_id` = %s AND `type` = 'pay'"
        cursor.execute(sql, (contractID,))
        result = cursor.fetchone()
        return result['count']

def create_payable(data: Payable, contractID: str, partnerID: str):
    with db.get_cursor() as cursor:
        sql = """
            INSERT INTO `payable` (
                `payable_id`,
                `contract_id`,
                `partner_id`,
                `type`,
                `amount`,
                `tax`,
                `lateFee`,
                `note`,
                `moment`
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (
            data.id,
            contractID,
            partnerID,
            data.type,
            data.amount,
            data.tax,
            data.lateFee,
            data.note,
            data.moment.model_dump_json()
        ))
        return cursor.rowcount > 0

def delete_payables(contractID: str) -> bool:
    with db.get_cursor() as cursor:
        sql = "DELETE FROM `payable` WHERE `contract_id` = %s"
        cursor.execute(sql, (contractID,))
        return cursor.rowcount > 0

def delete_payable(payableID: str) -> bool:
    with db.get_cursor() as cursor:
        sql = "DELETE FROM `payable` WHERE `payable_id` = %s"
        cursor.execute(sql, (payableID,))
        return cursor.rowcount > 0

def update_payable(payable, contract_id: str, partner_id: str):
    with db.get_cursor() as cursor:
        sql = """
            UPDATE `payable` SET
                `contract_id` = %s,
                `partner_id` = %s,
                `type` = %s,
                `amount` = %s,
                `tax` = %s,
                `lateFee` = %s,
                `note` = %s,
                `moment` = %s
            WHERE `payable_id` = %s
        """
        cursor.execute(sql, (
            contract_id,
            partner_id,
            payable.type,
            payable.amount,
            payable.tax,
            payable.lateFee,
            payable.note,
            payable.moment.model_dump_json(),
            payable.id
        ))
        return True