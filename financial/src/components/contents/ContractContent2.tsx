import { Outlet } from "react-router-dom";

export default function ContractContents() {
    return (
        <div className="flex flex-col p-2">
            
            <Outlet />
        </div>
    )
}