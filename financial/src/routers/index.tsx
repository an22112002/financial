import { BrowserRouter, Routes, Route } from "react-router-dom";

import BasicLayout from "../layouts/BasicLayout";
import DashboardLayout from "../layouts/DashboardLayout";

import LoginContent from "../components/contents/LoginContent";
import DashboardContent from "../components/contents/DashBoardContent";
import SettingContent from "../components/contents/SettingContent";
import ContractContent from "../components/contents/ContractContent";
import DepartmentSelect from "../components/contents/ContractContents3/DepartmentSelect";
import ContractView from "../components/contents/ContractContents3/ContractView";
import DepartmentAction from "../components/contents/ContractContents3/DepartmentAction";
import PayableView from "../components/contents/ContractContents3/PayableView";

export default function Routers() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<BasicLayout />}>
                    <Route index element={<LoginContent />} />
                </Route>
                <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<DashboardContent />} />
                    <Route path="contractAndPayable" element={<ContractContent />} >
                        <Route index element={<DepartmentSelect />} />
                        <Route path="department" element={<DepartmentAction />} />
                        <Route path="contract" element={<ContractView />} />
                        <Route path="payable" element={<PayableView />} />
                    </Route>
                    {/* <Route path="partner" element={<PartnerContent />} />
                    <Route path="payment" element={<PaymentContent />} />
                    <Route path="analytic" element={<AnalyticContent />} /> */}
                    <Route path="setting" element={<SettingContent />} />
                </Route>
            </Routes>
        </BrowserRouter> 
    )   
}