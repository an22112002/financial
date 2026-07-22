import uuid

from databases.index import db


def get_transactions_with_payable_id(payableID: str):
    with db.get_cursor() as cursor:
        sql = "SELECT * FROM `transactions` WHERE `payable_id` = %s ORDER BY `dayExecute` ASC"
        cursor.execute(sql, (payableID,))
        return cursor.fetchall()


def get_transaction_by_id(transactionID: str):
    with db.get_cursor() as cursor:
        sql = "SELECT * FROM `transactions` WHERE `transaction_id` = %s"
        cursor.execute(sql, (transactionID,))
        return cursor.fetchone()


def get_transaction_by_payable_id(payableID: str):
    with db.get_cursor() as cursor:
        sql = "SELECT * FROM `transactions` WHERE `payable_id` = %s ORDER BY `dayExecute` DESC LIMIT 1"
        cursor.execute(sql, (payableID,))
        return cursor.fetchone()


def create_transaction(payableID: str, bankTransactionId: str, fromAccount: str, toAccount: str, amount: float, dayExecute: str) -> str:
    transactionID = str(uuid.uuid4())
    with db.get_cursor() as cursor:
        sql = """
            INSERT INTO `transactions` (
                `transaction_id`,
                `payable_id`,
                `fromAccount`,
                `toAccount`,
                `amount`,
                `dayExecute`,
                `bankTransactionId`
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (transactionID, payableID, fromAccount, toAccount, amount, dayExecute, bankTransactionId))
        return transactionID


def update_transaction(transactionID: str, payableID: str, bankTransactionId: str, fromAccount: str, toAccount: str, amount: float, dayExecute: str) -> bool:
    with db.get_cursor() as cursor:
        sql = """
            UPDATE `transactions` SET
                `payable_id` = %s,
                `fromAccount` = %s,
                `toAccount` = %s,
                `amount` = %s,
                `dayExecute` = %s,
                `bankTransactionId` = %s
            WHERE `transaction_id` = %s
        """
        cursor.execute(sql, (payableID, fromAccount, toAccount, amount, dayExecute, bankTransactionId, transactionID))
        return cursor.rowcount > 0


def delete_transaction_by_payable_id(payableID: str) -> bool:
    with db.get_cursor() as cursor:
        sql = "DELETE FROM `transactions` WHERE `payable_id` = %s"
        cursor.execute(sql, (payableID,))
        return cursor.rowcount > 0


def set_transaction_payable(transactionID: str, payableID: str | None) -> bool:
    with db.get_cursor() as cursor:
        sql = "UPDATE `transactions` SET `payable_id` = %s WHERE `transaction_id` = %s"
        cursor.execute(sql, (payableID, transactionID))
        return cursor.rowcount > 0
