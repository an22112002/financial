import type { Moment, Payable } from "../types/ContractData3";
// import openNotification from "./index";

export function getMomentDate(moment: Moment): Date | null {
    if (moment.type === "date") {
        return moment.date;
    } else if (moment.type === "condition") {
        if (moment.isConditionMet) {
            const date = moment.date ? new Date(moment.date) : new Date();
            date.setDate(date.getDate() + moment.delay);
            return date;
        } else {
            return null;
        }
    }
    return null;
}

export function isPartnerJoin(partner: string, payable: Payable[]): boolean {
    for (const pay of payable) {
        if (pay.partner === partner) {
            // openNotification("warning", "Đối tác đã tồn tại trong danh sách khoản phải thu/phải trả");
            return true;
        }
    }
    return false;
}