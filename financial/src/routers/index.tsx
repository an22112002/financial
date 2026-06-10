import { BrowserRouter, Routes, Route } from "react-router-dom";

import BasicLayout from "../layouts/BasicLayout";
import DashboardLayout from "../layouts/DashboardLayout";

import LoginContent from "../components/contents/LoginContent";
import DashboardContent from "../components/contents/DashBoardContent";
import PaymentContent from "../components/contents/PaymentContent";
import AnalyticContent from "../components/contents/AnalyticContent";
import SettingContent from "../components/contents/SettingContent";
import ContractContent2 from "../components/contents/ContractContent2";
import DepartmentSelect from "../components/contents/ContractContents2/DepartmentSelect";
import ContractEdit from "../components/contents/ContractContents2/ContractEdit";
import PartnerContent from "../components/contents/PartnerContent";
import PayableEdit from "../components/contents/ContractContents2/PayableEdit";

export default function Routers() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<BasicLayout />}>
                    <Route index element={<LoginContent />} />
                </Route>
                <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<DashboardContent />} />
                    <Route path="contract" element={<ContractContent2 />} >
                        <Route index element={<DepartmentSelect />} />
                        <Route path="edit/:id" element={<ContractEdit />} />
                        <Route path="payable/:id" element={<PayableEdit />} />
                    </Route>
                    <Route path="partner" element={<PartnerContent />} />
                    <Route path="payment" element={<PaymentContent />} />
                    <Route path="analytic" element={<AnalyticContent />} />
                    <Route path="setting" element={<SettingContent />} />
                </Route>
            </Routes>
        </BrowserRouter> 
    )   
}