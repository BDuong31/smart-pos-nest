import { PublicOptionItem, PublicOrder, PublicProduct, PublicTable, PublicUser, PublicVariant } from "src/share/data-model";
import { z } from "zod";

// ============================
// Model cho Order
// ============================

// Định nghĩa lỗi cho Order
// 1. Lỗi chung về Order
export const ErrOrderNotFound = new Error('Order not found'); // Lỗi đơn hàng không tồn tại
export const ErrOrderAlreadyExists = new Error('Order already exists'); // Lỗi đơn hàng đã tồn tại

// 2. Lỗi về mã code đơn hàng
export const ErrOrderCodeRequired = new Error('Order code is required'); // Lỗi mã code đơn hàng bắt buộc
export const ErrOrderCodeTooShort = new Error('Order code is too short'); // Lỗi mã code đơn hàng quá ngắn
export const ErrOrderCodeTooLong = new Error('Order code is too long'); // Lỗi mã code đơn hàng quá dài
export const ErrOrderCodeInvalidFormat = new Error('Order code has invalid format'); // Lỗi định dạng mã code đơn hàng không hợp lệ

// 3. Lỗi về tổng tiền của đơn hàng
export const ErrOrderTotalAmountNegative = new Error('Order total amount cannot be negative'); // Lỗi tổng tiền của đơn hàng không được âm

// 4. Lỗi về trạng thái của đơn hàng
export const ErrOrderStatusInvalid = new Error('Order status is invalid'); // Lỗi trạng thái của đơn hàng không hợp lệ

// Định nghĩa lỗi cho OrderItem
// 1. Lỗi chung về OrderItem
export const ErrOrderItemNotFound = new Error('Order item not found'); // Lỗi mục sản phẩm trong đơn hàng không tồn tại
export const ErrOrderItemAlreadyExists = new Error('Order item already exists'); // Lỗi mục sản phẩm trong đơn hàng đã tồn tại

// 2. Lỗi về số lượng sản phẩm trong mục đơn hàng
export const ErrOrderItemQuantityNegative = new Error('Quantity of order item cannot be negative'); // Lỗi số lượng sản phẩm trong mục đơn hàng không được âm

// 3. Lỗi về giá tiền của sản phẩm trong mục đơn hàng
export const ErrOrderItemPriceNegative = new Error('Price of order item cannot be negative'); // Lỗi giá tiền của sản phẩm trong mục đơn hàng không được âm

// Định nghĩa lỗi cho OrderItemOption
// 1. Lỗi chung về OrderItemOption
export const ErrOrderItemOptionNotFound = new Error('Order item option not found'); // Lỗi tùy chọn sản phẩm trong mục đơn hàng không tồn tại
export const ErrOrderItemOptionAlreadyExists = new Error('Order item option already exists'); // Lỗi tùy chọn sản phẩm trong mục đơn hàng đã tồn tại

// 2. Lỗi về giá tiền của tùy chọn sản phẩm trong mục đơn hàng  
export const ErrOrderItemOptionPriceNegative = new Error('Price of order item option cannot be negative'); // Lỗi giá tiền của tùy chọn sản phẩm trong mục đơn hàng không được âm

// Định nghĩa lỗi cho OrderVoucher
// 1. Lỗi chung về OrderVoucher
export const ErrOrderVoucherNotFound = new Error('Order voucher not found'); // Lỗi voucher trong đơn hàng không tồn tại
export const ErrOrderVoucherAlreadyExists = new Error('Order voucher already exists'); // Lỗi voucher trong đơn hàng đã tồn tại

// 2. Lỗi về giá trị giảm giá của voucher trong đơn hàng
export const ErrOrderVoucherDiscountNegative = new Error('Discount value of order voucher cannot be negative'); // Lỗi giá trị giảm giá của voucher trong đơn hàng không được âm

// Định nghĩa lỗi cho OrderTable
// 1. Lỗi chung về OrderTable
export const ErrOrderTableNotFound = new Error('Order table not found'); // Lỗi bàn trong đơn hàng không tồn tại
export const ErrOrderTableAlreadyExists = new Error('Order table already exists'); // Lỗi bàn trong đơn hàng đã tồn tại

// Định nghĩa lỗi cho hoá đơn công ty (Invoice)
// 1. Lỗi chung về Invoice
export const ErrInvoiceNotFound = new Error('Invoice not found'); // Lỗi hoá đơn công ty không tồn tại
export const ErrInvoiceAlreadyExists = new Error('Invoice already exists'); // Lỗi hoá đơn công ty đã tồn tại

// 2. Lỗi về mã số thuế của hoá đơn công ty (Company Tax Code)
export const ErrInvoiceCompanyTaxCodeRequired = new Error('Company tax code is required'); // Lỗi mã số thuế của hoá đơn công ty bắt buộc
export const ErrInvoiceCompanyTaxCodeTooShort = new Error('Company tax code is too short'); // Lỗi mã số thuế của hoá đơn công ty quá ngắn
export const ErrInvoiceCompanyTaxCodeTooLong = new Error('Company tax code is too long'); // Lỗi mã số thuế của hoá đơn công ty quá dài
export const ErrInvoiceCompanyTaxCodeInvalidFormat = new Error('Company tax code has invalid format'); // Lỗi định dạng mã số thuế của hoá đơn công ty không hợp lệ 

// Enum cho trạng thái của đơn hàng
export enum OrderStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    PROCESSING = 'processing',
    SERVED = 'served',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

// Mô hình dữ liệu cho Order
export const orderSchema = z.object({
    id: z.string().uuid(),
    code: z.string().min(1, ErrOrderCodeRequired).max(50, ErrOrderCodeTooLong),
    userId: z.string().uuid(),
    totalAmount: z.number().min(0, ErrOrderTotalAmountNegative),
    status: z.nativeEnum(OrderStatus),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type Order = z.infer<typeof orderSchema> & { user?: PublicUser };

// Mô hình dữ liệu cho OrderItem
export const orderItemSchema = z.object({
    id: z.string().uuid(),
    orderId: z.string().uuid(),
    productId: z.string().uuid(),
    variantId: z.string().uuid(),
    productName: z.string(),
    price: z.number().min(0, ErrOrderItemPriceNegative),
    quantity: z.number().min(0, ErrOrderItemQuantityNegative),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type OrderItem = z.infer<typeof orderItemSchema> & { product?: PublicProduct, variant?: PublicVariant };

// Mô hình dữ liệu cho OrderItemOption
export const orderItemOptionSchema = z.object({
    id: z.string().uuid(),
    orderItemId: z.string().uuid(),
    optionItemId: z.string().uuid(),
    optionName: z.string(),
    price: z.number().min(0, ErrOrderItemOptionPriceNegative),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type OrderItemOption = z.infer<typeof orderItemOptionSchema> & { optionItem?: PublicOptionItem };

// Mô hình dữ liệu cho OrderVoucher
export const orderVoucherSchema = z.object({
    id: z.string().uuid(),
    orderId: z.string().uuid(),
    voucherId: z.string().uuid(),
    discountApplied: z.number().min(0, ErrOrderVoucherDiscountNegative),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type OrderVoucher = z.infer<typeof orderVoucherSchema>;

// Mô hình dữ liệu cho OrderTable
export const orderTableSchema = z.object({
    id: z.string().uuid(),
    orderId: z.string().uuid(), 
    tableId: z.string().uuid(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type OrderTable = z.infer<typeof orderTableSchema> & { table?: PublicTable };

// Mô hình dữ liệu cho hoá đơn công ty (Invoice)
export const invoiceSchema = z.object({
    id: z.string().uuid(),
    orderId: z.string().uuid(),
    taxCode: z.string().min(1, ErrInvoiceCompanyTaxCodeRequired).max(50, ErrInvoiceCompanyTaxCodeTooLong),
    issuedAt: z.date(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type Invoice = z.infer<typeof invoiceSchema> & { order?: PublicOrder };