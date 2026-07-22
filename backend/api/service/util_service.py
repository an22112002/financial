from api.crud.util_crud import get_our_side, get_banks

def contractConfig():
    banks = get_banks()
    b_list = []
    for bank in banks:
        b_list.append({
            "bankID": str(bank["bank_id"]),
            "name": bank["bankName"],
            "bankShortName": bank["bankShortName"],
            "icon": bank["icon"]
        })
    response = {
        "ourSide": get_our_side(),
        "banks": b_list
    }
    return response