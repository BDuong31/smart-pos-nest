import { Inject, Injectable } from '@nestjs/common';
import { type IOrderRepository, IOrderService } from '../ports/order.port';
import { ORDER_REPOSITORY } from '../sales.di-token';
import { ErrOrderAlreadyExists, ErrOrderNotFound, OrderStatus, type Order, type OrderItem, type OrderItemOption, type OrderVoucher, type OrderTable, type Invoice } from '../models/order.model';
import { Requester } from 'src/share/interface';
import { InvoiceCondDTO, InvoiceCreateDTO, invoiceCreateDTOSchema, InvoiceUpdateDTO, OrderCondDTO, OrderCreateDTO, orderCreateDTOSchema, OrderItemCondDTO, OrderItemCreateDTO, orderItemCreateDTOSchema, OrderItemOptionCondDTO, OrderItemOptionCreateDTO, orderItemOptionCreateDTOSchema, OrderItemOptionUpdateDTO, orderItemOptionUpdateDTOSchema, OrderItemUpdateDTO, orderItemUpdateDTOSchema, OrderTableCondDTO, OrderTableCreateDTO, orderTableCreateDTOSchema, OrderTableUpdateDTO, OrderUpdateDTO, orderUpdateDTOSchema, OrderVoucherCondDTO, OrderVoucherCreateDTO, orderVoucherCreateDTOSchema, OrderVoucherUpdateDTO } from '../dtos/order.dto';
import { v7 } from 'uuid';
import { AppError, Paginated, PagingDTO } from 'src/share';

// Lớp OrderService cung cấp các phương thức để quản lý đơn hàng
@Injectable()
export class OrderService implements IOrderService {
    constructor(
        @Inject(ORDER_REPOSITORY) private readonly orderRepo: IOrderRepository,
    ){}

    // Order
    // Tạo mới đơn hàng
    async createOrder(requester: Requester, dto: OrderCreateDTO, ip: string, userAgent: string): Promise<string> {
        // Kiểm tra dữ liệu đầu vào
        const data = orderCreateDTOSchema.parse(dto);

        // Kiểm tra xem đơn hàng đã tồn tại chưa
        const existing = await this.orderRepo.listOrders({ 
            userId: data.userId,
            status: OrderStatus.PENDING,
        }, { page: 1, limit: 1 });

        if (existing.data.length > 0) {
            throw AppError.from(ErrOrderAlreadyExists, 409);
        }

        // Tạo đơn hàng mới
        const newId = v7();
        const code =  'BSO-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(1000 + Math.random() * 9000); // Mã đơn hàng theo định dạng BSO-YYYYMMDD-XXXX (BSO là BASO, YYYYMMDD là ngày tạo đơn hàng, XXXX là số ngẫu nhiên từ 1000 đến 9999)

        const order = {
            id: newId,
            code: code,
            userId: data.userId,
            totalAmount: data.totalAmount,
            status: OrderStatus.PENDING,
            createdAt: new Date(),
            updatedAt: new Date(),
        };  

        await this.orderRepo.insertOrder(order);

        return code;
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
    }
    
    // Lấy thông tin đơn hàng theo ID 
    async getOrderById(requester: Requester, orderId: string): Promise<Order | null> {
        return await this.orderRepo.getOrderById(orderId);
    }   
    
    // Lấy danh sách đơn hàng theo điều kiện
    async listOrders(requester: Requester, pagingDTO: PagingDTO, orderCondDTO: OrderCondDTO): Promise<Paginated<Order>> {
        return await this.orderRepo.listOrders(orderCondDTO, pagingDTO);
    }

    // Lấy danh sách đơn hàng theo nhiều ID
    async listOrdersByIds(requester: Requester, orderIds: string[], pagingDTO: PagingDTO): Promise<Paginated<Order>> {
        return await this.orderRepo.listOrdersByIds(orderIds, pagingDTO);
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
        return newId;
    }

    // Cập nhật thông tin mục sản phẩm trong đơn hàng theo ID
    async updateOrderItem(requester: Requester, orderItemId: string, dto: OrderItemUpdateDTO, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra dữ liệu đầu vào
        const data = orderItemUpdateDTOSchema.parse(dto);   

        // Cập nhật thông tin mục sản phẩm trong đơn hàng theo ID
        await this.orderRepo.updateOrderItem(orderItemId, data);
    }

    // Xóa mục sản phẩm trong đơn hàng theo ID
    async deleteOrderItem(requester: Requester, orderItemId: string, ip: string, userAgent: string): Promise<void> {
        // Xóa mục sản phẩm trong đơn hàng theo ID
        await this.orderRepo.deleteOrderItem(orderItemId);
    }

    // Lấy thông tin mục sản phẩm trong đơn hàng theo ID    
    async getOrderItemById(requester: Requester, orderItemId: string): Promise<OrderItem | null> {
        return await this.orderRepo.getOrderItemById(orderItemId);
    }

    // Lấy danh sách mục sản phẩm trong đơn hàng theo điều kiện
    async listOrderItems(requester: Requester, pagingDTO: PagingDTO, orderItemCondDTO: OrderItemCondDTO): Promise<Paginated<OrderItem>> {
        return await this.orderRepo.listOrderItems(orderItemCondDTO, pagingDTO);
    }

    // Lấy danh sách mục sản phẩm trong đơn hàng theo nhiều ID
    async listOrderItemsByIds(requester: Requester, orderItemIds: string[], pagingDTO: PagingDTO): Promise<Paginated<OrderItem>> {
        return await this.orderRepo.listOrderItemsByIds(orderItemIds, pagingDTO);
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
        return newId;
    }

    // Cập nhật thông tin tùy chọn sản phẩm trong mục đơn hàng theo ID
    async updateOrderItemOption(requester: Requester, orderItemOptionId: string, orderItemOptionUpdateDTO: OrderItemOptionUpdateDTO, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra dữ liệu đầu vào
        const data = orderItemOptionUpdateDTOSchema.parse(orderItemOptionUpdateDTO);
    
        // Cập nhật thông tin tùy chọn sản phẩm trong mục đơn hàng theo ID
        await this.orderRepo.updateOrderItemOption(orderItemOptionId, data);
    }

    // Xóa tùy chọn sản phẩm trong mục đơn hàng theo ID
    async deleteOrderItemOption(requester: Requester, orderItemOptionId: string, ip: string, userAgent: string): Promise<void> {
        // Xóa tùy chọn sản phẩm trong mục đơn hàng theo ID
        await this.orderRepo.deleteOrderItemOption(orderItemOptionId);
    }

    // Lấy thông tin tùy chọn sản phẩm trong mục đơn hàng theo ID
    async getOrderItemOptionById(requester: Requester, orderItemOptionId: string): Promise<OrderItemOption | null> {
        return await this.orderRepo.getOrderItemOptionById(orderItemOptionId);
    }

    // Lấy danh sách tùy chọn sản phẩm trong mục đơn hàng theo điều kiện
    async listOrderItemOptions(requester: Requester, pagingDTO: PagingDTO, orderItemOptionCondDTO: OrderItemOptionCondDTO): Promise<Paginated<OrderItemOption>> {
        return await this.orderRepo.listOrderItemOptions(orderItemOptionCondDTO, pagingDTO);
    }

    // Lấy danh sách tùy chọn sản phẩm trong mục đơn hàng theo nhiều ID
    async listOrderItemOptionsByIds(requester: Requester, orderItemOptionIds: string[], pagingDTO: PagingDTO): Promise<Paginated<OrderItemOption>> {
        return await this.orderRepo.listOrderItemOptionsByIds(orderItemOptionIds, pagingDTO);
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

        return newId;
    }

    // Cập nhật thông tin voucher áp dụng trong đơn hàng theo ID
    async updateOrderVoucher(requester: Requester, orderVoucherId: string, orderVoucherUpdateDTO: OrderVoucherUpdateDTO, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra dữ liệu đầu vào
        const data = orderVoucherCreateDTOSchema.parse(orderVoucherUpdateDTO);

        // Cập nhật thông tin voucher áp dụng trong đơn hàng theo ID
        await this.orderRepo.updateOrderVoucher(orderVoucherId, data);
    }

    // Xóa voucher áp dụng trong đơn hàng theo ID
    async deleteOrderVoucher(requester: Requester, orderVoucherId: string, ip: string, userAgent: string): Promise<void> {
        // Xóa voucher áp dụng trong đơn hàng theo ID
        await this.orderRepo.deleteOrderVoucher(orderVoucherId);
    }

    // Lấy thông tin voucher áp dụng trong đơn hàng theo ID
    async getOrderVoucherById(requester: Requester, orderVoucherId: string): Promise<OrderVoucher | null> {
        return await this.orderRepo.getOrderVoucherById(orderVoucherId);
    }

    // Lấy danh sách voucher áp dụng trong đơn hàng theo điều kiện
    async listOrderVouchers(requester: Requester, pagingDTO: PagingDTO, orderVoucherCondDTO: OrderVoucherCondDTO): Promise<Paginated<OrderVoucher>> {
        return await this.orderRepo.listOrderVouchers(orderVoucherCondDTO, pagingDTO);
    }   

    // Lấy danh sách voucher áp dụng trong đơn hàng theo nhiều ID
    async listOrderVouchersByIds(requester: Requester, orderVoucherIds: string[], pagingDTO: PagingDTO): Promise<Paginated<OrderVoucher>> {
        return await this.orderRepo.listOrderVouchersByIds(orderVoucherIds, pagingDTO);
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
        // Xóa bàn ăn được đặt trong đơn hàng theo ID
        await this.orderRepo.deleteOrderTable(orderTableId);
    }

    // Lấy thông tin bàn ăn được đặt trong đơn hàng theo ID
    async getOrderTableById(requester: Requester, orderTableId: string): Promise<OrderTable | null> {
        return await this.orderRepo.getOrderTableById(orderTableId);
    }   

    // Lấy danh sách bàn ăn được đặt trong đơn hàng theo điều kiện
    async listOrderTables(requester: Requester, pagingDTO: PagingDTO, orderTableCondDTO: OrderTableCondDTO): Promise<Paginated<OrderTable>> {
        return await this.orderRepo.listOrderTables(orderTableCondDTO, pagingDTO);
    }

    // Lấy danh sách bàn ăn được đặt trong đơn hàng theo nhiều ID
    async listOrderTablesByIds(requester: Requester, orderTableIds: string[], pagingDTO: PagingDTO): Promise<Paginated<OrderTable>> {
        return await this.orderRepo.listOrderTablesByIds(orderTableIds, pagingDTO);
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
        return newId;
    }

    // Cập nhật thông tin hóa đơn được tạo từ đơn hàng theo ID
    async updateInvoice(requester: Requester, invoiceId: string, invoiceUpdateDTO: InvoiceUpdateDTO, ip: string, userAgent: string): Promise<void> {
        // Kiểm tra dữ liệu đầu vào
        const data = invoiceCreateDTOSchema.parse(invoiceUpdateDTO);

        // Cập nhật thông tin hóa đơn được tạo từ đơn hàng theo ID
        await this.orderRepo.updateInvoice(invoiceId, data);
    }

    // Xóa hóa đơn được tạo từ đơn hàng theo ID
    async deleteInvoice(requester: Requester, invoiceId: string, ip: string, userAgent: string): Promise<void> {
        // Xóa hóa đơn được tạo từ đơn hàng theo ID
        await this.orderRepo.deleteInvoice(invoiceId);
    }

    // Lấy thông tin hóa đơn được tạo từ đơn hàng theo ID
    async getInvoiceById(requester: Requester, invoiceId: string): Promise<Invoice | null> {
        return await this.orderRepo.getInvoiceById(invoiceId);
    }

    // Lấy danh sách hóa đơn được tạo từ đơn hàng theo điều kiện
    async listInvoices(requester: Requester, pagingDTO: PagingDTO, invoiceCondDTO: InvoiceCondDTO): Promise<Paginated<Invoice>> {
        return await this.orderRepo.listInvoices(invoiceCondDTO, pagingDTO);
    }

    // Lấy danh sách hóa đơn được tạo từ đơn hàng theo nhiều ID
    async listInvoicesByIds(requester: Requester, invoiceIds: string[], pagingDTO: PagingDTO): Promise<Paginated<Invoice>> {
        return await this.orderRepo.listInvoicesByIds(invoiceIds, pagingDTO);
    }
}