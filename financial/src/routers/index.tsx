import { BrowserRouter, Routes, Route } from "react-router-dom";

import BasicLayout from "../layouts/BasicLayout";
import DashboardLayout from "../layouts/DashboardLayout";

import LoginContent from "../components/contents/LoginContent";
import DashboardContent from "../components/contents/DashBoardContent";
import PaymentContent from "../components/contents/PaymentContent";
import AnalyticContent from "../components/contents/AnalyticContent";
import SettingContent from "../components/contents/SettingContent";

export default function Routers() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<BasicLayout />}>
                    <Route index element={<LoginContent />} />
                </Route>
                <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route index element={<DashboardContent />} />
                    <Route path="payment" element={<PaymentContent />} />
                    <Route path="analytic" element={<AnalyticContent />} />
                    <Route path="setting" element={<SettingContent />} />
                </Route>
            </Routes>
        </BrowserRouter> 
    )   
}