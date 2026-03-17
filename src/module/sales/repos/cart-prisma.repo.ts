import prisma from 'src/share/components/prisma'
import { Injectable } from '@nestjs/common';
import { Cart, CartItem, CartItemOption } from '../models/cart.model';
import type { CartCreateDTO, CartUpdateDTO, CartCondDTO, CartItemCreateDTO, CartItemUpdateDTO, CartItemCondDTO,  CartItemOptionCreateDTO, CartItemOptionUpdateDTO, CartItemOptionCondDTO } from '../dtos/cart.dto';
import type { ICartRepository } from '../ports/cart.port';
import type { Cart as CartPrisma, CartItem as CartItemPrisma } from '@prisma/client';
import { Paginated, PagingDTO } from 'src/share/data-model';

// Lớp CartReposiory cung cấp phương thức truy vấn dữ liệu giỏ hàng từ Prisma
@Injectable()
export class CartPrismaRepo implements ICartRepository {
    // Cart
    // Lấy giỏ hàng theo ID người dùng
    async getCart(userId: string): Promise<Cart | null> {
        const data = await prisma.cart.findFirst({ where: { OR: [{ userId: userId }, { id: userId }] }});

        if (!data) return null;
        
        return this._toCartModel(data);
    }

    // Lấy danh sách giỏ hàng theo điều kiện
    async listCart(cond: CartCondDTO, paging: PagingDTO): Promise<Paginated<Cart>> {
        const { userId, totalItem, ...rest } = cond; 

        let where = {
            ...rest,
        }

        if (userId) {
            where = {
                ...where,
                userId: userId,
            }
        }

        if (totalItem) {
            where = {
                ...where,
                totalItem: totalItem,
            }
        }

        const total = await prisma.cart.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.cart.findMany({
            where,
            skip,
            take: paging.limit,
            orderBy: { createdAt: 'desc' },
        });

        return {
            data: result.map(this._toCartModel),
            paging,
            total
        };
    }

    // Lấy danh sách giỏ hàng theo nhiều ID
    async listCartByIds(ids: string[]): Promise<Cart[]> {
        const result = await prisma.cart.findMany({ where: { id: { in: ids } },});

        return result.map(this._toCartModel);
    }

    // Tạo mới giỏ hàng
    async insertCart(cart: Cart): Promise<void> {
        await prisma.cart.create({ data: cart });
    }

    // Cập nhật thông tin giỏ hàng theo ID người dùng
    async updateCart(userId: string, dto: CartUpdateDTO): Promise<void> {
        await prisma.cart.update({ where: { userId }, data: dto });
    }

    // Xóa giỏ hàng theo ID người dùng
    async deleteCart(userId: string): Promise<void> {
        await prisma.cart.delete({ where: { userId } });
    }

    // Cart Item
    // Lấy mục sản phẩm trong giỏ hàng theo ID
    async getCartItem(id: string): Promise<CartItem | null> {
        const data = await prisma.cartItem.findUnique({ where: { id } });

        if (!data) return null;
        
        return this._toCartItemModel(data);
    }

    // Lấy danh sách mục sản phẩm trong giỏ hàng theo điều kiện
    async listCartItem(cond: CartItemCondDTO, paging: PagingDTO): Promise<Paginated<CartItem>> {
        const { cartId, productId, quantity, ...rest } = cond;

        let where = {
            ...rest,
        }

        if (cartId) {
            where = {
                ...where,
                cartId: cartId,
            }
        }

        if (productId) {
            where = {
                ...where,
                productId: productId,
            }
        }

        if (quantity) {
            where = {
                ...where,
                quantity: quantity,
            }
        }

        const total = await prisma.cartItem.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.cartItem.findMany({
            where,
            skip,
            take: paging.limit,
            orderBy: { createdAt: 'desc' },
        });

        return {
            data: result.map(this._toCartItemModel),
            paging,
            total
        }
    }


    // Lấy danh sách mục sản phẩm trong giỏ hàng theo nhiều ID
    async listCartItemByIds(ids: string[]): Promise<CartItem[]> {
        const data = await prisma.cartItem.findMany({ where: { id: { in: ids } } });

        return data.map(this._toCartItemModel);
    }

    // Tạo mới mục sản phẩm trong giỏ hàng
    async insertCartItem(cartItem: CartItem): Promise<void> {
        await prisma.cartItem.create({ data: cartItem });
    }

    // Cập nhật thông tin mục sản phẩm trong giỏ hàng theo ID
    async updateCartItem(id: string, dto: CartItemUpdateDTO): Promise<void> {
        await prisma.cartItem.update({ where: { id }, data: dto });
    }

    // Xóa mục sản phẩm trong giỏ hàng theo ID
    async deleteCartItem(id: string): Promise<void> {
        await prisma.cartItem.delete({ where: { id } });
    }

    // Cart Item Option
    // Lấy tùy chọn sản phẩm trong mục giỏ hàng theo ID
    async getCartItemOption(id: string): Promise<CartItemOption | null> {
        const data = await prisma.cartItemOption.findUnique({ where: { id } });

        if (!data) return null;
        
        return this._toCartItemOptionModel(data);
    }

    // Lấy danh sách tùy chọn sản phẩm trong mục giỏ hàng theo điều kiện
    async listCartItemOption(cond: CartItemOptionCondDTO, paging: PagingDTO): Promise<Paginated<CartItemOption>> {  
        const { cartItemId, optionItemId, ...rest } = cond;

        let where = {
            ...rest,
        }

        if (cartItemId) {
            where = {
                ...where,
                cartItemId: cartItemId,
            }
        }

        if (optionItemId) {
            where = {
                ...where,
                optionItemId: optionItemId,
            }
        }

        const total = await prisma.cartItemOption.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.cartItemOption.findMany({
            where,
            skip,
            take: paging.limit,
            orderBy: { createdAt: 'desc' },
        });

        return {
            data: result.map(this._toCartItemOptionModel),
            paging,
            total
        }
    }

    // Lấy danh sách tùy chọn sản phẩm trong mục giỏ hàng theo nhiều ID
    async listCartItemOptionByIds(ids: string[]): Promise<CartItemOption[]> {
        const data = await prisma.cartItemOption.findMany({ where: { id: { in: ids } } });

        return data.map(this._toCartItemOptionModel);
    }

    // Tạo mới tùy chọn sản phẩm trong mục giỏ hàng
    async insertCartItemOption(cartItemOption: CartItemOption): Promise<void> {
        await prisma.cartItemOption.create({ data: cartItemOption });
    }

    // Cập nhật thông tin tùy chọn sản phẩm trong mục giỏ hàng theo ID
    async updateCartItemOption(id: string, dto: CartItemOptionUpdateDTO): Promise<void> {
        await prisma.cartItemOption.update({ where: { id }, data: dto });
    }

    // Xóa tùy chọn sản phẩm trong mục giỏ hàng theo ID
    async deleteCartItemOption(id: string): Promise<void> {
        await prisma.cartItemOption.delete({ where: { id } });
    }

    // Chuyển đổi dữ liệu từ Prisma sang model Cart
    private _toCartModel(data: CartPrisma): Cart {
        return { ...data} as Cart
    }

    // Chuyển đổi dữ liệu từ Prisma sang model CartItem
    private _toCartItemModel(data: CartItemPrisma): CartItem {
        return { ...data} as CartItem
    }

    // Chuyển đổi dữ liệu từ Prisma sang model CartItemOption
    private _toCartItemOptionModel(data: any): CartItemOption {
        return { ...data} as CartItemOption
    }
}

