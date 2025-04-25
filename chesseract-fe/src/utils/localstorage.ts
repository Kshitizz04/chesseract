export const setLocalStorage = (key: string, value: unknown): void => {
    if (typeof window !== "undefined") {
        localStorage.setItem(key, JSON.stringify(value));
    }
};

export const getLocalStorage = <T>(key: string): T | null => {
    if (typeof window !== "undefined") {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    }
    return null; // Return null when window is undefined (during SSR)
};

export const removeLocalStorage = (key: string): void => {
    if (typeof window !== "undefined") {
        localStorage.removeItem(key);
    }
};