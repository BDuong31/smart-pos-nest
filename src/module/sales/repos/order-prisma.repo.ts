import prisma from 'src/share/components/prisma'
import { Injectable } from '@nestjs/common';
import { Order, OrderItem, OrderItemOption, OrderVoucher, OrderTable, Invoice } from '../models/order.model';
import type { OrderCreateDTO, OrderUpdateDTO, OrderCondDTO, OrderItemCreateDTO, OrderItemUpdateDTO, OrderItemCondDTO,  OrderItemOptionCreateDTO, OrderItemOptionUpdateDTO, OrderItemOptionCondDTO, OrderVoucherCreateDTO, OrderVoucherUpdateDTO, OrderVoucherCondDTO, OrderTableCreateDTO, OrderTableUpdateDTO, OrderTableCondDTO, InvoiceCreateDTO, InvoiceUpdateDTO, InvoiceCondDTO } from '../dtos/order.dto';
import type { IOrderRepository } from '../ports/order.port';
import type { Order as OrderPrisma, OrderItem as OrderItemPrisma, OrderItemOption as OrderItemOptionPrisma, OrderVoucher as OrderVoucherPrisma, OrderTable as OrderTablePrisma, Invoice as InvoicePrisma } from '@prisma/client';
import { Paginated, PagingDTO } from 'src/share/data-model';

// Lớp OrderReposiory cung cấp phương thức truy vấn dữ liệu đơn hàng từ Prisma
@Injectable()
export class OrderPrismaRepo implements IOrderRepository {
    // Order
    // Lấy đơn hàng theo ID
    async getOrderById(id: string): Promise<Order | null> {
        const data = await prisma.order.findFirst({ where: { id } });

        if (!data) return null;
        
        return this._toOrderModel(data);
    }

    // Lấy danh sách đơn hàng theo điều kiện
    async listOrders(cond: OrderCondDTO, paging: PagingDTO): Promise<Paginated<Order>> {  
        const { userId, totalAmount, status, ...rest } = cond;  

        let where = {
            ...rest,
        }

        if (userId) {
            where = {
                ...where,
                userId: userId,
            }
        }

        if (totalAmount) {      
            where = {
                ...where,
                totalAmount: totalAmount,
            }
        }

        if (status) {
            where = {
                ...where,
                status: status,
            }
        }

        const total = await prisma.order.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.order.findMany({
            where,
            skip,
            take: paging.limit,
            orderBy: { createdAt: 'desc' },
        });

        return {
            data: result.map(this._toOrderModel),
            paging,
            total
        };
    }

    // Lấy danh sách đơn hàng theo nhiều ID
    async listOrdersByIds(ids: string[]): Promise<Order[]> {
        const data = await prisma.order.findMany({ where: { id: { in: ids } } });

        return data.map(this._toOrderModel);
    }

    // Tạo mới đơn hàng
    async insertOrder(order: Order): Promise<void> {
        await prisma.order.create({ data: order });
    }

    // Cập nhật thông tin đơn hàng theo ID
    async updateOrder(orderId: string, orderUpdateDTO: OrderUpdateDTO): Promise<void> {
        await prisma.order.update({ where: { id: orderId }, data: orderUpdateDTO });
    }

    // Xóa đơn hàng theo ID
    async deleteOrder(orderId: string): Promise<void> {
        await prisma.order.delete({ where: { id: orderId } });
    }

    // Order Item
    // Lấy mục sản phẩm trong đơn hàng theo ID
    async getOrderItemById(orderItemId: string): Promise<OrderItem | null> {
        const data = await prisma.orderItem.findFirst({ where: { id: orderItemId } });

        if (!data) return null;
        
        return this._toOrderItemModel(data);
    }

    // Lấy danh sách mục sản phẩm trong đơn hàng theo điều kiện
    async listOrderItems(cond: OrderItemCondDTO, paging: PagingDTO): Promise<Paginated<OrderItem>> {    
        const { orderId, productId, variantId, productName, price, quantity, ...rest } = cond;

        let where = {
            ...rest,
        }

        if (orderId) {
            where = {
                ...where,
                orderId: orderId,
            }
        }

        if (productId) {
            where = {
                ...where,
                productId: productId,
            }
        }

        if (variantId) {
            where = {
                ...where,
                variantId: variantId,
            }
        }

        if (productName) {
            where = {
                ...where,
                productName: productName,
            }
        }

        if (price) {
            where = {
                ...where,
                price: price,
            }
        }

        if (quantity) {
            where = {
                ...where,
                quantity: quantity,
            }
        }

        const total = await prisma.orderItem.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.orderItem.findMany({
            where,
            skip,
            take: paging.limit,
            orderBy: { productName: 'asc' },
        });

        return {
            data: result.map(this._toOrderItemModel),
            paging,
            total
        };
    }

    // Lấy danh sách mục sản phẩm trong đơn hàng theo nhiều ID
    async listOrderItemsByIds(ids: string[]): Promise<OrderItem[]> {
        const data = await prisma.orderItem.findMany({ where: { id: { in: ids } } });

        return data.map(this._toOrderItemModel);
    }

    // Tạo mới mục sản phẩm trong đơn hàng
    async insertOrderItem(orderItem: OrderItem): Promise<void> {
        await prisma.orderItem.create({ data: orderItem });
    }

    // Cập nhật thông tin mục sản phẩm trong đơn hàng theo ID
    async updateOrderItem(orderItemId: string, orderItemUpdateDTO: OrderItemUpdateDTO): Promise<void> {
        await prisma.orderItem.update({ where: { id: orderItemId }, data: orderItemUpdateDTO });
    }

    // Xóa mục sản phẩm trong đơn hàng theo ID
    async deleteOrderItem(orderItemId: string): Promise<void> {
        await prisma.orderItem.delete({ where: { id: orderItemId } });
    }

    // Order Item Option
    // Lấy tùy chọn sản phẩm trong mục đơn hàng theo ID
    async getOrderItemOptionById(orderItemOptionId: string): Promise<OrderItemOption | null> {
        const data = await prisma.orderItemOption.findFirst({ where: { id: orderItemOptionId } });

        if (!data) return null;
        
        return this._toOrderItemOptionModel(data);
    }

    // Lấy danh sách tùy chọn sản phẩm trong mục đơn hàng theo điều kiện
    async listOrderItemOptions(cond: OrderItemOptionCondDTO, paging: PagingDTO): Promise<Paginated<OrderItemOption>> {    
        const { orderItemId, optionItemId, optionName, price, ...rest } = cond;

        let where = {
            ...rest,
        }

        if (orderItemId) {
            where = {
                ...where,
                orderItemId: orderItemId,
            }
        }

        if (optionItemId) {
            where = {
                ...where,
                optionItemId: optionItemId,
            } 
        }

        if (optionName) {
            where = {
                ...where,
                optionName: optionName,
            }
        }

        if (price) {
            where = {
                ...where,
                price: price,
            }
        }

        const total = await prisma.orderItemOption.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.orderItemOption.findMany({
            where,
            skip,
            take: paging.limit,
            orderBy: { optionName: 'asc' },
        });

        return {
            data: result.map(this._toOrderItemOptionModel),
            paging,
            total
        };
    }

    // Lấy danh sách tùy chọn sản phẩm trong mục đơn hàng theo nhiều ID
    async listOrderItemOptionsByIds(ids: string[]): Promise<OrderItemOption[]> {
        const data = await prisma.orderItemOption.findMany({ where: { id: { in: ids } } });

        return data.map(this._toOrderItemOptionModel);
    }
   
    // Tạo mới tùy chọn sản phẩm trong mục đơn hàng
    async insertOrderItemOption(orderItemOption: OrderItemOption): Promise<void> {
        await prisma.orderItemOption.create({ data: orderItemOption });
    }

    // Cập nhật thông tin tùy chọn sản phẩm trong mục đơn hàng theo ID
    async updateOrderItemOption(orderItemOptionId: string, orderItemOptionUpdateDTO: OrderItemOptionUpdateDTO): Promise<void> {
        await prisma.orderItemOption.update({ where: { id: orderItemOptionId }, data: orderItemOptionUpdateDTO });
    }

    // Xóa tùy chọn sản phẩm trong mục đơn hàng theo ID
    async deleteOrderItemOption(orderItemOptionId: string): Promise<void> {
        await prisma.orderItemOption.delete({ where: { id: orderItemOptionId } });
    }

    // Order Voucher
    // Lấy voucher trong đơn hàng theo ID
    async getOrderVoucherById(orderVoucherId: string): Promise<OrderVoucher | null> {
        const data = await prisma.orderVoucher.findFirst({ where: { id: orderVoucherId } });

        if (!data) return null;
        
        return this._toOrderVoucherModel(data);
    }

    // Lấy danh sách voucher trong đơn hàng theo điều kiện
    async listOrderVouchers(cond: OrderVoucherCondDTO, paging: PagingDTO): Promise<Paginated<OrderVoucher>> {    
        const { orderId, voucherId, discountApplied, ...rest } = cond;

        let where = {
            ...rest,
        }

        if (orderId) {
            where = {
                ...where,
                orderId: orderId,
            }
        }

        if (voucherId) {
            where = {
                ...where,
                voucherId: voucherId,
            }
        }

        if (discountApplied) {
            where = {
                ...where,
                discountApplied: discountApplied,
            }
        }

        const total = await prisma.orderVoucher.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.orderVoucher.findMany({
            where,
            skip,
            take: paging.limit,
            orderBy: { createdAt: 'desc' },
        });

        return {
            data: result.map(this._toOrderVoucherModel),
            paging,
            total
        };
    }

    // Lấy danh sách voucher trong đơn hàng theo nhiều ID
    async listOrderVouchersByIds(ids: string[]): Promise<OrderVoucher[]> {
        const data = await prisma.orderVoucher.findMany({ where: { id: { in: ids } } });

        return data.map(this._toOrderVoucherModel);
    }

    // Tạo mới voucher trong đơn hàng
    async insertOrderVoucher(orderVoucher: OrderVoucher): Promise<void> {
        await prisma.orderVoucher.create({ data: orderVoucher });
    }

    // Cập nhật thông tin voucher trong đơn hàng theo ID
    async updateOrderVoucher(orderVoucherId: string, orderVoucherUpdateDTO: OrderVoucherUpdateDTO): Promise<void> {
        await prisma.orderVoucher.update({ where: { id: orderVoucherId }, data: orderVoucherUpdateDTO });
    }

    // Xóa voucher trong đơn hàng theo ID
    async deleteOrderVoucher(orderVoucherId: string): Promise<void> {
        await prisma.orderVoucher.delete({ where: { id: orderVoucherId } });    
    }

    // Order Table
    // Lấy bàn trong đơn hàng theo ID
    async getOrderTableById(orderTableId: string): Promise<OrderTable | null> {
        const data = await prisma.orderTable.findFirst({ where: { id: orderTableId } });    

        if (!data) return null;
        
        return this._toOrderTableModel(data);
    }

    // Lấy danh sách bàn trong đơn hàng theo điều kiện
    async listOrderTables(cond: OrderTableCondDTO, paging: PagingDTO): Promise<Paginated<OrderTable>> { 
        const { orderId, tableId, ...rest } = cond;

        let where = {
            ...rest,
        }

        if (orderId) {
            where = {
                ...where,
                orderId: orderId,
            }
        }

        if (tableId) {
            where = {
                ...where,
                 tableId: tableId,
             }
        }

        const total = await prisma.orderTable.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.orderTable.findMany({
            where,
            skip,
            take: paging.limit,
            orderBy: { createdAt: 'desc' },
        });

        return {
            data: result.map(this._toOrderTableModel),
            paging,
            total
        };
    }

    // Lấy danh sách bàn trong đơn hàng theo nhiều ID
    async listOrderTablesByIds(ids: string[]): Promise<OrderTable[]> {
        const data = await prisma.orderTable.findMany({ where: { id: { in: ids } } });

        return data.map(this._toOrderTableModel);
    }

    // Tạo mới bàn trong đơn hàng
    async insertOrderTable(orderTable: OrderTable): Promise<void> {
        await prisma.orderTable.create({ data: orderTable });
    }

    // Cập nhật thông tin bàn trong đơn hàng theo ID
    async updateOrderTable(orderTableId: string, orderTableUpdateDTO: OrderTableUpdateDTO): Promise<void> {
        await prisma.orderTable.update({ where: { id: orderTableId }, data: orderTableUpdateDTO });
    }

    // Xóa bàn trong đơn hàng theo ID
    async deleteOrderTable(orderTableId: string): Promise<void> {
        await prisma.orderTable.delete({ where: { id: orderTableId } });
    }

    // Invoice
    // Lấy hoá đơn công ty theo ID
    async getInvoiceById(invoiceId: string): Promise<Invoice | null> {
        const data = await prisma.invoice.findFirst({ where: { id: invoiceId } });

        if (!data) return null;
        
        return this._toInvoiceModel(data);
    }

    // Lấy danh sách hoá đơn công ty theo điều kiện
    async listInvoices(cond: InvoiceCondDTO, paging: PagingDTO): Promise<Paginated<Invoice>> {
        const { orderId, taxCode, issuedAt, ...rest } = cond;
        let where = {
            ...rest,
        }

        if (orderId) {
            where = {
                ...where,
                orderId: orderId,
            }
        }

        if (taxCode) {
            where = {
                ...where,
                taxCode: taxCode,
            }
        }

        if (issuedAt) {
            where = {
                ...where,
                issuedAt: issuedAt,
             }
        }

        const total = await prisma.invoice.count({ where });

        const skip = (paging.page - 1) * paging.limit;

        const result = await prisma.invoice.findMany({
            where,
            skip,
            take: paging.limit,
            orderBy: { issuedAt: 'desc' },
        });

        return {
            data: result.map(this._toInvoiceModel),
            paging,
            total
        };
    }

    // Lấy danh sách hoá đơn công ty theo nhiều ID
    async listInvoicesByIds(ids: string[]): Promise<Invoice[]> {
        const data = await prisma.invoice.findMany({ where: { id: { in: ids } } });

        return data.map(this._toInvoiceModel);
    }

    // Tạo mới hoá đơn công ty
    async insertInvoice(invoice: Invoice): Promise<void> {
        await prisma.invoice.create({ data: invoice });
    }

    // Cập nhật thông tin hoá đơn công ty theo ID
    async updateInvoice(invoiceId: string, invoiceUpdateDTO: InvoiceUpdateDTO): Promise<void> {
        await prisma.invoice.update({ where: { id: invoiceId }, data: invoiceUpdateDTO });
    }

    // Xóa hoá đơn công ty theo ID
    async deleteInvoice(invoiceId: string): Promise<void> {
        await prisma.invoice.delete({ where: { id: invoiceId } });
    }

    // Chuyển đổi dữ liệu từ Prisma sang model Order
    private _toOrderModel(data: OrderPrisma): Order {
        return { ...data} as Order
    }

    // Chuyển đổi dữ liệu từ Prisma sang model OrderItem
    private _toOrderItemModel(data: OrderItemPrisma): OrderItem {
        return { ...data} as OrderItem
    }

    // Chuyển đổi dữ liệu từ Prisma sang model OrderItemOption
    private _toOrderItemOptionModel(data: OrderItemOptionPrisma): OrderItemOption {
        return { ...data} as OrderItemOption
    }

    // Chuyển đổi dữ liệu từ Prisma sang model OrderVoucher
    private _toOrderVoucherModel(data: OrderVoucherPrisma): OrderVoucher {
        return { ...data} as OrderVoucher
    }

    // Chuyển đổi dữ liệu từ Prisma sang model OrderTable
    private _toOrderTableModel(data: OrderTablePrisma): OrderTable {
        return { ...data} as OrderTable
    }

    // Chuyển đổi dữ liệu từ Prisma sang model Invoice
    private _toInvoiceModel(data: InvoicePrisma): Invoice {
        return { ...data} as Invoice
    }
}