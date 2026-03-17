import { Paginated, PagingDTO, Requester } from "src/share";
import { Cart, CartItem, CartItemOption } from "../models/cart.model";
import type { CartCreateDTO, CartUpdateDTO, CartCondDTO, CartItemCreateDTO, CartItemUpdateDTO, CartItemCondDTO,  CartItemOptionCreateDTO, CartItemOptionUpdateDTO, CartItemOptionCondDTO } from "../dtos/cart.dto";

// ============================
// Định nghĩa các interface cho Cart
// ============================

// Định nghĩa các phương thức mà CartService phải triển khai
export interface ICartService {
    // Cart
    createCart(requester: Requester, dto: CartCreateDTO, ip: string, userAgent: string): Promise<string>; // Tạo giỏ hàng mới cho người dùng
    updateCart(requester: Requester, userId: string, dto: CartUpdateDTO, ip: string, userAgent: string): Promise<void>; // Cập nhật thông tin giỏ hàng theo ID người dùng
    deleteCart(requester: Requester, userId: string, ip: string, userAgent: string): Promise<void>; // Xóa giỏ hàng theo ID người dùng

    getCart(userId: string): Promise<Cart | null>; // Lấy thông tin giỏ hàng theo ID người dùng
    listCart(cond: CartCondDTO, paging: PagingDTO): Promise<Paginated<Cart>>; // Lấy danh sách giỏ hàng theo điều kiện
    listCartByIds(ids: string[]): Promise<Cart[]>; // Lấy danh sách giỏ hàng theo nhiều ID

    // Cart Item
    createCartItem(requester: Requester, dto: CartItemCreateDTO, ip: string, userAgent: string): Promise<string>; // Tạo mục sản phẩm mới trong giỏ hàng
    updateCartItem(requester: Requester, id: string, dto: CartItemUpdateDTO, ip: string, userAgent: string): Promise<void>; // Cập nhật thông tin mục sản phẩm trong giỏ hàng theo ID
    deleteCartItem(requester: Requester, id: string, ip: string, userAgent: string): Promise<void>; // Xóa mục sản phẩm trong giỏ hàng theo ID

    getCartItem(id: string): Promise<CartItem | null>; // Lấy thông tin mục sản phẩm trong giỏ hàng theo ID
    listCartItem(cond: CartItemCondDTO, paging: PagingDTO): Promise<Paginated<CartItem>>; // Lấy danh sách mục sản phẩm trong giỏ hàng theo điều kiện
    listCartItemByIds(ids: string[]): Promise<CartItem[]>; // Lấy danh sách mục sản phẩm trong giỏ hàng theo nhiều ID

    // Cart Item Option
    createCartItemOption(requester: Requester, dto: CartItemOptionCreateDTO, ip: string, userAgent: string): Promise<string>; // Tạo tùy chọn sản phẩm mới trong mục giỏ hàng
    updateCartItemOption(requester: Requester, id: string, dto: CartItemOptionUpdateDTO, ip: string, userAgent: string): Promise<void>; // Cập nhật thông tin tùy chọn sản phẩm trong mục giỏ hàng theo ID
    deleteCartItemOption(requester: Requester, id: string, ip: string, userAgent: string): Promise<void>; // Xóa tùy chọn sản phẩm trong mục giỏ hàng theo ID

    getCartItemOption(id: string): Promise<CartItemOption | null>; // Lấy thông tin tùy chọn sản phẩm trong mục giỏ hàng theo ID
    listCartItemOption(cond: CartItemOptionCondDTO, paging: PagingDTO): Promise<Paginated<CartItemOption>>; // Lấy danh sách tùy chọn sản phẩm trong mục giỏ hàng theo điều kiện
    listCartItemOptionByIds(ids: string[]): Promise<CartItemOption[]>; // Lấy danh sách tùy chọn sản phẩm trong mục giỏ hàng theo nhiều ID
}

// Định nghĩa các phương thức mà CartRepository phải triển khai
export interface ICartRepository {
    // Cart
    getCart(userId: string): Promise<Cart | null>; // Lấy thông tin giỏ hàng theo ID người dùng
    listCart(cond: CartCondDTO, paging: PagingDTO): Promise<Paginated<Cart>>; // Lấy danh sách giỏ hàng theo điều kiện
    listCartByIds(ids: string[]): Promise<Cart[]>; // Lấy danh sách giỏ hàng theo nhiều ID
    
    insertCart(cart: Cart): Promise<void>; // Tạo mới giỏ hàng
    updateCart(userId: string, dto: CartUpdateDTO): Promise<void>; // Cập nhật thông tin giỏ hàng theo ID người dùng
    deleteCart(userId: string): Promise<void>; // Xóa giỏ hàng theo ID người dùng

    // Cart Item
    getCartItem(id: string): Promise<CartItem | null>; // Lấy thông tin mục sản phẩm trong giỏ hàng theo ID
    listCartItem(cond: CartItemCondDTO, paging: PagingDTO): Promise<Paginated<CartItem>>; // Lấy danh sách mục sản phẩm trong giỏ hàng theo điều kiện
    listCartItemByIds(ids: string[]): Promise<CartItem[]>; // Lấy danh sách mục sản phẩm trong giỏ hàng theo nhiều ID

    insertCartItem(cartItem: CartItem): Promise<void>; // Tạo mới mục sản phẩm trong giỏ hàng
    updateCartItem(id: string, dto: CartItemUpdateDTO): Promise<void>; // Cập nhật thông tin mục sản phẩm trong giỏ hàng theo ID
    deleteCartItem(id: string): Promise<void>; // Xóa mục sản phẩm trong giỏ hàng theo ID

    // Cart Item Option
    getCartItemOption(id: string): Promise<CartItemOption | null>; // Lấy thông tin tùy chọn sản phẩm trong mục giỏ hàng theo ID
    listCartItemOption(cond: CartItemOptionCondDTO, paging: PagingDTO): Promise<Paginated<CartItemOption>>; // Lấy danh sách tùy chọn sản phẩm trong mục giỏ hàng theo điều kiện
    listCartItemOptionByIds(ids: string[]): Promise<CartItemOption[]>; // Lấy danh sách tùy chọn sản phẩm trong mục giỏ hàng theo nhiều ID

    insertCartItemOption(cartItemOption: CartItemOption): Promise<void>; // Tạo mới tùy chọn sản phẩm trong mục giỏ hàng
    updateCartItemOption(id: string, dto: CartItemOptionUpdateDTO): Promise<void>; // Cập nhật thông tin tùy chọn sản phẩm trong mục giỏ hàng theo ID
    deleteCartItemOption(id: string): Promise<void>; // Xóa tùy chọn sản phẩm trong mục giỏ hàng theo ID
}