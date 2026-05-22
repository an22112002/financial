
// 12 -> 12, 12.3 -> 12.3, 1,234 -> 1234, 1.234,567 -> 1234.567
export function parseNumber(value: string): number {
    if (!value) return 0;

    // Xóa dấu phẩy
    const cleaned = value.replace(/,/g, "");

    return parseFloat(cleaned) || 0;
}

export function randomString(length: number) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
}

export function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function getFirstDayOfMonth() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
}

export function getCurrentMonth() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${month}/${year}`;
}

export function getCurrentYear() {
    const today = new Date();
    const year = today.getFullYear();
    return `${year}`;
}

export function displayDate(date: Date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
}

export function createCodeContract(template: string) : string {
    const now = new Date();
    // Lấy ngày hiện tại theo định dạng ddMMyy
    const code_date = `${String(now.getDate()).padStart(2, "0")}${String(now.getMonth() + 1).padStart(2, "0")}${now.getFullYear().toString().slice(-2)}`;
    return template.replace("{date}", code_date);
}

export function more30DayFromNow() : Date {
    const now = new Date();
    now.setDate(now.getDate() + 30);
    return now;
}

export function getTitle(position_in_length: number) : string {
    if (position_in_length < 0 || position_in_length >= 26) return "";
    const titles = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
    return `Bên ${titles[position_in_length]}`;
}