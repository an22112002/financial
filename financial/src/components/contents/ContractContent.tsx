
import { Outlet } from "react-router-dom";

export default function ContractContent() {
    return (
        <div className="flex flex-col p-2">

            <Outlet />
        </div>
    )
}