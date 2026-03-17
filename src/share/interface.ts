import { AppEvent, PublicCategory, PublicImage, PublicProduct, PublicVariant, PublicRank, PublicShift, PublicUser, PublicOptionGroup, PublicOptionItem, PublicProductOptionConfig, PublicCombo, PublicComboItem, PublicSupplier, PublicUnitConversion, PublicIngredient, PublicInventoryBatch, PublicRecipe, PublicImportInvoice, PublicImportInvoiceDetail, PublicPurchaseProposal, PublicPurchaseProposalDetail, PublicStockCheck, PublicStockCheckDetail, PublicZone, PublicTable, PublicReservation, PublicCart, PublicCartItem, PublicCartItemOption, PublicVoucher, PublicOrder, PublicOrderVoucher, PublicOrderTable, PublicOrderItem, PublicOrderItemOption, PublicPaymentTransaction, PublicInvoice } from './data-model';

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
    generateToken(payload: AccessTokenPayload, expiresIn?: string | number): Promise<string>;

    // Giải mã và xác thực token
    verifyToken(token: string): Promise<AccessTokenPayload | null>;
}

// Định nghĩa interface cho refresh token provider
export interface IRefreshTokenProvider {
    // Tạo mã làm mới token
    generateToken(payload: RefreshTokenPayload, expiresIn?: string | number): Promise<string>;
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

// Định nghĩa interface cho User RPC
export interface IPublicUserRpc {
    getUserById(id: string): Promise<PublicUser | null>;
    getUsersByIds(ids: string[]): Promise<PublicUser[]>;
}

// Định nghĩa interface cho Shifts RPC
export interface IPublicShiftRpc {
    getCurrentShift(userId: string): Promise<PublicShift | null>;
    getShiftDetail(shiftId: string): Promise<PublicShift | null>;
    isUserWorking(userId: string): Promise<boolean>;
}

// Định nghĩa interface cho Loyalty RPC
export interface IPublicLoyaltyRpc {
    getUserRank(id: string): Promise<PublicRank | null>;
    getUserRanksByIds(ids: string[]): Promise<PublicRank[]>;
}

// Định nghĩa interface cho Category RPC
export interface IPublicCategoryRpc {
    findById(id: string): Promise<PublicCategory | null>;
    findByIds(ids: string[]): Promise<PublicCategory[] | null>;
}

// Định nghĩa interface cho Product RPC
export interface IPublicProductRpc {
    findById(id: string): Promise<PublicProduct | null>;
    findByIds(ids: string[]): Promise<PublicProduct[] | null>;
}

// Định nghĩa interface cho Variant RPC
export interface IPublicVariantRpc {
    findById(id: string): Promise<PublicVariant | null>;
    findByIds(ids: string[]): Promise<PublicVariant[] | null>;
}

// Định nghĩa interface cho Option Group RPC
export interface IPublicOptionGroupRpc {
    findById(id: string): Promise<PublicOptionGroup | null>;
    findByIds(ids: string[]): Promise<PublicOptionGroup[] | null>;
}

// Định nghĩa interface cho Option Item RPC
export interface IPublicOptionItemRpc {
    findById(groupId: string, id: string): Promise<PublicOptionItem | null>;
    findByIds(groupId: string, ids: string[]): Promise<PublicOptionItem[] | null>;
}

// Định nghĩa interface cho Product Option Config RPC
export interface IPublicProductOptionConfigRpc {
    getConfigByProductId(productId: string): Promise<PublicProductOptionConfig | null>;
}

// Định nghĩa interface cho Combo RPC
export interface IPublicComboRpc {
    findById(id: string): Promise<PublicCombo | null>;
    findByIds(ids: string[]): Promise<PublicCombo[] | null>;
}

// Định nghĩa interface cho Combo Item RPC
export interface IPublicComboItemRpc {
    findById(id: string): Promise<PublicComboItem | null>;
    findByIds(ids: string[]): Promise<PublicComboItem[] | null>;
}

// Định nghĩa interface cho Supplier RPC
export interface IPublicSupplierRpc {   
    findById(id: string): Promise<PublicSupplier | null>;
    findByIds(ids: string[]): Promise<PublicSupplier[] | null>;
}

// Định nghĩa interface cho Ingredient RPC
export interface IPublicIngredientRpc {
    findById(id: string): Promise<PublicIngredient | null>;
    findByIds(ids: string[]): Promise<PublicIngredient[] | null>;
}

// Định nghĩa interface cho Unit Conversion RPC
export interface IPublicUnitConversionRpc {
    findById(id: string): Promise<PublicUnitConversion | null>;
    findByIds(ids: string[]): Promise<PublicUnitConversion[] | null>;  
}

// Định nghĩa interface cho Inventory Batch RPC
export interface IPublicInventoryBatchRpc {
    findById(id: string): Promise<PublicInventoryBatch | null>;
    findByIds(ids: string[]): Promise<PublicInventoryBatch[] | null>;
}

// Định nghĩa interface cho Recipe RPC
export interface IPublicRecipeRpc {
    findById(id: string): Promise<PublicRecipe | null>;
    findByIds(ids: string[]): Promise<PublicRecipe[] | null>;
}

// Định nghĩa interface cho Import Invoice RPC
export interface IPublicImportInvoiceRpc {
    findById(id: string): Promise<PublicImportInvoice | null>;
    findByIds(ids: string[]): Promise<PublicImportInvoice[] | null>;
}

// Định nghĩa interface cho Import Invoice Detail RPC
export interface IPublicImportInvoiceDetailRpc {
    findById(id: string): Promise<PublicImportInvoiceDetail | null>;
    findByIds(ids: string[]): Promise<PublicImportInvoiceDetail[] | null>;
}

// Định nghĩa interface cho Purchase Proposal RPC
export interface IPublicPurchaseProposalRpc {
    findById(id: string): Promise<PublicPurchaseProposal | null>;
    findByIds(ids: string[]): Promise<PublicPurchaseProposal[] | null>;
}

// Định nghĩa interface cho Purchase Proposal Detail RPC
export interface IPublicPurchaseProposalDetailRpc {
    findById(id: string): Promise<PublicPurchaseProposalDetail | null>;
    findByIds(ids: string[]): Promise<PublicPurchaseProposalDetail[] | null>;
}

// Định nghĩa interface cho Stock Check RPC
export interface IPublicStockCheckRpc {
    findById(id: string): Promise<PublicStockCheck | null>;
    findByIds(ids: string[]): Promise<PublicStockCheck[] | null>;
}

// Định nghĩa interface cho Stock Check Detail RPC
export interface IPublicStockCheckDetailRpc {
    findById(id: string): Promise<PublicStockCheckDetail | null>;
    findByIds(ids: string[]): Promise<PublicStockCheckDetail[] | null>;
}

// Định nghĩa interface cho Zone RPC
export interface IPublicZoneRpc {
    findById(id: string): Promise<PublicZone | null>;
    findByIds(ids: string[]): Promise<PublicZone[] | null>;
}

// Định nghĩa interface cho Table RPC
export interface IPublicTableRpc {
    findById(id: string): Promise<PublicTable | null>;
    findByIds(ids: string[]): Promise<PublicTable[] | null>;
    findByAvailable(time: string): Promise<PublicTable[] | null>;
}

// Định nghĩa interface cho Reservation RPC
export interface IPublicReservationRpc {
    findById(id: string): Promise<PublicReservation | null>;
    findByIds(ids: string[]): Promise<PublicReservation[] | null>;
}

// Định nghĩa interface cho Cart RPC
export interface IPublicCartRpc {
    findById(id: string): Promise<PublicCart | null>;
    findByIds(ids: string[]): Promise<PublicCart[] | null>;
}

// Định nghĩa interface cho Cart Item RPC
export interface IPublicCartItemRpc {
    findById(id: string): Promise<PublicCartItem | null>;
    findByIds(ids: string[]): Promise<PublicCartItem[] | null>;
}

// Định nghĩa interface cho Cart Item Option RPC
export interface IPublicCartItemOptionRpc {
    findById(id: string): Promise<PublicCartItemOption | null>;
    findByIds(ids: string[]): Promise<PublicCartItemOption[] | null>;
}

// Định nghĩa interface cho Voucher RPC
export interface IPublicVoucherRpc {
    findById(id: string): Promise<PublicVoucher | null>;
    findByIds(ids: string[]): Promise<PublicVoucher[] | null>;
}

// Định nghĩa interface cho Order RPC
export interface IPublicOrderRpc {
    findById(id: string): Promise<PublicOrder | null>;
    findByIds(ids: string[]): Promise<PublicOrder[] | null>;
}

// Định nghĩa interface cho Order Voucher RPC
export interface IPublicOrderVoucherRpc {
    findById(id: string): Promise<PublicOrderVoucher | null>;
    findByIds(ids: string[]): Promise<PublicOrderVoucher[] | null>;
}

// Định nghĩa interface cho Order Table RPC
export interface IPublicOrderTableRpc {
    findById(id: string): Promise<PublicOrderTable | null>;
    findByIds(ids: string[]): Promise<PublicOrderTable[] | null>;
}

// Định nghĩa interface cho Order Item RPC
export interface IPublicOrderItemRpc {
    findById(id: string): Promise<PublicOrderItem | null>;
    findByIds(ids: string[]): Promise<PublicOrderItem[] | null>;
}

// Định nghĩa interface cho Order Item Option RPC
export interface IPublicOrderItemOptionRpc {
    findById(id: string): Promise<PublicOrderItemOption | null>;
    findByIds(ids: string[]): Promise<PublicOrderItemOption[] | null>;
}

// Định nghĩa interface cho Payment Transaction RPC
export interface IPublicPaymentTransactionRpc {
    findById(id: string): Promise<PublicPaymentTransaction | null>;
    findByIds(ids: string[]): Promise<PublicPaymentTransaction[] | null>;
}

// Định nghĩa interface cho Invoice RPC
export interface IPublicInvoiceRpc {
    findById(id: string): Promise<PublicInvoice | null>;
    findByIds(ids: string[]): Promise<PublicInvoice[] | null>;
}

// Định nghĩa interface cho Image RPC
export interface IPublicImageRpc {
    getImagesByRefId(refId: string[] | string, type: string, isMain?: boolean): Promise<PublicImage[]>;
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