import { AlignLeftOutlined } from "@ant-design/icons";

type Props = {
    changeOpenNav: () => void;
}

export default function DashboardHeader({ changeOpenNav }: Props) {
    return (
        <div className="w-full h-[15vh] bg-[#1E3A5F] flex flex-row items-center justify-start gap-5 px-5">
            <AlignLeftOutlined className="text-[2rem] hover:text-[#F0F0F0]" style={{cursor: "pointer"}} onClick={() => changeOpenNav()}/>
            <h1 className="text-2xl text-white font-bold ml-5">Dashboard</h1>
        </div>
    )
}