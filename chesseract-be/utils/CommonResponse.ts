interface CommonResponse<T> {
    success: boolean;
    message: string;
    data?: T;
}
export default CommonResponse;