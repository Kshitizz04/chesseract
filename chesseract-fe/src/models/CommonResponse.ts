interface CommonResponse<T> {
    success: boolean;
    message: string;
    error?: string;
    data?: T;
}