import { z } from 'zod';
import { cartSchema , cartItemSchema, cartItemOptionSchema } from '../models/cart.model';

// ============================
// Định nghĩa các DTO cho Cart
// ============================
// Định nghĩa schema cho tạo giỏ hàng
export const cartCreateDTOSchema = cartSchema.pick({
    userId: true, // ID người dùng
}).extend({
    totalItem: z.number().min(0, 'Total item in cart cannot be negative').optional(), // Số lượng sản phẩm trong giỏ hàng, mặc định là 0
}).required()

// Định nghĩa kiểu dữ liệu cho tạo giỏ hàng
export interface CartCreateDTO extends z.infer<typeof cartCreateDTOSchema> {}

// Định nghĩa schema cho cập nhật giỏ hàng
export const cartUpdateDTOSchema = cartSchema.pick({
    totalItem: true, // Số lượng sản phẩm trong giỏ hàng
}).partial()

// Định nghĩa kiểu dữ liệu cho cập nhật giỏ hàng
export interface CartUpdateDTO extends z.infer<typeof cartUpdateDTOSchema> {}

// Định nghĩa schema cho điều kiện truy vấn giỏ hàng
export const cartCondDTOSchema = cartSchema.pick({
    userId: true, // ID người dùng
    totalItem: true, // Số lượng sản phẩm trong giỏ hàng
}).partial();

// Định nghĩa kiểu dữ liệu cho điều kiện truy vấn giỏ hàng
export interface CartCondDTO extends z.infer<typeof cartCondDTOSchema> {}

// Định nghĩa schema cho tạo mục sản phẩm trong giỏ hàng    
export const cartItemCreateDTOSchema = cartItemSchema.pick({
    cartId: true, // ID giỏ hàng
    productId: true, // ID sản phẩm
}).extend({
    quantity: z.number().min(0, 'Quantity of cart item cannot be negative').optional(), // Số lượng sản phẩm trong mục giỏ hàng, mặc định là 1
}).required()

// Định nghĩa kiểu dữ liệu cho tạo mục sản phẩm trong giỏ hàng
export interface CartItemCreateDTO extends z.infer<typeof cartItemCreateDTOSchema> {}

// Định nghĩa schema cho cập nhật mục sản phẩm trong giỏ hàng
export const cartItemUpdateDTOSchema = cartItemSchema.pick({
    quantity: true, // Số lượng sản phẩm trong mục giỏ hàng
}).partial()

// Định nghĩa kiểu dữ liệu cho cập nhật mục sản phẩm trong giỏ hàng
export interface CartItemUpdateDTO extends z.infer<typeof cartItemUpdateDTOSchema> {}  

// Định nghĩa schema cho điều kiện truy vấn mục sản phẩm trong giỏ hàng
export const cartItemCondDTOSchema = cartItemSchema.pick({
    cartId: true, // ID giỏ hàng
    productId: true, // ID sản phẩm
    quantity: true, // Số lượng sản phẩm trong mục giỏ hàng
}).partial();   

// Định nghĩa kiểu dữ liệu cho điều kiện truy vấn mục sản phẩm trong giỏ hàng
export interface CartItemCondDTO extends z.infer<typeof cartItemCondDTOSchema> {}

// Định nghĩa schema cho tạo tùy chọn sản phẩm trong mục giỏ hàng
export const cartItemOptionCreateDTOSchema = cartItemOptionSchema.pick({
    cartItemId: true, // ID mục sản phẩm trong giỏ hàng
    optionItemId: true, // ID tùy chọn sản phẩm
}).required()  

// Định nghĩa kiểu dữ liệu cho tạo tùy chọn sản phẩm trong mục giỏ hàng
export interface CartItemOptionCreateDTO extends z.infer<typeof cartItemOptionCreateDTOSchema> {}

// Định nghĩa schema cho cập nhật tùy chọn sản phẩm trong mục giỏ hàng
export const cartItemOptionUpdateDTOSchema = cartItemOptionSchema.pick({
    optionItemId: true, // ID tùy chọn sản phẩm
}).partial()    

// Định nghĩa kiểu dữ liệu cho cập nhật tùy chọn sản phẩm trong mục giỏ hàng
export interface CartItemOptionUpdateDTO extends z.infer<typeof cartItemOptionUpdateDTOSchema> {}

// Định nghĩa schema cho điều kiện truy vấn tùy chọn sản phẩm trong mục giỏ hàng
export const cartItemOptionCondDTOSchema = cartItemOptionSchema.pick({
    cartItemId: true, // ID mục sản phẩm trong giỏ hàng
    optionItemId: true, // ID tùy chọn sản phẩm
}).partial();

// Định nghĩa kiểu dữ liệu cho điều kiện truy vấn tùy chọn sản phẩm trong mục giỏ hàng
export interface CartItemOptionCondDTO extends z.infer<typeof cartItemOptionCondDTOSchema> {}
