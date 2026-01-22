import { AppEvent, PublicUser } from './data-model';

// Định nghĩa interface cho payload AccessToken
export interface AccessTokenPayload {
    sub: string; // User ID
    role: UserRole; // Vai trò người dùng
}

// Định nghĩa interface cho payload RefreshToken
export interface RefreshTokenPayload {
    sub: string; // User ID
    type: 'refresh'; // Loại token
    jti: string; // Token ID
}

// Định nghĩa kiểu dữ liệu chung cho payload token
export type TokenPayload = AccessTokenPayload | RefreshTokenPayload;

// Định nghĩa interface cho requester kế thừa từ AccessTokenPayload
export interface Requester extends AccessTokenPayload { }

// Định nghĩa interface cho requester kế thừa từ RefreshTokenPaylaod
export interface RequesterRefresh extends RefreshTokenPayload { }

export interface ReqWithRequester { requester: Requester } // Requester bắt buộc phải có
export interface ReqWithRequesterOpt { requester?: Requester } // Requester có thể không có

// Định nghĩa interface cho access token provider
export interface IAccessTokenProvider {
    // Tạo mã truy cập token
    generateToken(payload: AccessTokenPayload): Promise<string>;

    // Giải mã và xác thực token
    verifyToken(token: string): Promise<AccessTokenPayload | null>;
}

// Định nghĩa interface cho refresh token provider
export interface IRefreshTokenProvider {
    // Tạo mã làm mới token
    generateToken(payload: RefreshTokenPayload): Promise<string>;
    // Giải mã và xác thực token
    verifyToken(token: string): Promise<RefreshTokenPayload | null>;
}

// Định nghĩa interface cho token introspector
export type TokenIntrospectorResult<T extends TokenPayload> = {
    payload: T | null;
    error?: Error;
    isOk: boolean;
}

// Định nghĩa interface cho token introspector
export interface ITokenIntrospector<T extends TokenPayload> {
    // Kiểm tra token và trả về kết quả
    introspect(token: string): Promise<TokenIntrospectorResult<T>>;
}

// Định nghĩa các vai trò người dùng
export enum UserRole {
    ADMIN = 'admin',
    STAFF = 'staff',
    KITCHEN = 'kitchen',
    CUSTOMER = 'customer',
}

// Định nghĩa kiểu dữ liệu cho hàm xử lý sự kiện
export type EventHandler = (msg: string) => void;

// Định nghĩa interface cho publisher sự kiện
export interface IEventPublisher {
    // Xuất bản sự kiện
    publish<T>(event: AppEvent<T>): Promise<void>;
}

// Định nghĩa interface cho Caching
export interface ICacheService {
    // Lấy giá trị từ cache
    get(key: string): Promise<string | null>;

    // Lưu giá trị vào cache với thời gian hết hạn
    set(key: string, value: string, ttl?: number): Promise<void>;

    // Cập nhật giá trị trong cache
    update(key: string, value: string, ttl?: number): Promise<void>;

    // Xóa giá trị khỏi cache
    del(key: string): Promise<void>;

    // Xóa cache theo pattern
    delByPattern(pattern: string): Promise<void>;
}