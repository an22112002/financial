export type Document = {
    id: string;
    name: string;
    fileType: "pdf" | "docx" | "xlsx" | "txt" | "jpg" | "png";
    url: string;
}

export type Contract = {
    contractCode: string;
    title: string;
    contractContent: string;
    signDate: string;
    status: string; // "active", "pending", "expired"
    documents: Document[];
}

export type ServiceContract = Contract & {
    contractObject: string;
    startDate: string;
    duration: number;
    durationUnit: "day" | "month" | "year";
    endDate: string;
    unitPrice: number;
    tax: number;
    paytime: number;
    lateTime: number;
    latePee: number;
    collectionMethod: string;
    partner: string; // tên đối tác
    department: string; // tên bộ phận
    payments: Payable[];
}

export type FreeContract = Contract & {
    startDate: string;
    duration: number;
    durationUnit: "day" | "month" | "year";
    endDate: string;
    partner: string[]; // tên đối tác

    payments: FreeContractPayable[];
}

export type FreeContractPayable = Payable & {
    tax: number;
    latePee: number;
}

export type Receiver = {
    id: number;
    name: string;
    bankAccount: string;
    amount: number;
    paytime: string;
}

export type ReceiverPayment = {
    partner: string;
    originalAmount: number;
    originalPaytime: string;
    late: string;
    latePee: number;
    receivers: Receiver[];
    totalRecived: number;
    status: "paided" | "not_enough" | "overflow" | "overdue";
}

export type Payable = {
    partner: string;
    amount: number;
    paytime: string;
    lastTime: string;
    status: string;
}

export type ContractVersion = {
    version: number;
    contract: ServiceContract | FreeContract;
}

export type ContractData = {
    type: "service" | "free";
    id: number;
    constructs: ContractVersion[];
    recevices: Payable[];
    debts: Payable[];
}