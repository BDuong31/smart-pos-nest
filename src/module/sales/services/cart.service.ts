import { Inject, Injectable } from '@nestjs/common';
import { type ICartRepository, ICartService } from '../ports/cart.port';
import { CART_REPOSITORY } from '../sales.di-token';
import {Cart, CartItem, CartItemOption, ErrCartAlreadyExists, ErrCartItemNotFound, ErrCartItemOptionNotFound, ErrCartNotFound } from '../models/cart.model';
import { type IEventPublisher, Requester } from 'src/share/interface';
import { CartCondDTO, CartCreateDTO, cartCreateDTOSchema, CartItemCondDTO, CartItemCreateDTO, cartItemCreateDTOSchema, CartItemOptionCondDTO, CartItemOptionCreateDTO, cartItemOptionCreateDTOSchema, CartItemOptionUpdateDTO, cartItemOptionUpdateDTOSchema, CartItemUpdateDTO, cartItemUpdateDTOSchema, CartUpdateDTO, cartUpdateDTOSchema } from '../dtos/cart.dto';
import { v7 } from 'uuid';
import { AppError, EVENT_PUBLISHER, Paginated, PagingDTO } from 'src/share';
import { CartCreatedEvent, CartDeletedEvent, CartItemAddedEvent, CartItemOptionAddedEvent, CartItemOptionRemovedEvent, CartItemRemovedEvent, CartItemUpdatedEvent, CartUpdatedEvent } from '../../../share/event/cart.evt';
// Lớp CartService cung cấp các phương thức để quản lý giỏ hàng
@Injectable()
export class CartService implements ICartService {
    constructor(
        @Inject(CART_REPOSITORY) private readonly cartRepo: ICartRepository,
        @Inject(EVENT_PUBLISHER) private readonly eventPublisher: IEventPublisher,
    ){}

    // Cart 
    // Tạo mới giỏ hàng cho người dùng
    async createCart(requester: Requester, dto: CartCreateDTO, ip: string, userAgent: string): Promise<string> {
        // Kiểm tra dữ liệu đầu vào
        const data = cartCreateDTOSchema.parse(dto);

        // Kiểm tra xem giỏ hàng đã tồn tại chưa
        const existing = await this.cartRepo.getCart(data.userId);
        
        if (existing) {
            throw AppError.from(ErrCartAlreadyExists, 409);
        }

        // Tạo giỏ hàng mới
        const newId = v7();
        const cart = {
            id: newId,
            userId: data.userId,
            totalItem: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await this.cartRepo.insertCart(cart);

        await this.eventPublisher.publish(CartCreatedEvent.create({
            cartId: newId,
            userId: data.userId,
            totalItem: 0,
            changeType: 'CREATED',
        }, requester.sub));
        return newId;
    }

    // Cập nhật thông tin giỏ hàng theo ID người dùng
    async updateCart(requester: Requester, userId: string, dto: CartUpdateDTO, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra dữ liệu đầu vào
        const data = cartUpdateDTOSchema.parse(dto);

        const existing = await this.cartRepo.getCart(userId);
        if (!existing) {
            throw AppError.from(ErrCartNotFound, 404);
        }

        // Cập nhật thông tin giỏ hàng
        await this.cartRepo.updateCart(userId, data);

        await this.eventPublisher.publish(CartUpdatedEvent.create({
            cartId: existing.id,
            userId: userId,
            totalItem: data.totalItem,
            changeType: 'UPDATED',
        }, requester.sub));
    }

    // Xóa giỏ hàng theo ID người dùng
    async deleteCart(requester: Requester, userId: string, ip: string, userAgent: string): Promise<void> {
        const existing = await this.cartRepo.getCart(userId);
        if (!existing) {
            throw AppError.from(ErrCartNotFound, 404);
        }

        // Xóa giỏ hàng
        await this.cartRepo.deleteCart(userId);

        await this.eventPublisher.publish(CartDeletedEvent.create({
            cartId: existing.id,
            userId: userId,
            totalItem: 0,
            changeType: 'DELETED',
        }, requester.sub));
    }

    // Lấy thông tin giỏ hàng theo ID người dùng
    async getCart(userId: string): Promise<Cart | null> {
        return await this.cartRepo.getCart(userId);
    }   

    // Lấy danh sách giỏ hàng theo điều kiện
    async listCart(cond: CartCondDTO, paging: PagingDTO): Promise<Paginated<Cart>> {
        return await this.cartRepo.listCart(cond, paging);
    }

    // Lấy danh sách giỏ hàng theo nhiều ID
    async listCartByIds(ids: string[]): Promise<Cart[]> {
        return await this.cartRepo.listCartByIds(ids);
    }

    // Cart Item
    // Tạo mục sản phẩm mới trong giỏ hàng
    async createCartItem(requester: Requester, dto: CartItemCreateDTO, ip: string, userAgent: string): Promise<string> {
        // Kiểm tra dữ liệu đầu vào
        const data = cartItemCreateDTOSchema.parse(dto);

        // Tạo mục sản phẩm mới trong giỏ hàng
        const newId = v7();
        const cartItem = {
            id: newId,
            cartId: data.cartId,
            productId: data.productId,
            variantId: data.variantId,
            quantity: data.quantity,
            note: data.note,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await this.cartRepo.insertCartItem(cartItem);

        await this.eventPublisher.publish(CartItemAddedEvent.create({
            cartItemId: newId,
            cartId: data.cartId,
            productId: data.productId,
            quantity: data.quantity,
            changeType: 'ADDED',
            statusUpdateCartItem: 'increase',
        }, requester.sub));
        return newId;
    }

    // Cập nhật thông tin mục sản phẩm trong giỏ hàng theo ID
    async updateCartItem(requester: Requester, id: string, dto: CartItemUpdateDTO, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra dữ liệu đầu vào
        const data = cartItemUpdateDTOSchema.parse(dto);

        const existing = await this.cartRepo.getCartItem(id);
        if (!existing) {
            throw AppError.from(ErrCartItemNotFound, 404);
        }

        // Cập nhật thông tin mục sản phẩm trong giỏ hàng
        await this.cartRepo.updateCartItem(id, data);

        await this.eventPublisher.publish(CartItemUpdatedEvent.create({
            cartItemId: id,
            cartId: existing.cartId,
            productId: existing.productId,
            quantity: data.quantity,
            changeType: 'UPDATED',
            statusUpdateCartItem: 'increase',
        }, requester.sub));
    }

    // Xóa mục sản phẩm trong giỏ hàng theo ID
    async deleteCartItem(requester: Requester, id: string, ip: string, userAgent: string): Promise<void> {
        // Xóa mục sản phẩm trong giỏ hàng
        const cartItem = await this.cartRepo.getCartItem(id);
        if (!cartItem) {
            throw AppError.from(ErrCartItemNotFound, 404);
        }
        await this.cartRepo.deleteCartItem(id);

        await this.eventPublisher.publish(CartItemRemovedEvent.create({
            cartItemId: id,
            cartId: cartItem.cartId,
            productId: cartItem.productId,
            quantity: cartItem.quantity,
            changeType: 'REMOVED',
            statusUpdateCartItem: 'decrease',
        }, requester.sub));
    }

    // Lấy thông tin mục sản phẩm trong giỏ hàng theo ID
    async getCartItem(id: string): Promise<CartItem | null> {
        return await this.cartRepo.getCartItem(id);
    }

    // Lấy danh sách mục sản phẩm trong giỏ hàng theo điều kiện
    async listCartItem(cond: CartItemCondDTO, paging: PagingDTO): Promise<Paginated<CartItem>> {
        return await this.cartRepo.listCartItem(cond, paging);
    }   

    // Lấy danh sách mục sản phẩm trong giỏ hàng theo nhiều ID
    async listCartItemByIds(ids: string[]): Promise<CartItem[]>{
        return await this.cartRepo.listCartItemByIds(ids);
    }

    // Cart Item Option
    // Tạo tùy chọn sản phẩm mới trong mục giỏ hàng
    async createCartItemOption(requester: Requester, dto: CartItemOptionCreateDTO, ip: string, userAgent: string): Promise<string> {
        // Kiểm tra dữ liệu đầu vào
        const data = cartItemOptionCreateDTOSchema.parse(dto);

        // Tạo tùy chọn sản phẩm mới trong mục giỏ hàng
        const newId = v7();
        const cartItemOption = {
            id: newId,
            cartItemId: data.cartItemId,
            optionItemId: data.optionItemId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await this.cartRepo.insertCartItemOption(cartItemOption);

        await this.eventPublisher.publish(CartItemOptionAddedEvent.create({
            cartItemOptionId: newId,
            cartItemId: data.cartItemId,
            optionItemId: data.optionItemId,
            changeType: 'ADDED',
        }, requester.sub));

        return newId;
    }
    
    // Cập nhật thông tin tùy chọn sản phẩm trong mục giỏ hàng theo ID
    async updateCartItemOption(requester: Requester, id: string, dto: CartItemOptionUpdateDTO, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra dữ liệu đầu vào
        const data = cartItemOptionUpdateDTOSchema.parse(dto);

        const existing = await this.cartRepo.getCartItemOption(id);
        if (!existing) {
            throw AppError.from(ErrCartItemOptionNotFound, 404);
        }

        // Cập nhật thông tin tùy chọn sản phẩm trong mục giỏ hàng
        await this.cartRepo.updateCartItemOption(id, data);
    }

    // Xóa tùy chọn sản phẩm trong mục giỏ hàng theo ID
    async deleteCartItemOption(requester: Requester, id: string, ip: string, userAgent: string): Promise<void> {
        const existing = await this.cartRepo.getCartItemOption(id);
        if (!existing) {
            throw AppError.from(ErrCartItemOptionNotFound, 404);
        }
        // Xóa tùy chọn sản phẩm trong mục giỏ hàng
        await this.cartRepo.deleteCartItemOption(id);

        await this.eventPublisher.publish(CartItemOptionRemovedEvent.create({
            cartItemOptionId: id,
            cartItemId: existing.cartItemId,
            optionItemId: existing.optionItemId,
            changeType: 'REMOVED',
        }, requester.sub));
    }

    // Lấy thông tin tùy chọn sản phẩm trong mục giỏ hàng theo ID
    async getCartItemOption(id: string): Promise<CartItemOption | null> {
        return await this.cartRepo.getCartItemOption(id);
    }

    // Lấy danh sách tùy chọn sản phẩm trong mục giỏ hàng theo điều kiện
    async listCartItemOption(cond: CartItemOptionCondDTO, paging: PagingDTO): Promise<Paginated<CartItemOption>> {
        return await this.cartRepo.listCartItemOption(cond, paging);
    }

    // Lấy danh sách tùy chọn sản phẩm trong mục giỏ hàng theo nhiều ID
    async listCartItemOptionByIds(ids: string[]): Promise<CartItemOption[]> {
        return await this.cartRepo.listCartItemOptionByIds(ids);
    }
}