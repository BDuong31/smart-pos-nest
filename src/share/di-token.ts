export const TOKEN_INTROSPECTOR = Symbol('TOKEN_INTROSPECTOR'); // Token để tiêm phụ thuộc cho trình kiểm tra token
export const REMOTE_AUTH_GUARD = Symbol('REMOTE_AUTH_GUARD'); // Token để tiêm phụ thuộc cho guard xác thực từ xa
export const MESSAGE_SERVICE = Symbol('MESSAGE_SERVICE'); // Token để tiêm phụ thuộc cho dịch vụ tin nhắn
export const EVENT_PUBLISHER = Symbol('EVENT_PUBLISHER'); // Token để tiêm phụ thuộc cho nhà xuất bản sự kiện
export const CACHE_SERVICE = Symbol('CACHE_SERVICE'); // Token để tiêm phụ thuộc cho dịch vụ cache
export const MONGO_SERVICE = Symbol('MONGO_SERVICE'); // Token để tiêm phụ thuộc cho dịch vụ MongoDB