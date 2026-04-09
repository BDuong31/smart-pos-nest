import { PublicOptionItem, PublicProduct, PublicVariant } from 'src/share';
import { z } from 'zod';

// ============================
// Model cho Cart
// ============================

// Định nghĩa lỗi cho Cart
// 1. Lỗi chung về Cart
export const ErrCartNotFound = new Error('Cart not found'); // Lỗi giỏ hàng không tồn tại
export const ErrCartAlreadyExists = new Error('Cart already exists'); // Lỗi giỏ hàng đã tồn tại

// 2. Lỗi về số lượng sản phẩm trong giỏ hàng
export const ErrCartTotalItemNegative = new Error('Total item in cart cannot be negative'); // Lỗi số lượng sản phẩm trong giỏ hàng không được âm

// Định nghĩa lỗi cho CartItem
// 1. Lỗi chung về CartItem
export const ErrCartItemNotFound = new Error('Cart item not found'); // Lỗi mục sản phẩm trong giỏ hàng không tồn tại
export const ErrCartItemAlreadyExists = new Error('Cart item already exists'); // Lỗi mục sản phẩm trong giỏ hàng đã tồn tại

// 2. Lỗi về số lượng sản phẩm trong mục giỏ hàng
export const ErrCartItemQuantityNegative = new Error('Quantity of cart item cannot be negative'); // Lỗi số lượng sản phẩm trong mục giỏ hàng không được âm

// Định nghĩa lỗi cho CartItemOption
// 1. Lỗi chung về CartItemOption
export const ErrCartItemOptionNotFound = new Error('Cart item option not found'); // Lỗi tùy chọn sản phẩm trong mục giỏ hàng không tồn tại
export const ErrCartItemOptionAlreadyExists = new Error('Cart item option already exists'); // Lỗi tùy chọn sản phẩm trong mục giỏ hàng đã tồn tại

// Mô hình dữ liệu cho Cart
export const cartSchema = z.object({
    id: z.string().uuid(),
    userId: z.string().uuid(),
    totalItem: z.number().min(0, ErrCartTotalItemNegative),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type Cart = z.infer<typeof cartSchema>;

// Mô hình dữ liệu cho CartItem
export const cartItemSchema = z.object({
    id: z.string().uuid(),
    cartId: z.string().uuid(),
    productId: z.string().uuid(),
    variantId: z.string().uuid(),
    quantity: z.number().min(0, ErrCartItemQuantityNegative),
    note: z.string().max(500).nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type CartItem = z.infer<typeof cartItemSchema> & { product?: PublicProduct, variant?: PublicVariant };

// Mô hình dữ liệu cho CartItemOption
export const cartItemOptionSchema = z.object({
    id: z.string().uuid(),
    cartItemId: z.string().uuid(),
    optionItemId: z.string().uuid(),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type CartItemOption = z.infer<typeof cartItemOptionSchema> & { optionItem?: PublicOptionItem };
