import { Response } from 'express';
import { ZodError } from 'zod';

// Xử lý lỗi
export class AppError extends Error {
    private statusCode: number;
    private rootCause?: Error;

    private details: Record<string, any> = {};
    private logMessage?: string;

    private constructor(err: Error){
        super(err.message);
    }

    // Phương thức tạo
    static from(err: Error, statusCode: number = 500) {
        const appError = new AppError(err);
        appError.statusCode = statusCode;
        return appError;
    }

    // Lấy lỗi gốc
    getRootCause(): Error | null {
        if (this.rootCause) {
            return this.rootCause instanceof AppError ? this.rootCause.getRootCause() : this.rootCause;
        }
        return null;
    }

    // Bao bọc lỗi
    wrap(rootCause: Error): AppError {
        const appError = AppError.from(this, this.statusCode);
        appError.rootCause = rootCause;
        return appError;
    }

    // Thêm chi tiết vào lỗi
    withDetail(key: string, value: any): AppError {
        this.details[key] = value;
        return this;
    }

    // Thêm thông báo vào lỗi
    withLog(logMessage: string): AppError {
        this.logMessage = logMessage;
        return this;
    }

    // Thêm thông báo vào lỗi
    withMessage(message: string): AppError {
        this.message = message;
        return this;
    }

    // Chuyển đổi lỗi thành JSON
    toJSON(isProduction: boolean = true){
        const rootCause = this.getRootCause();

        return isProduction ? {
            message: this.message,
            statusCode: this.statusCode,
            details: this.details
        } : {
            message: this.message,
            statusCode: this.statusCode,
            rootCause: rootCause ? rootCause.message : this.message,
            details: this.details,
            logMessage: this.logMessage,
        };
    }

    // Lấy mã trạng thái
    getStatusCode(): number {
        return this.statusCode;
    }
}

// Hàm tiện ích xử lý lỗi
export const responseErr = (err: Error, res: Response) => {
    const isProduction = process.env.NODE_ENV === 'production';
    !isProduction && console.error(err.stack);

    // xử lý lỗi
    if (err instanceof AppError) {
        const appErr = err as AppError;
        res.status(appErr.getStatusCode()).json(appErr.toJSON(isProduction));
        return;
    }

    // xử lý lỗi Zod
    if (err instanceof ZodError) {
        const zErr = err as ZodError;
        const appErr = ErrInvalidRequest.wrap(zErr);

        // thêm chi tiết lỗi từ Zod
        zErr.issues.forEach((issue) => {
            appErr.withDetail(issue.path.join('.'), issue.message);
        });

        // trả về lỗi
        res.status(appErr.getStatusCode()).json(appErr.toJSON(isProduction));
        return;
    }

    // xử lý lỗi khác
    const appErr = ErrInternalServer.wrap(err);
    res.status(appErr.getStatusCode()).json(appErr.toJSON(isProduction));
};

export const ErrInternalServer = AppError.from(new Error('Something went wrong, please try again later.'), 500); // Lỗi máy chủ nội bộ
export const ErrBadGateway = AppError.from(new Error('Bad gateway.'), 502); // Lỗi cổng xấu
export const ErrServiceUnavailable = AppError.from(new Error('Service unavailable.'), 503); // Lỗi dịch vụ không khả dụng
export const ErrGatewayTimeout = AppError.from(new Error('Gateway timeout.'), 504); // Lỗi hết thời gian chờ cổng
export const ErrInvalidRequest = AppError.from(new Error('Invalid request.'), 400); // Lỗi yêu cầu không hợp lệ
export const ErrUnauthorized = AppError.from(new Error('Unauthorized.'), 401); // Lỗi không xác thực
export const ErrForbidden = AppError.from(new Error('Forbidden.'), 403); // Lỗi bị cấm truy cập
export const ErrNotFound = AppError.from(new Error('Resource not found.'), 404); // Lỗi không tìm thấy tài nguyên
export const ErrMethodNotAllowed = AppError.from(new Error('Method not allowed.'), 405); // Lỗi phương thức không được phép
export const ErrConflict = AppError.from(new Error('Conflict occurred.'), 409); // Lỗi xung đột
export const ErrUnprocessable = AppError.from(new Error('Unprocessable entity.'), 422); // Lỗi thực thể không thể xử lý
export const ErrTooManyRequests = AppError.from(new Error('Too many requests.'), 429); // Lỗi quá nhiều yêu cầu

export const ErrTokenInvalid = AppError.from(new Error('Token is invalid.'), 401); // Lỗi token không hợp lệ