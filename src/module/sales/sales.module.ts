import { Module, Provider } from "@nestjs/common";
import { CART_REPOSITORY, CART_SERVICE, ORDER_REPOSITORY, ORDER_SERVICE, PAYMENT_REPOSITORY, PAYMENT_SERVICE, VOUCHER_REPOSITORY, VOUCHER_SERVICE } from "./sales.di-token";
import { CartPrismaRepo } from "./repos/cart-prisma.repo";
import { CartService } from "./services/cart.service";
import { OrderPrismaRepo } from "./repos/order-prisma.repo";
import { OrderService } from "./services/order-service";
import { VoucherPrismaRepo } from "./repos/voucher-prisma.repo";
import { VoucherService } from "./services/voucher.service";
import { PaymentPrismaRepo } from "./repos/payment-prisma.repo";
import { PaymentService } from "./services/payment.service";
import { ShareModule } from "src/share/module";
import { CartHttpController, CartItemHttpController, CartItemOptionHttpController, CartItemOptionRpcController, CartItemRpcController, CartRpcController } from "./controller/cart-http.controller";
import { InvoiceHttpController, InvoiceRpcController, OrderHttpController, OrderItemHttpController, OrderItemOptionHttpController, OrderItemOptionRpcController, OrderItemRpcController, OrderRpcController, OrderTableHttpController, OrderTableRpcController, OrderVoucherHttpController, OrderVoucherRpcController } from "./controller/order-http.controller";
import { VoucherHttpController, VoucherRpcController } from "./controller/voucher-http.controller";
import { PaymentHttpController, PaymentRpcController } from "./controller/payment-http.controller";
import { MomoService } from "./services/payment/momo.service";
import { ZalopayService } from "./services/payment/zalo.service";
import { VnpayService } from "./services/payment/vnpay.service";
import { ConfigModule } from "@nestjs/config";
import { CartConsumer } from "./consumers/cart.consumer";

const dependencies: Provider[] = [
    { provide: CART_REPOSITORY, useClass: CartPrismaRepo },
    { provide: CART_SERVICE, useClass: CartService },
    { provide: ORDER_REPOSITORY, useClass: OrderPrismaRepo },
    { provide: ORDER_SERVICE, useClass: OrderService },
    { provide: VOUCHER_REPOSITORY, useClass: VoucherPrismaRepo },
    { provide: VOUCHER_SERVICE, useClass: VoucherService },
    { provide: PAYMENT_REPOSITORY, useClass: PaymentPrismaRepo },
    { provide: PAYMENT_SERVICE, useClass: PaymentService },
    MomoService,
    ZalopayService,
    VnpayService,
]

@Module({
    imports: [ShareModule, ConfigModule.forRoot({isGlobal: true})],
    controllers: [
        // 1. NHÓM DÀI NHẤT / CỤ THỂ NHẤT LÊN ĐẦU (Item Options, Vouchers, Tables)
        CartItemOptionHttpController, 
        CartItemOptionRpcController,
        OrderItemOptionHttpController, 
        OrderItemOptionRpcController,
        OrderTableHttpController, 
        OrderTableRpcController, 
        OrderVoucherHttpController, 
        OrderVoucherRpcController, 
        
        // 2. NHÓM DÀI VỪA (Items)
        CartItemHttpController, 
        CartItemRpcController, 
        OrderItemHttpController, 
        OrderItemRpcController, 
        CartHttpController, 
        CartRpcController,
        OrderHttpController,
        OrderRpcController,
        InvoiceHttpController,
        InvoiceRpcController,
        VoucherHttpController,
        VoucherRpcController,
        PaymentHttpController,
        PaymentRpcController,
        CartConsumer
    ],
    providers: [...dependencies],
})
export class SalesModule {}