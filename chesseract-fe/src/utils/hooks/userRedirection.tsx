import { useRouter } from "next/navigation";
import { getLocalStorage } from "../localstorage";

const useUserRedirection = () => {
    const router = useRouter();

    return (userId: string, pathName: string) => {
        const loggedInUserId = getLocalStorage("userId");

        if (loggedInUserId == userId.toString() && pathName.includes("home/users")) {
            return null;
        } else {
            router.push(`${pathName}`);
        }
    };
};

export default useUserRedirection;