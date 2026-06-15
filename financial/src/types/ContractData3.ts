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
    id?: number;
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
    type: "date" | "condition";
    isConditionMet?: boolean; // chỉ có khi type là "condition"
    date: string | null;
    delay: number; // số ngày trễ sau khi điều kiện được đáp ứng hoặc sau ngày được chỉ định
    condition: string | null;
}

export type FinishMoment = {
    type: "date" | "forever";
    date?: string | null; // chỉ có khi type là "date"
    condition?: string | null; // chỉ có khi type là "forever"
}