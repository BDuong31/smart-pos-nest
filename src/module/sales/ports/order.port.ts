import { Paginated, PagingDTO, Requester } from "src/share";
import { Order, OrderItem, OrderItemOption, OrderVoucher, OrderTable, Invoice } from "../models/order.model";
import type { OrderCreateDTO, OrderUpdateDTO, OrderCondDTO, OrderItemCreateDTO, OrderItemUpdateDTO, OrderItemCondDTO, OrderItemOptionCreateDTO, OrderItemOptionUpdateDTO, OrderItemOptionCondDTO, OrderVoucherCreateDTO, OrderVoucherUpdateDTO, OrderVoucherCondDTO, OrderTableCreateDTO, OrderTableUpdateDTO, OrderTableCondDTO, InvoiceCreateDTO, InvoiceUpdateDTO, InvoiceCondDTO } from "../dtos/order.dto";

// ============================
// Định nghĩa các interface cho Order
// ============================

// Định nghĩa các phương thức mà OrderService phải triển khai   
export interface IOrderService {
    // Order
    createOrder(requester: Requester, orderCreateDTO: OrderCreateDTO,  ip: string, userAgent: string): Promise<string> // Tạo đơn hàng mới
    updateOrder(requester: Requester, orderId: string, orderUpdateDTO: OrderUpdateDTO, ip: string, userAgent: string): Promise<void> // Cập nhật thông tin đơn hàng theo ID
    deleteOrder(requester: Requester, orderId: string, ip: string, userAgent: string): Promise<void> // Xóa đơn hàng theo ID
    getOrderById(requester: Requester, orderId: string): Promise<Order | null> // Lấy thông tin đơn hàng theo ID
    listOrders(requester: Requester, pagingDTO: PagingDTO, orderCondDTO: OrderCondDTO): Promise<Paginated<Order>> // Lấy danh sách đơn hàng theo điều kiện
    listOrdersByIds(requester: Requester, orderIds: string[], pagingDTO: PagingDTO): Promise<Paginated<Order>> // Lấy danh sách đơn hàng theo nhiều ID

    // Order Item
    createOrderItem(requester: Requester, orderItemCreateDTO: OrderItemCreateDTO, ip: string, userAgent: string): Promise<string> // Tạo mục sản phẩm mới trong đơn hàng
    updateOrderItem(requester: Requester, orderItemId: string, orderItemUpdateDTO: OrderItemUpdateDTO, ip: string, userAgent: string): Promise<void> // Cập nhật thông tin mục sản phẩm trong đơn hàng theo ID
    deleteOrderItem(requester: Requester, orderItemId: string, ip: string, userAgent: string): Promise<void> // Xóa mục sản phẩm trong đơn hàng theo ID
    getOrderItemById(requester: Requester, orderItemId: string): Promise<OrderItem | null> // Lấy thông tin mục sản phẩm trong đơn hàng theo ID
    listOrderItems(requester: Requester, pagingDTO: PagingDTO, orderItemCondDTO: OrderItemCondDTO): Promise<Paginated<OrderItem>> // Lấy danh sách mục sản phẩm trong đơn hàng theo điều kiện
    listOrderItemsByIds(requester: Requester, orderItemIds: string[], pagingDTO: PagingDTO): Promise<Paginated<OrderItem>> // Lấy danh sách mục sản phẩm trong đơn hàng theo nhiều ID

    // Order Item Option
    createOrderItemOption(requester: Requester, orderItemOptionCreateDTO: OrderItemOptionCreateDTO, ip: string, userAgent: string): Promise<string> // Tạo tùy chọn sản phẩm mới trong mục đơn hàng
    updateOrderItemOption(requester: Requester, orderItemOptionId: string, orderItemOptionUpdateDTO: OrderItemOptionUpdateDTO, ip: string, userAgent: string): Promise<void> // Cập nhật thông tin tùy chọn sản phẩm trong mục đơn hàng theo ID
    deleteOrderItemOption(requester: Requester, orderItemOptionId: string, ip: string, userAgent: string): Promise<void> // Xóa tùy chọn sản phẩm trong mục đơn hàng theo ID
    getOrderItemOptionById(requester: Requester, orderItemOptionId: string): Promise<OrderItemOption | null> // Lấy thông tin tùy chọn sản phẩm trong mục đơn hàng theo ID
    listOrderItemOptions(requester: Requester, pagingDTO: PagingDTO, orderItemOptionCondDTO: OrderItemOptionCondDTO): Promise<Paginated<OrderItemOption>> // Lấy danh sách tùy chọn sản phẩm trong mục đơn hàng theo điều kiện
    listOrderItemOptionsByIds(requester: Requester, orderItemOptionIds: string[], pagingDTO: PagingDTO): Promise<Paginated<OrderItemOption>> // Lấy danh sách tùy chọn sản phẩm trong mục đơn hàng theo nhiều ID

    // Order Voucher
    createOrderVoucher(requester: Requester, orderVoucherCreateDTO: OrderVoucherCreateDTO, ip: string, userAgent: string): Promise<string> // Tạo voucher mới trong đơn hàng
    updateOrderVoucher(requester: Requester, orderVoucherId: string, orderVoucherUpdateDTO: OrderVoucherUpdateDTO, ip: string, userAgent: string): Promise<void> // Cập nhật thông tin voucher trong đơn hàng theo ID
    deleteOrderVoucher(requester: Requester, orderVoucherId: string, ip: string, userAgent: string): Promise<void> // Xóa voucher trong đơn hàng theo ID
    getOrderVoucherById(requester: Requester, orderVoucherId: string): Promise<OrderVoucher | null> // Lấy thông tin voucher trong đơn hàng theo ID
    listOrderVouchers(requester: Requester, pagingDTO: PagingDTO, orderVoucherCondDTO: OrderVoucherCondDTO): Promise<Paginated<OrderVoucher>> // Lấy danh sách voucher trong đơn hàng theo điều kiện
    listOrderVouchersByIds(requester: Requester, orderVoucherIds: string[], pagingDTO: PagingDTO): Promise<Paginated<OrderVoucher>> // Lấy danh sách voucher trong đơn hàng theo nhiều ID

    // Order Table
    createOrderTable(requester: Requester, orderTableCreateDTO: OrderTableCreateDTO, ip: string, userAgent: string): Promise<string> // Tạo bàn mới trong đơn hàng
    updateOrderTable(requester: Requester, orderTableId: string, orderTableUpdateDTO: OrderTableUpdateDTO, ip: string, userAgent: string): Promise<void> // Cập nhật thông tin bàn trong đơn hàng theo ID
    deleteOrderTable(requester: Requester, orderTableId: string, ip: string, userAgent: string): Promise<void> // Xóa bàn trong đơn hàng theo ID
    getOrderTableById(requester: Requester, orderTableId: string): Promise<OrderTable | null> // Lấy thông tin bàn trong đơn hàng theo ID
    listOrderTables(requester: Requester, pagingDTO: PagingDTO, orderTableCondDTO: OrderTableCondDTO): Promise<Paginated<OrderTable>> // Lấy danh sách bàn trong đơn hàng theo điều kiện
    listOrderTablesByIds(requester: Requester, orderTableIds: string[], pagingDTO: PagingDTO): Promise<Paginated<OrderTable>> // Lấy danh sách bàn trong đơn hàng theo nhiều ID

    // Invoice
    createInvoice(requester: Requester, invoiceCreateDTO: InvoiceCreateDTO, ip: string, userAgent: string): Promise<string> // Tạo hoá đơn công ty mới
    updateInvoice(requester: Requester, invoiceId: string, invoiceUpdateDTO: InvoiceUpdateDTO, ip: string, userAgent: string): Promise<void> // Cập nhật thông tin hoá đơn công ty theo ID
    deleteInvoice(requester: Requester, invoiceId: string, ip: string, userAgent: string): Promise<void> // Xóa hoá đơn công ty theo ID
    getInvoiceById(requester: Requester, invoiceId: string): Promise<Invoice | null> // Lấy thông tin hoá đơn công ty theo ID
    listInvoices(requester: Requester, pagingDTO: PagingDTO, invoiceCondDTO: InvoiceCondDTO): Promise<Paginated<Invoice>> // Lấy danh sách hoá đơn công ty theo điều kiện
    listInvoicesByIds(requester: Requester, invoiceIds: string[], pagingDTO: PagingDTO): Promise<Paginated<Invoice>> // Lấy danh sách hoá đơn công ty theo nhiều ID
}

// Định nghĩa các phương thức mà OrderRepository phải triển khai
export interface IOrderRepository {
    // Order
    getOrderById(orderId: string): Promise<Order | null> // Lấy thông tin đơn hàng theo ID
    listOrders(cond: OrderCondDTO, paging: PagingDTO): Promise<Paginated<Order>> // Lấy danh sách đơn hàng theo điều kiện
    listOrdersByIds(orderIds: string[], paging: PagingDTO): Promise<Paginated<Order>> // Lấy danh sách đơn hàng theo nhiều ID
    insertOrder(order: Order): Promise<void> // Tạo mới đơn hàng
    updateOrder(orderId: string, orderUpdateDTO: OrderUpdateDTO): Promise<void> // Cập nhật thông tin đơn hàng theo ID
    deleteOrder(orderId: string): Promise<void> // Xóa đơn hàng theo ID
    
    // Order Item
    getOrderItemById(orderItemId: string): Promise<OrderItem | null> // Lấy thông tin mục sản phẩm trong đơn hàng theo ID
    listOrderItems(cond: OrderItemCondDTO, paging: PagingDTO): Promise<Paginated<OrderItem>> // Lấy danh sách mục sản phẩm trong đơn hàng theo điều kiện
    listOrderItemsByIds(orderItemIds: string[], paging: PagingDTO): Promise<Paginated<OrderItem>> // Lấy danh sách mục sản phẩm trong đơn hàng theo nhiều ID
    insertOrderItem(orderItem: OrderItem): Promise<void> // Tạo mới mục sản phẩm trong đơn hàng
    updateOrderItem(orderItemId: string, orderItemUpdateDTO: OrderItemUpdateDTO): Promise<void> // Cập nhật thông tin mục sản phẩm trong đơn hàng theo ID
    deleteOrderItem(orderItemId: string): Promise<void> // Xóa mục sản phẩm trong đơn hàng theo ID

    // Order Item Option
    getOrderItemOptionById(orderItemOptionId: string): Promise<OrderItemOption | null> // Lấy thông tin tùy chọn sản phẩm trong mục đơn hàng theo ID   
    listOrderItemOptions(cond: OrderItemOptionCondDTO, paging: PagingDTO): Promise<Paginated<OrderItemOption>> // Lấy danh sách tùy chọn sản phẩm trong mục đơn hàng theo điều kiện
    listOrderItemOptionsByIds(orderItemOptionIds: string[], paging: PagingDTO): Promise<Paginated<OrderItemOption>> // Lấy danh sách tùy chọn sản phẩm trong mục đơn hàng theo nhiều ID
    insertOrderItemOption(orderItemOption: OrderItemOption): Promise<void> // Tạo mới tùy chọn sản phẩm trong mục đơn hàng
    updateOrderItemOption(orderItemOptionId: string, orderItemOptionUpdateDTO: OrderItemOptionUpdateDTO): Promise<void> // Cập nhật thông tin tùy chọn sản phẩm trong mục đơn hàng theo ID
    deleteOrderItemOption(orderItemOptionId: string): Promise<void> // Xóa tùy chọn sản phẩm trong mục đơn hàng theo ID
    
    // Order Voucher
    getOrderVoucherById(orderVoucherId: string): Promise<OrderVoucher | null> // Lấy thông tin voucher trong đơn hàng theo ID
    listOrderVouchers(cond: OrderVoucherCondDTO, paging: PagingDTO): Promise<Paginated<OrderVoucher>> // Lấy danh sách voucher trong đơn hàng theo điều kiện
    listOrderVouchersByIds(orderVoucherIds: string[], paging: PagingDTO): Promise<Paginated<OrderVoucher>> // Lấy danh sách voucher trong đơn hàng theo nhiều ID
    insertOrderVoucher(orderVoucher: OrderVoucher): Promise<void> // Tạo mới voucher trong đơn hàng
    updateOrderVoucher(orderVoucherId: string, orderVoucherUpdateDTO: OrderVoucherUpdateDTO): Promise<void> // Cập nhật thông tin voucher trong đơn hàng theo ID
    deleteOrderVoucher(orderVoucherId: string): Promise<void> // Xóa voucher trong đơn hàng theo ID

    // Order Table
    getOrderTableById(orderTableId: string): Promise<OrderTable | null> // Lấy thông tin bàn trong đơn hàng theo ID
    listOrderTables(cond: OrderTableCondDTO, paging: PagingDTO): Promise<Paginated<OrderTable>> // Lấy danh sách bàn trong đơn hàng theo điều kiện
    listOrderTablesByIds(orderTableIds: string[], paging: PagingDTO): Promise<Paginated<OrderTable>> // Lấy danh sách bàn trong đơn hàng theo nhiều ID
    insertOrderTable(orderTable: OrderTable): Promise<void> // Tạo mới bàn trong đơn hàng
    updateOrderTable(orderTableId: string, orderTableUpdateDTO: OrderTableUpdateDTO): Promise<void> // Cập nhật thông tin bàn trong đơn hàng theo ID
    deleteOrderTable(orderTableId: string): Promise<void> // Xóa bàn trong đơn hàng theo ID

    // Invoice
    getInvoiceById(invoiceId: string): Promise<Invoice | null> // Lấy thông tin hoá đơn công ty theo ID
    listInvoices(cond: InvoiceCondDTO, paging: PagingDTO): Promise<Paginated<Invoice>> // Lấy danh sách hoá đơn công ty theo điều kiện
    listInvoicesByIds(invoiceIds: string[], paging: PagingDTO): Promise<Paginated<Invoice>> // Lấy danh sách hoá đơn công ty theo nhiều ID
    insertInvoice(invoice: Invoice): Promise<void> // Tạo mới hoá đơn công ty
    updateInvoice(invoiceId: string, invoiceUpdateDTO: InvoiceUpdateDTO): Promise<void> // Cập nhật thông tin hoá đơn công ty theo ID
    deleteInvoice(invoiceId: string): Promise<void> // Xóa hoá đơn công ty theo ID
}