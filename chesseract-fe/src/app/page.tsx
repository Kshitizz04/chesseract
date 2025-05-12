"use client";
import { getLocalStorage } from "@/utils/localstorage";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LogoSvg from "@/assets/LogoSvg";


export default function Home() {
	const router = useRouter();

	useEffect(() => {
		const token = getLocalStorage<string>("token");
		if(token){
			router.replace("/home");
		}else{
			router.replace("/auth/sign-in");
		}
	}, [router]);
    
	return (
		<div className="h-screen flex items-center justify-center w-screen">
			<LogoSvg id="main" className="w-30"/>
		</div>
	);
}
