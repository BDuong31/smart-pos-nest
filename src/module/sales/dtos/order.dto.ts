import { z } from "zod";
import { orderSchema, orderItemSchema, orderItemOptionSchema, orderVoucherSchema, orderTableSchema, invoiceSchema } from "../models/order.model";

// ============================
// Định nghĩa các DTO cho Order
// ============================

// Định nghĩa schema cho tạo đơn hàng
export const orderCreateDTOSchema = orderSchema.pick({
    userId: true, // ID người dùng
    totalAmount: true, // Tổng số tiền của đơn hàng
}).required()

// Định nghĩa kiểu dữ liệu cho tạo đơn hàng
export interface OrderCreateDTO extends z.infer<typeof orderCreateDTOSchema> {}

// Định nghĩa schema cho cập nhật đơn hàng
export const orderUpdateDTOSchema = orderSchema.pick({
    totalAmount: true, // Tổng số tiền của đơn hàng
    status: true, // Trạng thái của đơn hàng
}).partial()

// Định nghĩa kiểu dữ liệu cho cập nhật đơn hàng
export interface OrderUpdateDTO extends z.infer<typeof orderUpdateDTOSchema> {}

// Định nghĩa schema cho điều kiện truy vấn đơn hàng
export const orderCondDTOSchema = orderSchema.pick({
    userId: true, // ID người dùng
    totalAmount: true, // Tổng số tiền của đơn hàng
    status: true, // Trạng thái của đơn hàng
}).partial();

// Định nghĩa kiểu dữ liệu cho điều kiện truy vấn đơn hàng
export interface OrderCondDTO extends z.infer<typeof orderCondDTOSchema> {}

// Định nghĩa schema cho tạo mục sản phẩm trong đơn hàng    
export const orderItemCreateDTOSchema = orderItemSchema.pick({
    orderId: true, // ID đơn hàng   
    productId: true, // ID sản phẩm
    variantId: true, // ID biến thể sản phẩm
    productName: true, // Tên sản phẩm
}).extend({
    quantity: z.number().min(0, 'Quantity of order item cannot be negative').optional(), // Số lượng của mục sản phẩm trong đơn hàng, mặc định là 1
}).required()

// Định nghĩa kiểu dữ liệu cho tạo mục sản phẩm trong đơn hàng
export interface OrderItemCreateDTO extends z.infer<typeof orderItemCreateDTOSchema> {}

// Định nghĩa schema cho cập nhật mục sản phẩm trong đơn hàng
export const orderItemUpdateDTOSchema = orderItemSchema.pick({
    price: true, // Giá của mục sản phẩm trong đơn hàng
    quantity: true, // Số lượng của mục sản phẩm    
}).partial()

// Định nghĩa kiểu dữ liệu cho cập nhật mục sản phẩm trong đơn hàng
export interface OrderItemUpdateDTO extends z.infer<typeof orderItemUpdateDTOSchema> {}

// Định nghĩa schema cho điều kiện truy vấn mục sản phẩm trong đơn hàng
export const orderItemCondDTOSchema = orderItemSchema.pick({
    orderId: true, // ID đơn hàng   
    productId: true, // ID sản phẩm
    variantId: true, // ID biến thể sản phẩm
    productName: true, // Tên sản phẩm
    price: true, // Giá của mục sản phẩm trong đơn hàng
    quantity: true, // Số lượng của mục sản phẩm    
}).partial();

// Định nghĩa kiểu dữ liệu cho điều kiện truy vấn mục sản phẩm trong đơn hàng
export interface OrderItemCondDTO extends z.infer<typeof orderItemCondDTOSchema> {}

// Định nghĩa schema cho tạo tùy chọn sản phẩm trong mục đơn hàng    
export const orderItemOptionCreateDTOSchema = orderItemOptionSchema.pick({
    orderItemId: true, // ID mục sản phẩm trong đơn hàng
    optionItemId: true, // ID tùy chọn sản phẩm
    optionName: true, // Tên tùy chọn sản phẩm
}).extend({
    price: z.number().min(0, 'Price of order item option cannot be negative').optional(), // Giá của tùy chọn sản phẩm trong mục đơn hàng, mặc định là 0
}).required()

// Định nghĩa kiểu dữ liệu cho tạo tùy chọn sản phẩm trong mục đơn hàng
export interface OrderItemOptionCreateDTO extends z.infer<typeof orderItemOptionCreateDTOSchema> {}

// Định nghĩa schema cho cập nhật tùy chọn sản phẩm trong mục đơn hàng
export const orderItemOptionUpdateDTOSchema = orderItemOptionSchema.pick({
    optionItemId: true, // ID tùy chọn sản phẩm
    optionName: true, // Tên tùy chọn sản phẩm
    price: true, // Giá của tùy chọn sản phẩm trong mục đơn hàng
}).partial()

// Định nghĩa kiểu dữ liệu cho cập nhật tùy chọn sản phẩm trong mục đơn hàng
export interface OrderItemOptionUpdateDTO extends z.infer<typeof orderItemOptionUpdateDTOSchema> {}

// Định nghĩa schema cho điều kiện truy vấn tùy chọn sản phẩm trong mục đơn hàng
export const orderItemOptionCondDTOSchema = orderItemOptionSchema.pick({
    orderItemId: true, // ID mục sản phẩm trong đơn hàng
    optionItemId: true, // ID tùy chọn sản phẩm
    optionName: true, // Tên tùy chọn sản phẩm
    price: true, // Giá của tùy chọn sản phẩm trong mục đơn hàng
}).partial();

// Định nghĩa kiểu dữ liệu cho điều kiện truy vấn tùy chọn sản phẩm trong mục đơn hàng
export interface OrderItemOptionCondDTO extends z.infer<typeof orderItemOptionCondDTOSchema> {}

// Định nghĩa schema cho tạo voucher trong đơn hàng    
export const orderVoucherCreateDTOSchema = orderVoucherSchema.pick({
    orderId: true, // ID đơn hàng
    voucherId: true, // ID voucher
}).extend({
    discountApplied: z.number().min(0, 'Discount applied from voucher in order cannot be negative').optional(), // Số tiền giảm giá được áp dụng từ voucher trong đơn hàng, mặc định là 0   
}).required()

// Định nghĩa kiểu dữ liệu cho tạo voucher trong đơn hàng
export interface OrderVoucherCreateDTO extends z.infer<typeof orderVoucherCreateDTOSchema> {}   

// Định nghĩa schema cho cập nhật voucher trong đơn hàng
export const orderVoucherUpdateDTOSchema = orderVoucherSchema.pick({
    discountApplied: true, // Số tiền giảm giá được áp dụng từ voucher trong đơn hàng
}).partial()

// Định nghĩa kiểu dữ liệu cho cập nhật voucher trong đơn hàng
export interface OrderVoucherUpdateDTO extends z.infer<typeof orderVoucherUpdateDTOSchema> {}

// Định nghĩa schema cho điều kiện truy vấn voucher trong đơn hàng
export const orderVoucherCondDTOSchema = orderVoucherSchema.pick({
    orderId: true, // ID đơn hàng
    voucherId: true, // ID voucher
    discountApplied: true, // Số tiền giảm giá được áp dụng từ voucher trong đơn hàng
}).partial();

// Định nghĩa kiểu dữ liệu cho điều kiện truy vấn voucher trong đơn hàng
export interface OrderVoucherCondDTO extends z.infer<typeof orderVoucherCondDTOSchema> {}

// Định nghĩa schema cho tạo bàn trong đơn hàng    
export const orderTableCreateDTOSchema = orderTableSchema.pick({
    orderId: true, // ID đơn hàng
    tableId: true, // ID bàn
}).required()

// Định nghĩa kiểu dữ liệu cho tạo bàn trong đơn hàng
export interface OrderTableCreateDTO extends z.infer<typeof orderTableCreateDTOSchema> {}

// Định nghĩa schema cho cập nhật bàn trong đơn hàng
export const orderTableUpdateDTOSchema = orderTableSchema.pick({
    tableId: true, // ID bàn
}).partial()

// Định nghĩa kiểu dữ liệu cho cập nhật bàn trong đơn hàng
export interface OrderTableUpdateDTO extends z.infer<typeof orderTableUpdateDTOSchema> {}

// Định nghĩa schema cho điều kiện truy vấn bàn trong đơn hàng
export const orderTableCondDTOSchema = orderTableSchema.pick({
    orderId: true, // ID đơn hàng
    tableId: true, // ID bàn
}).partial();

// Định nghĩa kiểu dữ liệu cho điều kiện truy vấn bàn trong đơn hàng
export interface OrderTableCondDTO extends z.infer<typeof orderTableCondDTOSchema> {}

// Định nghĩa schema cho tạo hoá đơn công ty trong đơn hàng    
export const invoiceCreateDTOSchema = invoiceSchema.pick({
    orderId: true, // ID đơn hàng
    taxCode: true, // Mã số thuế của công ty trên hoá đơn
    issuedAt: true, // Ngày phát hành hoá đơn
}).required()

// Định nghĩa kiểu dữ liệu cho tạo hoá đơn công ty trong đơn hàng
export interface InvoiceCreateDTO extends z.infer<typeof invoiceCreateDTOSchema> {}

// Định nghĩa schema cho cập nhật hoá đơn công ty trong đơn hàng
export const invoiceUpdateDTOSchema = invoiceSchema.pick({
    taxCode: true, // Mã số thuế của công ty trên hoá đơn
    issuedAt: true, // Ngày phát hành hoá đơn
}).partial()

// Định nghĩa kiểu dữ liệu cho cập nhật hoá đơn công ty trong đơn hàng
export interface InvoiceUpdateDTO extends z.infer<typeof invoiceUpdateDTOSchema> {}

// Định nghĩa schema cho điều kiện truy vấn hoá đơn công ty trong đơn hàng
export const invoiceCondDTOSchema = invoiceSchema.pick({
    orderId: true, // ID đơn hàng
    taxCode: true, // Mã số thuế của công ty trên hoá đơn
    issuedAt: true, // Ngày phát hành hoá đơn
}).partial();

// Định nghĩa kiểu dữ liệu cho điều kiện truy vấn hoá đơn công ty trong đơn hàng
export interface InvoiceCondDTO extends z.infer<typeof invoiceCondDTOSchema> {}