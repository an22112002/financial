import type { ButtonData } from "../../types/UIType"

type NavigateBarProps = {
    state: boolean;
    buttons?: ButtonData[];
}

export default function NavigateBar(data: NavigateBarProps) {
    return (
        <div className={"h-full " + (data.state ? "w-[20vw]" : "hidden md:flex md:flex-col md:w-[5vw]") + " transition-all duration-300"}>
            {data.buttons?.map((button, index) => (
                <>
                    <div key={index} className={`w-full h-[10vh] text-[1.25rem] flex flex-row items-center ${data.state ? 'md:justify-start justify-center' : 'justify-center'} px-5 hover:bg-[#16A34A] cursor-pointer`} onClick={button.activate}>
                        {button.icon}
                        {data.state && (<span className="hidden md:block">&nbsp;{button.title}</span>)}
                    </div>
                    {index !== data.buttons!.length - 1 && <div className="w-full h-[1px] bg-[#16A34A]" />}
                </>
            ))}
        </div>
    )
}   