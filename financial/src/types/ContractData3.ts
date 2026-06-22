export type Document = {
    id: string;
    name: string;
    fileType: "pdf" | "docx" | "xlsx" | "txt" | "jpg" | "png";
    url: string;
}

export type Department = {
    departmentID: number;
    name: string;
}

export type ContractStatus = "waiting" | "active" | "completed" | "terminated";

export type Contract = {
    contractID: string;
    contractCode: string;
    contractNumber: string;
    version: number;
    title: string;
    contractContent: string;
    signDate: string;
    startDate: string;
    finishDate: FinishMoment;
    status: ContractStatus;
    userEdit: string;
    partner: string[];
    payables : Payable[];
    documents: Document[];
}

export type ContractData = {
    contractCode: string;
    department: Department;
    versions: Contract[];
}

export type Payable = {
    id?: string;
    amount: number;
    partner: string;
    type: "receive" | "pay";
    tax: number;
    lateFee: number;
    note: string;
    moment: Moment;
    id_payment?: string;
    
}

export type Moment = {
    id?: string; // chỉ khi được lưu và type là "condition"
    type: "date" | "condition";
    isConditionMet?: boolean; // chỉ có khi type là "condition"
    needDocument: boolean; // chỉ có khi type là "condition"
    documentCondition?: Document[]; // chỉ có khi type là "condition" và needDocument là true
    date: string | null;
    delay: number; // số ngày trễ sau khi điều kiện được đáp ứng hoặc sau ngày được chỉ định
    condition: string | null;
}

export type FinishMoment = {
    type: "date" | "forever";
    date?: string | null; // chỉ có khi type là "date"
    condition?: string | null; // chỉ có khi type là "forever"
}

export type PayableEditData = {
    id: number;
    totalAmount: number;
    contractID: string;
    contractTitle: string;
    partner: string;
    type: "receive" | "pay";
    originalPayDate: Moment;
    note: string;
    lateFee: number;
    delay: number;
    status: "overdue" | "paid" | "not_enough" | "waiting" |"pending";
    payment: Payment[];
}

export type Payment = {
    id: string;
    type: "cash" | "bank";
    time: string;
    amount: number;
    document: Document[];
}