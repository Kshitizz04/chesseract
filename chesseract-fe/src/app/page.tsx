"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/home");
  }, [router]);
  
  return (
    <div className="h-screen flex items-center justify-center w-screen">
      <div className="w-40 h-40 animate-slow-grow">
        Logo goes here
      </div>
    </div>
  );
}
