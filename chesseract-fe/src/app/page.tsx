"use client";
import { getLocalStorage } from "@/utils/localstorage";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


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
      <div className="w-40 h-40 flex items-center justify-center animate-slow-grow">
        Logo goes here
      </div>
    </div>
  );
}
