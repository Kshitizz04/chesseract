import { useRouter } from "next/navigation";
import { getLocalStorage } from "../localstorage";

const useUserRedirection = () => {
    const router = useRouter();

    return (userId: number, pathName: string) => {
        const loggedInUserId = getLocalStorage("userId");

        if (loggedInUserId == userId.toString() && pathName.includes("home/friends")) {
            return null;
        } else {
            router.push(`${pathName}`);
        }
    };
};

export default useUserRedirection;