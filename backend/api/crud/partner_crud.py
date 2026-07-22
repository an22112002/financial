import uuid

from databases.index import db


def exist_partner_id(partnerID: str) -> bool:
    with db.get_cursor() as cursor:
        sql = "SELECT COUNT(*) AS count FROM `partners` WHERE `partner_id` = %s"
        cursor.execute(sql, (partnerID,))
        result = cursor.fetchone()
        return result['count'] > 0


def create_partner(
    id: str,
    contractID: str,
    name: str,
    address: str | None = None,
    phone: str | None = None,
    taxCode: str | None = None,
    bankID: str | None = None,
    bankAccount: str | None = None,
) -> bool:
    with db.get_cursor() as cursor:
        sql = """
            INSERT INTO `partners` (
                `partner_id`,
                `contract_id`,
                `partnerName`,
                `address`,
                `phone`,
                `taxCode`
            ) VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(sql, (id, contractID, name, address, phone, taxCode))
        if bankID and bankAccount:
            cursor.execute(
                "INSERT INTO `partner_banks` (`partnerBanks_id`, `partner_id`, `bank_id`, `bankAccount`) VALUES (%s, %s, %s, %s)",
                (str(uuid.uuid4()), id, bankID, bankAccount),
            )
        return cursor.rowcount > 0


def delete_partner(contractID: str) -> bool:
    with db.get_cursor() as cursor:
        cursor.execute(
            "DELETE FROM `partner_banks` WHERE `partner_id` IN (SELECT `partner_id` FROM `partners` WHERE `contract_id` = %s)",
            (contractID,),
        )
        cursor.execute("DELETE FROM `partners` WHERE `contract_id` = %s", (contractID,))
        return cursor.rowcount > 0


def delete_partner_by_id(partner_id: str) -> bool:
    with db.get_cursor() as cursor:
        cursor.execute("DELETE FROM `partner_banks` WHERE `partner_id` = %s", (partner_id,))
        cursor.execute("DELETE FROM `partners` WHERE `partner_id` = %s", (partner_id,))
        return cursor.rowcount > 0


def get_partners_with_contract_id(contractID: str):
    with db.get_cursor() as cursor:
        sql = """
            SELECT
                p.`partner_id`,
                p.`contract_id`,
                p.`partnerName`,
                p.`address`,
                p.`phone`,
                p.`taxCode`,
                pb.`bank_id` AS `bankID`,
                pb.`bankAccount`
            FROM `partners` p
            LEFT JOIN `partner_banks` pb ON pb.`partner_id` = p.`partner_id`
            WHERE p.`contract_id` = %s
        """
        cursor.execute(sql, (contractID,))
        return cursor.fetchall()


def update_partner(
    partner_id: str,
    contract_id: str,
    partner_name: str,
    address: str | None = None,
    phone: str | None = None,
    taxCode: str | None = None,
    bankID: str | None = None,
    bankAccount: str | None = None,
):
    with db.get_cursor() as cursor:
        sql = """
            UPDATE `partners` SET
                `contract_id` = %s,
                `partnerName` = %s,
                `address` = %s,
                `phone` = %s,
                `taxCode` = %s
            WHERE `partner_id` = %s
        """
        cursor.execute(sql, (contract_id, partner_name, address, phone, taxCode, partner_id))
        cursor.execute("DELETE FROM `partner_banks` WHERE `partner_id` = %s", (partner_id,))
        if bankID and bankAccount:
            cursor.execute(
                "INSERT INTO `partner_banks` (`partnerBanks_id`, `partner_id`, `bank_id`, `bankAccount`) VALUES (%s, %s, %s, %s)",
                (str(uuid.uuid4()), partner_id, bankID, bankAccount),
            )
        return True
