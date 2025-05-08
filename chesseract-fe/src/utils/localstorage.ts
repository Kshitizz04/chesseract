export const setLocalStorage = (key: string, value: unknown): void => {
    if (typeof window !== "undefined") {
        try {
            // Handle strings directly, stringify everything else
            if (typeof value === "string") {
                localStorage.setItem(key, value);
            } else {
                localStorage.setItem(key, JSON.stringify(value));
            }
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    }
};

export const getLocalStorage = <T>(key: string): T | null => {
    if (typeof window !== "undefined") {
        try {
            const item = localStorage.getItem(key);
            if (item === null) return null;
            
            // Try to parse as JSON, if it fails return the raw string
            try {
                return JSON.parse(item) as T;
            } catch (e) {
                return item as unknown as T;
            }
        } catch (error) {
            console.error(`Error getting localStorage key "${key}":`, error);
            return null;
        }
    }
    return null; // Return null when window is undefined (during SSR)
};

export const removeLocalStorage = (key: string): void => {
    if (typeof window !== "undefined") {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing localStorage key "${key}":`, error);
        }
    }
};