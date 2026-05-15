import { Outlet } from "react-router-dom";
import BasicFooter from "../components/ui/BasicFooter";
import BasicHeader from "../components/ui/BasicHeader";

export default function BasicLayout() {
    return (
        <>
            <BasicHeader />
            
            <div className="h-[70vh] overflow-auto bg-[#F5F7FA]">
                <Outlet />
            </div>

            <BasicFooter />
        </>
    )
}