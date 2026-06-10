import img from "../../assets/images/login_img2.jpg";

import LoginForm from "../forms/LoginForm";

export default function LoginContent() {
    return (
        <div className="flex flex-row w-full h-full items-center">
            <div
                className="w-full h-full flex items-center justify-center bg-cover bg-center"
                style={{ backgroundImage: `url(${img})` }}
            >
                <div className="w-[50%] md:w-[35%] bg-gray-400/75 rounded-[30px] p-10 flex flex-col gap-5">
                    <LoginForm />
                </div>
            </div>
            
        </div>
    )
}