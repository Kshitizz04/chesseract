"use client";
import { getLocalStorage } from "@/utils/localstorage";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import NavigationLoader from "@/components/NavigationLoader";


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
		<NavigationLoader/>
	);
}
