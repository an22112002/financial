import img from "../../assets/images/login_img.jpg";

import LoginForm from "../forms/LoginForm";

export default function LoginContent() {
    return (
        <div className="flex flex-row w-full h-full items-center">
            <img className="w-[50%] md:w-[65%] h-full rounded-tl-[20%] rounded-br-[20%] p-2" src={img} alt="Login" />
            <div className="w-[50%] md:w-[35%] h-[95%] bg-[#22C55E] rounded-tl-[30px] rounded-bl-[30px]">
                <LoginForm />
            </div>
        </div>
    )
}