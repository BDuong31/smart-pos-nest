import { ErrInvoiceNotFound, ErrOrderTableNotFound, ErrOrderVoucherNotFound, OrderVoucher } from './../models/order.model';
import { Inject, Injectable } from '@nestjs/common';
import { type IOrderRepository, IOrderService } from '../ports/order.port';
import { ORDER_REPOSITORY } from '../sales.di-token';
import { ErrOrderAlreadyExists, ErrOrderNotFound, OrderStatus, type Order, type OrderItem, type OrderItemOption, type OrderVoucher, type OrderTable, type Invoice, ErrOrderItemNotFound, ErrOrderItemOptionNotFound } from '../models/order.model';
import { type IEventPublisher, Requester } from 'src/share/interface';
import { InvoiceCondDTO, InvoiceCreateDTO, invoiceCreateDTOSchema, InvoiceUpdateDTO, OrderCondDTO, OrderCreateDTO, orderCreateDTOSchema, OrderItemCondDTO, OrderItemCreateDTO, orderItemCreateDTOSchema, OrderItemOptionCondDTO, OrderItemOptionCreateDTO, orderItemOptionCreateDTOSchema, OrderItemOptionUpdateDTO, orderItemOptionUpdateDTOSchema, OrderItemUpdateDTO, orderItemUpdateDTOSchema, OrderTableCondDTO, OrderTableCreateDTO, orderTableCreateDTOSchema, OrderTableUpdateDTO, OrderUpdateDTO, orderUpdateDTOSchema, OrderVoucherCondDTO, OrderVoucherCreateDTO, orderVoucherCreateDTOSchema, OrderVoucherUpdateDTO } from '../dtos/order.dto';
import { v7 } from 'uuid';
import { AppError, EVENT_PUBLISHER, Paginated, PagingDTO } from 'src/share';
import { InvoiceCreatedEvent, InvoiceDeletedEvent, InvoiceUpdatedEvent, OrderCreatedEvent, OrderDeletedEvent, OrderItemAddedEvent, OrderItemOptionAddedEvent, OrderItemOptionRemovedEvent, OrderItemOptionUpdatedEvent, OrderItemRemovedEvent, OrderItemUpdatedEvent, OrderTableAssignedEvent, OrderTableUnassignedEvent, OrderUpdatedEvent, OrderVoucherAppliedEvent, OrderVoucherRemovedEvent } from 'src/share/event/oder.evt';

// Lớp OrderService cung cấp các phương thức để quản lý đơn hàng
@Injectable()
export class OrderService implements IOrderService {
    constructor(
        @Inject(ORDER_REPOSITORY) private readonly orderRepo: IOrderRepository,
        @Inject(EVENT_PUBLISHER) private readonly eventPublisher: IEventPublisher,
    ){}

    // Order
    // Tạo mới đơn hàng
    async createOrder(requester: Requester, dto: OrderCreateDTO, ip: string, userAgent: string): Promise<string> {
        // Kiểm tra dữ liệu đầu vào
        const data = orderCreateDTOSchema.parse(dto);

        // Kiểm tra xem đơn hàng đã tồn tại chưa
        // const existing = await this.orderRepo.listOrders({ 
        //     userId: data.userId,
        //     status: OrderStatus.PENDING,
        // }, { page: 1, limit: 1 });

        // if (existing.data.length > 0) {
        //     throw AppError.from(ErrOrderAlreadyExists, 409);
        // }

        // Tạo đơn hàng mới
        const newId = v7();
        const code =  'BSO-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(1000 + Math.random() * 9000); // Mã đơn hàng theo định dạng BSO-YYYYMMDD-XXXX (BSO là BASO, YYYYMMDD là ngày tạo đơn hàng, XXXX là số ngẫu nhiên từ 1000 đến 9999)
        const status = requester.role === 'customer' ? OrderStatus.PENDING : OrderStatus.CONFIRMED; // Nếu người tạo đơn hàng là khách hàng thì trạng thái mặc định là PENDING, ngược lại nếu là nhân viên hoặc quản lý thì trạng thái mặc định là CONFIRMED
        const order = {
            id: newId,
            code: code,
            userId: data.userId,
            totalAmount: data.totalAmount,
            status: status,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await this.orderRepo.insertOrder(order);

        await this.eventPublisher.publish(OrderCreatedEvent.create({
            orderId: newId,
            code: code,
            userId: data.userId,
            totalAmount: data.totalAmount,
            status: status,
            changeType: 'CREATED',
        }, requester.sub));

        return newId;
    }

    // Cập nhật thông tin đơn hàng theo ID
    async updateOrder(requester: Requester, orderId: string, orderUpdateDTO: OrderUpdateDTO, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra dữ liệu đầu vào
        const data = orderUpdateDTOSchema.parse(orderUpdateDTO);

        // Kiểm tra xem đơn hàng có tồn tại không
        const existing = await this.orderRepo.getOrderById(orderId); 
        if (!existing) {
            throw AppError.from(ErrOrderNotFound, 404);
        }

        // Cập nhật thông tin đơn hàng
        await this.orderRepo.updateOrder(orderId, data);

        await this.eventPublisher.publish(OrderUpdatedEvent.create({
            orderId: orderId,
            code: existing.code,
            userId: existing.userId,
            totalAmount: existing.totalAmount,
            status: existing.status,
            changeType: 'UPDATED',
        }, requester.sub));
    }

    // Xóa đơn hàng theo ID
    async deleteOrder(requester: Requester, orderId: string, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra xem đơn hàng có tồn tại không
        const existing = await this.orderRepo.getOrderById(orderId); 
        if (!existing) {
            throw AppError.from(ErrOrderNotFound, 404);
        }

        // Xóa đơn hàng
        await this.orderRepo.deleteOrder(orderId);

        await this.eventPublisher.publish(OrderDeletedEvent.create({
            orderId: orderId,
            code: existing.code,
            userId: existing.userId,
            totalAmount: existing.totalAmount,
            status: existing.status,
            changeType: 'DELETED',
        }, requester.sub));
    }
    
    // Lấy thông tin đơn hàng theo ID 
    async getOrderById(orderId: string): Promise<Order | null> {
        return await this.orderRepo.getOrderById(orderId);
    }
    
    // Lấy danh sách đơn hàng theo điều kiện
    async listOrders(paging: PagingDTO, cond: OrderCondDTO): Promise<Paginated<Order>> {
        return await this.orderRepo.listOrders(cond, paging);
    }

    // Lấy danh sách đơn hàng theo nhiều ID
    async listOrdersByIds(orderIds: string[]): Promise<Order[]> {
        return await this.orderRepo.listOrdersByIds(orderIds);
    }

    // Order Item
    // Tạo mới mục sản phẩm trong đơn hàng
    async createOrderItem(requester: Requester, dto: OrderItemCreateDTO, ip: string, userAgent: string): Promise<string> {
        // Kiểm tra dữ liệu đầu vào
        const data = orderItemCreateDTOSchema.parse(dto);

        // Tạo mục sản phẩm mới trong đơn hàng
        const newId = v7();

        const variant = '' // gọi RPC để lấy giá của biến thể sản phẩm dựa trên data.variantId

        // const price = variant ? variant.price : 0; // nếu không có biến thể thì giá bằng 0, sau này sẽ có cơ chế cập nhật giá khi biến thể được tạo hoặc cập nhật
        const price = 0;
        const orderItem = {
            id: newId,
            orderId: data.orderId,
            productId: data.productId,
            variantId: data.variantId,
            productName: data.productName,
            price: price,
            quantity: data.quantity,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await this.orderRepo.insertOrderItem(orderItem);

        await this.eventPublisher.publish(OrderItemAddedEvent.create({
            orderId: data.orderId,
            itemId: newId,
            productId: data.productId,
            variantId: data.variantId,
            productName: data.productName,
            price: price,
            quantity: data.quantity,
            changeType: 'ADDED',
        }, requester.sub));
        return newId;
    }

    // Cập nhật thông tin mục sản phẩm trong đơn hàng theo ID
    async updateOrderItem(requester: Requester, orderItemId: string, dto: OrderItemUpdateDTO, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra dữ liệu đầu vào
        const data = orderItemUpdateDTOSchema.parse(dto);   

        // Kiểm tra xem mục sản phẩm có tồn tại không
        const existing = await this.orderRepo.getOrderItemById(orderItemId);
        if (!existing) {
            throw AppError.from(ErrOrderItemNotFound, 404);
        }

        // Cập nhật thông tin mục sản phẩm trong đơn hàng theo ID
        await this.orderRepo.updateOrderItem(orderItemId, data);

        await this.eventPublisher.publish(OrderItemUpdatedEvent.create({
            orderId: existing.orderId,
            itemId: orderItemId,
            productId: existing.productId,
            variantId: existing.variantId,
            productName: existing.productName,
            price: existing.price,
            quantity: data.quantity,
            changeType: 'UPDATED',
        }, requester.sub));
    }

    // Xóa mục sản phẩm trong đơn hàng theo ID
    async deleteOrderItem(requester: Requester, orderItemId: string, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra xem mục sản phẩm có tồn tại không
        const existing = await this.orderRepo.getOrderItemById(orderItemId);
        if (!existing) {
            throw AppError.from(ErrOrderItemNotFound, 404);
        }
        // Xóa mục sản phẩm trong đơn hàng theo ID
        await this.orderRepo.deleteOrderItem(orderItemId);

        await this.eventPublisher.publish(OrderItemRemovedEvent.create({
            orderId: existing.orderId,
            itemId: orderItemId,
            productId: existing.productId,
            variantId: existing.variantId,
            productName: existing.productName,
            price: existing.price,
            quantity: existing.quantity,
            changeType: 'REMOVED',
        }, requester.sub));
    }

    // Lấy thông tin mục sản phẩm trong đơn hàng theo ID    
    async getOrderItemById(orderItemId: string): Promise<OrderItem | null> {
        return await this.orderRepo.getOrderItemById(orderItemId);
    }

    // Lấy danh sách mục sản phẩm trong đơn hàng theo điều kiện
    async listOrderItems(pagingDTO: PagingDTO, orderItemCondDTO: OrderItemCondDTO): Promise<Paginated<OrderItem>> {
        return await this.orderRepo.listOrderItems(orderItemCondDTO, pagingDTO);
    }

    // Lấy danh sách mục sản phẩm trong đơn hàng theo nhiều ID
    async listOrderItemsByIds(orderItemIds: string[]): Promise<OrderItem[]> {
        return await this.orderRepo.listOrderItemsByIds(orderItemIds);
    }

    // Order Item Option
    // Tạo mới tùy chọn sản phẩm trong mục đơn hàng
    async createOrderItemOption(requester: Requester, orderItemOptionCreateDTO: OrderItemOptionCreateDTO, ip: string, userAgent: string): Promise<string> {
        // Kiểm tra dữ liệu đầu vào
        const data = orderItemOptionCreateDTOSchema.parse(orderItemOptionCreateDTO);
    
        // Tạo tùy chọn sản phẩm mới trong mục đơn hàng
        const newId = v7();
        const orderItemOption = {
            id: newId,
            orderItemId: data.orderItemId,
            optionItemId: data.optionItemId,
            optionName: data.optionName,
            price: data.price,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        await this.orderRepo.insertOrderItemOption(orderItemOption);

        await this.eventPublisher.publish(OrderItemOptionAddedEvent.create({
            orderId: data.orderItemId,
            itemId: newId,
            optionId: data.optionItemId,
            name: data.optionName,
            price: data.price,
            changeType: 'ADDED',
        }, requester.sub));

        return newId;
    }

    // Cập nhật thông tin tùy chọn sản phẩm trong mục đơn hàng theo ID
    async updateOrderItemOption(requester: Requester, orderItemOptionId: string, orderItemOptionUpdateDTO: OrderItemOptionUpdateDTO, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra dữ liệu đầu vào
        const data = orderItemOptionUpdateDTOSchema.parse(orderItemOptionUpdateDTO);

        const existing = await this.orderRepo.getOrderItemOptionById(orderItemOptionId);
        if (!existing) {
            throw AppError.from(ErrOrderItemOptionNotFound, 404);
        }

        // Cập nhật thông tin tùy chọn sản phẩm trong mục đơn hàng theo ID
        await this.orderRepo.updateOrderItemOption(orderItemOptionId, data);

        await this.eventPublisher.publish(OrderItemOptionUpdatedEvent.create({
            orderId: existing.orderItemId,
            itemId: orderItemOptionId,
            optionId: existing.optionItemId,
            name: data.optionName,
            price: data.price,
            changeType: 'UPDATED',
        }, requester.sub));
    }

    // Xóa tùy chọn sản phẩm trong mục đơn hàng theo ID
    async deleteOrderItemOption(requester: Requester, orderItemOptionId: string, ip: string, userAgent: string): Promise<void> {
        // Xóa tùy chọn sản phẩm trong mục đơn hàng theo ID
        const existing = await this.orderRepo.getOrderItemOptionById(orderItemOptionId);
        if (!existing) {
            throw AppError.from(ErrOrderItemOptionNotFound, 404);
        }
        await this.orderRepo.deleteOrderItemOption(orderItemOptionId);

        await this.eventPublisher.publish(OrderItemOptionRemovedEvent.create({
            orderId: existing.orderItemId,
            itemId: orderItemOptionId,
            optionId: existing.optionItemId,
            name: existing.optionName,
            price: existing.price,
            changeType: 'REMOVED',
        }, requester.sub));
    }

    // Lấy thông tin tùy chọn sản phẩm trong mục đơn hàng theo ID
    async getOrderItemOptionById(orderItemOptionId: string): Promise<OrderItemOption | null> {
        return await this.orderRepo.getOrderItemOptionById(orderItemOptionId);
    }

    // Lấy danh sách tùy chọn sản phẩm trong mục đơn hàng theo điều kiện
    async listOrderItemOptions(pagingDTO: PagingDTO, orderItemOptionCondDTO: OrderItemOptionCondDTO): Promise<Paginated<OrderItemOption>> {
        return await this.orderRepo.listOrderItemOptions(orderItemOptionCondDTO, pagingDTO);
    }

    // Lấy danh sách tùy chọn sản phẩm trong mục đơn hàng theo nhiều ID
    async listOrderItemOptionsByIds(orderItemOptionIds: string[]): Promise<OrderItemOption[]> {
        return await this.orderRepo.listOrderItemOptionsByIds(orderItemOptionIds);
    }

    // Order Voucher
    // Tạo mới voucher áp dụng trong đơn hàng
    async createOrderVoucher(requester: Requester, orderVoucherCreateDTO: OrderVoucherCreateDTO, ip: string, userAgent: string): Promise<string> {
        // Kiểm tra dữ liệu đầu vào
        const data = orderVoucherCreateDTOSchema.parse(orderVoucherCreateDTO);

        // Tạo voucher mới trong đơn hàng
        const newId = v7();
        const orderVoucher = {
            id: newId,
            orderId: data.orderId,
            voucherId: data.voucherId,  
            discountApplied: data.discountApplied,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        await this.orderRepo.insertOrderVoucher(orderVoucher);

        await this.eventPublisher.publish(OrderVoucherAppliedEvent.create({
            orderId: data.orderId,
            voucherId: data.voucherId,
            discountValue: data.discountApplied,
            changeType: 'APPLIED',
        }, requester.sub));

        return newId;
    }

    // Cập nhật thông tin voucher áp dụng trong đơn hàng theo ID
    async updateOrderVoucher(requester: Requester, orderVoucherId: string, orderVoucherUpdateDTO: OrderVoucherUpdateDTO, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra dữ liệu đầu vào
        const data = orderVoucherCreateDTOSchema.parse(orderVoucherUpdateDTO);

        const existing = await this.orderRepo.getOrderVoucherById(orderVoucherId);
        if (!existing) {
            throw AppError.from(ErrOrderVoucherNotFound, 404);
        }

        // Cập nhật thông tin voucher áp dụng trong đơn hàng theo ID
        await this.orderRepo.updateOrderVoucher(orderVoucherId, data);
    }

    // Xóa voucher áp dụng trong đơn hàng theo ID
    async deleteOrderVoucher(requester: Requester, orderVoucherId: string, ip: string, userAgent: string): Promise<void> {
        const existing = await this.orderRepo.getOrderVoucherById(orderVoucherId);
        if (!existing) {
            throw AppError.from(ErrOrderVoucherNotFound, 404);
        }
        // Xóa voucher áp dụng trong đơn hàng theo ID
        await this.orderRepo.deleteOrderVoucher(orderVoucherId);

        await this.eventPublisher.publish(OrderVoucherRemovedEvent.create({
            orderId: existing.orderId,
            voucherId: existing.voucherId,
            discountValue: existing.discountApplied,
            changeType: 'REMOVED',
        }, requester.sub));
    }

    // Lấy thông tin voucher áp dụng trong đơn hàng theo ID
    async getOrderVoucherById(orderVoucherId: string): Promise<OrderVoucher | null> {
        return await this.orderRepo.getOrderVoucherById(orderVoucherId);
    }

    // Lấy danh sách voucher áp dụng trong đơn hàng theo điều kiện
    async listOrderVouchers(pagingDTO: PagingDTO, orderVoucherCondDTO: OrderVoucherCondDTO): Promise<Paginated<OrderVoucher>> {
        return await this.orderRepo.listOrderVouchers(orderVoucherCondDTO, pagingDTO);
    }

    // Lấy danh sách voucher áp dụng trong đơn hàng theo nhiều ID
    async listOrderVouchersByIds(orderVoucherIds: string[]): Promise<OrderVoucher[]> {
        return await this.orderRepo.listOrderVouchersByIds(orderVoucherIds);
    }

    // Order Table
    // Tạo mới bàn ăn được đặt trong đơn hàng
    async createOrderTable(requester: Requester, orderTableCreateDTO: OrderTableCreateDTO, ip: string, userAgent: string): Promise<string> {
        // Kiểm tra dữ liệu đầu vào
        const data = orderTableCreateDTOSchema.parse(orderTableCreateDTO);

        // Tạo bàn ăn mới trong đơn hàng
        const newId = v7();
        const orderTable = {
            id: newId,
            orderId: data.orderId,
            tableId: data.tableId,  
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        await this.orderRepo.insertOrderTable(orderTable);

        await this.eventPublisher.publish(OrderTableAssignedEvent.create({
            orderId: data.orderId,
            tableId: data.tableId,
            changeType: 'ASSIGNED',
        }, requester.sub));

        return newId;
    }

    // Cập nhật thông tin bàn ăn được đặt trong đơn hàng theo ID
    async updateOrderTable(requester: Requester, orderTableId: string, orderTableUpdateDTO: OrderTableUpdateDTO, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra dữ liệu đầu vào
        const data = orderTableCreateDTOSchema.parse(orderTableUpdateDTO);

        // Cập nhật thông tin bàn ăn được đặt trong đơn hàng theo ID
        await this.orderRepo.updateOrderTable(orderTableId, data);
    }

    // Xóa bàn ăn được đặt trong đơn hàng theo ID
    async deleteOrderTable(requester: Requester, orderTableId: string, ip: string, userAgent: string): Promise<void> {
        const existing = await this.orderRepo.getOrderTableById(orderTableId);
        if (!existing) {
            throw AppError.from(ErrOrderTableNotFound, 404);
        }
        // Xóa bàn ăn được đặt trong đơn hàng theo ID
        await this.orderRepo.deleteOrderTable(orderTableId);

        await this.eventPublisher.publish(OrderTableUnassignedEvent.create({
            orderId: existing.orderId,
            tableId: existing.tableId,
            changeType: 'UNASSIGNED',
        }, requester.sub));
    }

    // Lấy thông tin bàn ăn được đặt trong đơn hàng theo ID
    async getOrderTableById(orderTableId: string): Promise<OrderTable | null> {
        return await this.orderRepo.getOrderTableById(orderTableId);
    }

    // Lấy danh sách bàn ăn được đặt trong đơn hàng theo điều kiện
    async listOrderTables(pagingDTO: PagingDTO, orderTableCondDTO: OrderTableCondDTO): Promise<Paginated<OrderTable>> {
        return await this.orderRepo.listOrderTables(orderTableCondDTO, pagingDTO);
    }

    // Lấy danh sách bàn ăn được đặt trong đơn hàng theo nhiều ID
    async listOrderTablesByIds(orderTableIds: string[]): Promise<OrderTable[]> {
        return await this.orderRepo.listOrderTablesByIds(orderTableIds);
    }

    // Invoice
    // Tạo mới hóa đơn được tạo từ đơn hàng
    async createInvoice(requester: Requester, invoiceCreateDTO: InvoiceCreateDTO, ip: string, userAgent: string): Promise<string> {
        // Kiểm tra dữ liệu đầu vào
        const data = invoiceCreateDTOSchema.parse(invoiceCreateDTO);

        // Tạo hóa đơn mới được tạo từ đơn hàng
        const newId = v7();
        const invoice = {
            id: newId,
            orderId: data.orderId,
            taxCode: data.taxCode,
            issuedAt: data.issuedAt,
            createdAt: new Date(),
            updatedAt: new Date(),
        }
        await this.orderRepo.insertInvoice(invoice);

        await this.eventPublisher.publish(InvoiceCreatedEvent.create({
            invoiceId: newId,
            orderId: data.orderId,
            taxCode: data.taxCode,
            issuedAt: data.issuedAt,
            changeType: 'CREATED',
        }, requester.sub));

        return newId;
    }

    // Cập nhật thông tin hóa đơn được tạo từ đơn hàng theo ID
    async updateInvoice(requester: Requester, invoiceId: string, invoiceUpdateDTO: InvoiceUpdateDTO, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra dữ liệu đầu vào
        const data = invoiceCreateDTOSchema.parse(invoiceUpdateDTO);

        const existing = await this.orderRepo.getInvoiceById(invoiceId);
        if (!existing) {
            throw AppError.from(ErrInvoiceNotFound, 404);
        }

        // Cập nhật thông tin hóa đơn được tạo từ đơn hàng theo ID
        await this.orderRepo.updateInvoice(invoiceId, data);

        await this.eventPublisher.publish(InvoiceUpdatedEvent.create({
            invoiceId: invoiceId,
            orderId: data.orderId,
            taxCode: data.taxCode,
            issuedAt: data.issuedAt,
            changeType: 'UPDATED',
        }, requester.sub));
    }

    // Xóa hóa đơn được tạo từ đơn hàng theo ID
    async deleteInvoice(requester: Requester, invoiceId: string, ip: string, userAgent: string): Promise<void> {
        const existing = await this.orderRepo.getInvoiceById(invoiceId);
        if (!existing) {
            throw AppError.from(ErrInvoiceNotFound, 404);
        }
        // Xóa hóa đơn được tạo từ đơn hàng theo ID
        await this.orderRepo.deleteInvoice(invoiceId);

        await this.eventPublisher.publish(InvoiceDeletedEvent.create({
            invoiceId: invoiceId,
            orderId: existing.orderId,
            taxCode: existing.taxCode,
            issuedAt: existing.issuedAt,
            changeType: 'DELETED',
        }, requester.sub));
    }

    // Lấy thông tin hóa đơn được tạo từ đơn hàng theo ID
    async getInvoiceById(invoiceId: string): Promise<Invoice | null> {
        return await this.orderRepo.getInvoiceById(invoiceId);
    }

    // Lấy danh sách hóa đơn được tạo từ đơn hàng theo điều kiện
    async listInvoices(pagingDTO: PagingDTO, invoiceCondDTO: InvoiceCondDTO): Promise<Paginated<Invoice>> {
        return await this.orderRepo.listInvoices(invoiceCondDTO, pagingDTO);
    }

    // Lấy danh sách hóa đơn được tạo từ đơn hàng theo nhiều ID
    async listInvoicesByIds(invoiceIds: string[]): Promise<Invoice[]> {
        return await this.orderRepo.listInvoicesByIds(invoiceIds);
    }
}