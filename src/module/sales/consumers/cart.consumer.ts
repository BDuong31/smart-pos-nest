import { EvtOrderItemAdded, OrderItemAddedEvent } from './../../../share/event/oder.evt';
import { Controller, Inject, OnModuleInit} from '@nestjs/common';
import { RabbitMQClient } from 'src/share/components/rabbitmq';
import type { ICartRepository } from "../ports/cart.port";
import { CartItemAddedEvent, CartItemRemovedEvent, CartItemUpdatedEvent, EvtCartItemAdded, EvtCartItemRemoved, EvtCartItemUpdated } from 'src/share/event/cart.evt';
import { OrderCreatedEvent } from 'src/share/event/oder.evt';

@Controller()
export class CartConsumer implements OnModuleInit {
    constructor(
        @Inject() private readonly cartRepo: ICartRepository,
        private readonly rabbitMQClient: RabbitMQClient
    ) {}

    async onModuleInit() {
        this.subscribe();
    }

    async CartItemCreated(evt: CartItemAddedEvent) {
        this.cartRepo.increaseCount(evt.payload.cartId, "totalItem", evt.payload.quantity!);
    }

    async CartItemDeleted(evt: CartItemRemovedEvent) {
        this.cartRepo.decreaseCount(evt.payload.cartId, "totalItem", evt.payload.quantity!);
        this.cartRepo.deleteCartItemOptionByCartItemId(evt.payload.cartItemId!);
    }

    async CartItemUpdate(evt: CartItemUpdatedEvent) {
        if (evt.payload.statusUpdateCartItem === 'increase')
        this.cartRepo.increaseCount(evt.payload.cartId, "totalItem", evt.payload.quantity!);
        else
        this.cartRepo.decreaseCount(evt.payload.cartId, "totalItem", evt.payload.quantity!);
    }

    async OrderItemAdded(evt: OrderItemAddedEvent) {
        this.cartRepo.deleteCartItem(evt.payload.itemId!);
        this.cartRepo.deleteCartItemOptionByCartItemId(evt.payload.itemId!);
    }

    subscribe() {
        console.log('--- MAIL CONSUMER ĐANG KHỞI ĐỘNG ---');

        // Lắng nghe sự kiện thêm mới cart item
        RabbitMQClient.getInstance().subscribe(EvtCartItemAdded, async (event) => {
            const data = JSON.parse(event);
            const evt = CartItemAddedEvent.from(data);
            this.CartItemCreated(evt);
        })

        // Lắng nghe sự kiện xóa cart item
        RabbitMQClient.getInstance().subscribe(EvtCartItemRemoved, async (event) => {
            const data = JSON.parse(event);
            const evt = CartItemRemovedEvent.from(data);
            this.CartItemDeleted(evt);
        })

        // Lắng nghe sự kiện cập nhật cart item
        RabbitMQClient.getInstance().subscribe(EvtCartItemUpdated, async (event) => {
            const data = JSON.parse(event);
            const evt = CartItemUpdatedEvent.from(data);
            this.CartItemUpdate(evt);
        })

        // Lắng nghe sự kiện thêm order item
        RabbitMQClient.getInstance().subscribe(EvtOrderItemAdded, async (event) => {
            const data = JSON.parse(event);
            const evt = OrderItemAddedEvent.from(data);
            this.OrderItemAdded(evt);
        })
    }
}
