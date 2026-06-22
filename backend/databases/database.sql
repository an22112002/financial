SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS financial_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE financial_db;
-- Tables structure
CREATE TABLE `users`(
    `user_id` CHAR(36) PRIMARY KEY,
    `role` ENUM('admin', 'user') NOT NULL,
    `permit` SET("create_contract", 
        "edit_contract",
        "edit_status_contract", 
        "view_contract",
        "edit_payable", 
        "view_payable") NOT NULL,
    `username` VARCHAR(30) NOT NULL UNIQUE,
    `hashpass` VARCHAR(255) NOT NULL,
    `refreshToken` TEXT NULL,
    `refreshExpired` DATETIME NULL
);
CREATE TABLE `contracts`(
    `contract_id` CHAR(36) PRIMARY KEY,
    `department_id` CHAR(36) NOT NULL,
    `contractNumber` VARCHAR(50) NOT NULL,
    `contractCode` VARCHAR(50) NOT NULL,
    `version` INT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `content` TEXT NOT NULL,
    `signDate` DATE NOT NULL,
    `dateStart` DATE NOT NULL,
    `dateEnd` JSON NOT NULL,
    `userEdit` CHAR(36) NOT NULL,
    `status` ENUM(
        'waiting',
        'active',
        'completed',
        'terminated'
    ) NOT NULL,
    `createdAt` DATETIME NOT NULL
);
CREATE TABLE `files`(
    `file_id` CHAR(36) PRIMARY KEY,
    `paper_id` CHAR(36) NULL COMMENT 'id hợp đồng hoặc id thanh toán có điều kiện',
    `filename` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME NOT NULL,
    `position` JSON NOT NULL
);
CREATE TABLE `transactions`(
    `transaction_id` CHAR(36) PRIMARY KEY,
    `payable_id` CHAR(36) NULL,
    `fromAccount` VARCHAR(50) NOT NULL COMMENT 'bank account sent',
    `toAccount` VARCHAR(50) NOT NULL COMMENT 'bank account receive',
    `amount` BIGINT UNSIGNED NOT NULL,
    `dayExecute` DATETIME NOT NULL,
    `bankTransactionId` BIGINT NOT NULL
);
CREATE TABLE `bank`(
    `bank_id` INT PRIMARY KEY,
    `bankName` VARCHAR(255) NOT NULL,
    `bankShortName` VARCHAR(20) NOT NULL,
    `icon` VARCHAR(255) NOT NULL
);
CREATE TABLE `partner_banks`(
    `partnerBanks_id` CHAR(36) PRIMARY KEY,
    `partner_id` CHAR(36) NOT NULL,
    `bank_id` INT NOT NULL,
    `bankAccount` VARCHAR(50) NOT NULL
);
CREATE TABLE `payable`(
    `payable_id` CHAR(36) PRIMARY KEY,
    `contract_id` CHAR(36) NOT NULL,
    `partner_id` CHAR(36) NOT NULL,
    `type` ENUM('receive', 'pay') NOT NULL,
    `amount` BIGINT UNSIGNED NOT NULL ,
    `tax` DECIMAL(6,3) NOT NULL,
    `lateFee` DECIMAL(6,3) NOT NULL,
    `note` VARCHAR(255) NOT NULL,
    `moment` JSON NOT NULL COMMENT 'type: \"date\" | \"condition\";
        isConditionMet?: boolean; // chỉ có khi type là \"condition\"
        needDocument: boolean; // chỉ có khi type là \"condition\"
        documentCondition?: Document[]; // chỉ có khi type là \"condition\" và needDocument là true
        date: string | null;
        delay: number; // số ngày trễ sau khi điều kiện được đáp ứng hoặc sau ngày được chỉ định
        condition: string | null;'
);
CREATE TABLE `setting`(
    `id` INT NOT NULL PRIMARY KEY,
    `companyName` VARCHAR(255) NOT NULL
);
CREATE TABLE `departments`(
    `department_id` CHAR(36) PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL
);
CREATE TABLE `partners`(
    `partner_id` CHAR(36) PRIMARY KEY,
    `contract_id` CHAR(36) NOT NULL,
    `partnerName` VARCHAR(255) NOT NULL
);
-- Foreign Key Constraints
ALTER TABLE
    `contracts` ADD CONSTRAINT `contracts_department_id_foreign` FOREIGN KEY(`department_id`) REFERENCES `departments`(`department_id`);
ALTER TABLE
    `payable` ADD CONSTRAINT `payable_contract_id_foreign` FOREIGN KEY(`contract_id`) REFERENCES `contracts`(`contract_id`);
ALTER TABLE
    `partner_banks` ADD CONSTRAINT `partner_banks_partner_id_foreign` FOREIGN KEY(`partner_id`) REFERENCES `partners`(`partner_id`);
ALTER TABLE
    `payable` ADD CONSTRAINT `payable_partner_foreign` FOREIGN KEY(`partner_id`) REFERENCES `partners`(`partner_id`);
ALTER TABLE
    `partner_banks` ADD CONSTRAINT `partner_banks_bank_id_foreign` FOREIGN KEY(`bank_id`) REFERENCES `bank`(`bank_id`);
ALTER TABLE
    `transactions` ADD CONSTRAINT `transactions_payable_id_foreign` FOREIGN KEY(`payable_id`) REFERENCES `payable`(`payable_id`);
ALTER TABLE
    `contracts` ADD CONSTRAINT `contracts_useredit_foreign` FOREIGN KEY(`userEdit`) REFERENCES `users`(`user_id`);
ALTER TABLE
    `partners` ADD CONSTRAINT `partners_contract_id_foreign` FOREIGN KEY(`contract_id`) REFERENCES `contracts`(`contract_id`);

-- Indexes
-- USERS
CREATE INDEX idx_users_role 
ON users(role);

-- CONTRACTS
CREATE INDEX idx_contracts_department 
ON contracts(department_id);

CREATE INDEX idx_contracts_status 
ON contracts(status);

CREATE INDEX idx_contracts_contractNumber 
ON contracts(contractNumber);

CREATE INDEX idx_contracts_contractCode 
ON contracts(contractCode);

CREATE INDEX idx_contracts_createdAt 
ON contracts(createdAt);

-- FILES
CREATE INDEX idx_files_paper_id
ON files(paper_id);

-- TRANSACTIONS
CREATE INDEX idx_transactions_payable
ON transactions(payable_id);

CREATE INDEX idx_transactions_dayExecute
ON transactions(dayExecute);

CREATE INDEX idx_transactions_bankTransactionId
ON transactions(bankTransactionId);

-- PARTNER_BANKS
CREATE INDEX idx_partner_banks_partner
ON partner_banks(partner_id);

CREATE INDEX idx_partner_banks_bank
ON partner_banks(bank_id);

CREATE INDEX idx_partner_banks_account
ON partner_banks(bankAccount);

-- PAYABLE
CREATE INDEX idx_payable_contract
ON payable(contract_id);

CREATE INDEX idx_payable_partner
ON payable(partner_id);

CREATE INDEX idx_payable_type
ON payable(type);

-- PARTNERS
CREATE INDEX idx_partners_contract
ON partners(contract_id);

-- Insert default data
INSERT INTO `setting`(`id`, `companyName`) VALUES (1, 'Công ty cổ phần đầu tư và phát triển Ngân Lực NIAD');

INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (17, "Ngân hàng TMCP Công thương Việt Nam", "VietinBank", "/banks/VietinBank.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (43, "Ngân hàng TMCP Ngoại Thương Việt Nam", "Vietcombank", "/banks/Vietcombank.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (4, "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam", "BIDV", "/banks/BIDV.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (42, "Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam", "Agribank", "/banks/Agribank.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (26, "Ngân hàng TMCP Phương Đông", "OCB", "/banks/OCB.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (21, "Ngân hàng TMCP Quân đội", "MBBank", "/banks/MBBank.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (38, "Ngân hàng TMCP Kỹ thương Việt Nam", "Techcombank", "/banks/Techcombank.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (2, "Ngân hàng TMCP Á Châu", "ACB", "/banks/ACB.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (47, "Ngân hàng TMCP Việt Nam Thịnh Vượng", "VPBank", "/banks/VPBank.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (39, "Ngân hàng TMCP Tiên Phong", "TPBank", "/banks/TPBank.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (36, "Ngân hàng TMCP Sài Gòn Thương Tín", "Sacombank", "/banks/Sacombank.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (12, "Ngân hàng TMCP Phát triển Thành phố Hồ Chí Minh", "HDBank", "/banks/HDBank.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (44, "Ngân hàng TMCP Bản Việt", "VietCapitalBank", "/banks/VietCapitalBank.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (31, "Ngân hàng TMCP Sài Gòn", "SCB", "/banks/SCB.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (45, "Ngân hàng TMCP Quốc tế Việt Nam", "VIB", "/banks/VIB.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (35, "Ngân hàng TMCP Sài Gòn - Hà Nội", "SHB", "/banks/SHB.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (10, "Ngân hàng TMCP Xuất Nhập khẩu Việt Nam", "Eximbank", "/banks/Eximbank.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (22, "Ngân hàng TMCP Hàng Hải Việt Nam", "MSB", "/banks/MSB.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (53, "TMCP Việt Nam Thịnh Vượng - Ngân hàng số CAKE by VPBank", "CAKE", "/banks/CAKE.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (54, "TMCP Việt Nam Thịnh Vượng - Ngân hàng số Ubank by VPBank", "Ubank", "/banks/Ubank.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (57, "Tổng Công ty Dịch vụ số Viettel - Chi nhánh tập đoàn công nghiệp viễn thông Quân Đội", "ViettelMoney", "/banks/ViettelMoney.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (58, "Ngân hàng số Timo by Ban Viet Bank (Timo by Ban Viet Bank)", "Timo", "/banks/Timo.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (56, "VNPT Money", "VNPTMoney", "/banks/VNPTMoney.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (34, "Ngân hàng TMCP Sài Gòn Công Thương", "SaigonBank", "/banks/SaigonBank.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (3, "Ngân hàng TMCP Bắc Á", "BacABank", "/banks/BacABank.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (65, "CTCP Dịch Vụ Di Động Trực Tuyến", "MoMo", "/banks/MoMo.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (64, "Ngân hàng TMCP Đại Chúng Việt Nam Ngân hàng số", "PVcomBank Pay", "/banks/PVcomBank Pay.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (30, "Ngân hàng TMCP Đại Chúng Việt Nam", "PVcomBank", "/banks/PVcomBank.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (27, "Ngân hàng TNHH MTV Việt Nam Hiện Đại", "MBV", "/banks/MBV.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (24, "Ngân hàng TMCP Quốc Dân", "NCB", "/banks/NCB.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (37, "Ngân hàng TNHH MTV Shinhan Việt Nam", "ShinhanBank", "/banks/ShinhanBank.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (1, "Ngân hàng TMCP An Bình", "ABBANK", "/banks/ABBANK.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (41, "Ngân hàng TMCP Việt Á", "VietABank", "/banks/VietABank.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (23, "Ngân hàng TMCP Nam Á", "NamABank", "/banks/NamABank.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (29, "Ngân hàng TMCP Thịnh vượng và Phát triển", "PGBank", "/banks/PGBank.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (46, "Ngân hàng TMCP Việt Nam Thương Tín", "VietBank", "/banks/VietBank.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (5, "Ngân hàng TMCP Bảo Việt", "BaoVietBank", "/banks/BaoVietBank.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (33, "Ngân hàng TMCP Đông Nam Á", "SeABank", "/banks/SeABank.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (52, "Ngân hàng Hợp tác xã Việt Nam", "COOPBANK", "/banks/COOPBANK.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (20, "Ngân hàng TMCP Lộc Phát Việt Nam", "LPBank", "/banks/LPBank.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (19, "Ngân hàng TMCP Kiên Long", "KienLongBank", "/banks/KienLongBank.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (55, "Ngân hàng Đại chúng TNHH Kasikornbank", "KBank", "/banks/KBank.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (62, "Công ty Tài chính TNHH MTV Mirae Asset (Việt Nam) ", "MAFC", "/banks/MAFC.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (13, "Ngân hàng TNHH MTV Hong Leong Việt Nam", "HongLeong", "/banks/HongLeong.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (61, "Ngân hàng KEB Hana – Chi nhánh Hà Nội", "KEBHANAHN", "/banks/KEBHANAHN.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (60, "Ngân hàng KEB Hana – Chi nhánh Thành phố Hồ Chí Minh", "KEBHanaHCM", "/banks/KEBHanaHCM.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (59, "Ngân hàng Citibank, N.A. - Chi nhánh Hà Nội", "Citibank", "/banks/Citibank.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (6, "Ngân hàng Thương mại TNHH MTV Xây dựng Việt Nam", "CBBank", "/banks/CBBank.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (7, "Ngân hàng TNHH MTV CIMB Việt Nam", "CIMB", "/banks/CIMB.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (8, "DBS Bank Ltd - Chi nhánh Thành phố Hồ Chí Minh", "DBSBank", "/banks/DBSBank.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (9, "Ngân hàng TNHH MTV Số Vikki", "Vikki", "/banks/Vikki.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (63, "Ngân hàng Chính sách Xã hội", "VBSP", "/banks/VBSP.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (11, "Ngân hàng Thương mại TNHH MTV Dầu Khí Toàn Cầu", "GPBank", "/banks/GPBank.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (51, "Ngân hàng Kookmin - Chi nhánh Thành phố Hồ Chí Minh", "KookminHCM", "/banks/KookminHCM.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (50, "Ngân hàng Kookmin - Chi nhánh Hà Nội", "KookminHN", "/banks/KookminHN.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (49, "Ngân hàng TNHH MTV Woori Việt Nam", "Woori", "/banks/Woori.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (48, "Ngân hàng Liên doanh Việt - Nga", "VRB", "/banks/VRB.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (14, "Ngân hàng TNHH MTV HSBC (Việt Nam)", "HSBC", "/banks/HSBC.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (15, "Ngân hàng Công nghiệp Hàn Quốc - Chi nhánh Hà Nội", "IBKHN", "/banks/IBKHN.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (16, "Ngân hàng Công nghiệp Hàn Quốc - Chi nhánh TP. Hồ Chí Minh", "IBKHCM", "/banks/IBKHCM.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (18, "Ngân hàng TNHH Indovina", "IndovinaBank", "/banks/IndovinaBank.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (40, "Ngân hàng United Overseas - Chi nhánh TP. Hồ Chí Minh", "UnitedOverseas", "/banks/UnitedOverseas.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (25, "Ngân hàng Nonghyup - Chi nhánh Hà Nội", "Nonghyup", "/banks/Nonghyup.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (32, "Ngân hàng TNHH MTV Standard Chartered Bank Việt Nam", "StandardChartered", "/banks/StandardChartered.png");
INSERT INTO `bank`(`bank_id`, `bankName`, `bankShortName`, `icon`) VALUES (28, "Ngân hàng TNHH MTV Public Việt Nam", "PublicBank", "/banks/PublicBank.png");
