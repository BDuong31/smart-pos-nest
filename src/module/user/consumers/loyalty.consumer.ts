import { EvtOrderUpdated, OrderUpdatedEvent } from 'src/share/event/oder.evt';
import { Controller, Inject, OnModuleInit } from "@nestjs/common";
import { LOYALTY_REPOSITORY, LOYALTY_SERVICE } from "../user.di-token";
import { RabbitMQClient } from "src/share/components";
import type { ILoyaltyRepository, ILoyaltyService } from "../ports/loyalty.port";
import { OrderStatus } from 'src/share';
import { v7 } from 'uuid';
import { PointHistory } from '../models/point-history.model';

@Controller()
export class LoyaltyComsumer implements OnModuleInit {
    // Tỷ lệ cho F&B: 1.000 VNĐ = 1 điểm
    private readonly POINT_CONVERSION_RATE = 1000;

    constructor(
        @Inject(LOYALTY_REPOSITORY) private readonly loyaltyRepo: ILoyaltyRepository,
        @Inject(LOYALTY_SERVICE) private readonly loyaltyService: ILoyaltyService,
    ) { }

    onModuleInit() {
        this.subscribe();
    }

    subscribe() {
        console.log("--- LOYALTY CONSUMER ĐANG KHỞI ĐỘNG ---");
        
        RabbitMQClient.getInstance().subscribe(
            EvtOrderUpdated,
            async (event: any) => {
                try {
                    const evt = OrderUpdatedEvent.from(event);
                    const { status, totalAmount, userId} = evt.payload;

                    // 1. Bỏ qua nếu đơn hàng không gắn với khách hàng thành viên (khách vãng lai)
                    if (!userId) return;

                    // 2. Tính số điểm (làm tròn xuống)
                    const pointDelta = Math.floor(totalAmount! / this.POINT_CONVERSION_RATE);

                    // Nếu đơn hàng có giá trị quá nhỏ (ví dụ 500đ) -> không có điểm
                    if (pointDelta <= 0) return;

                    // 3. Xử lý theo trạng thái đơn hàng
                    if (status === OrderStatus.COMPLETED) {
                        console.log(`[LOYALTY] Cộng ${pointDelta} điểm cho User ${userId} (Đơn: ${totalAmount}đ)`);
                        await this.loyaltyService.createPointHistory({
                            userId: userId,
                            amount: pointDelta,
                            reason: 'Hoàn thành đơn hàng',
                        }, 'system', 'system')
                    } else if (
                        status === OrderStatus.CANCELLED
                    ) {
                        console.log(`[LOYALTY] Trừ ${pointDelta} điểm của User ${userId} (Huỷ đơn: ${totalAmount}đ)`);
                        await this.loyaltyService.createPointHistory({
                            userId: userId,
                            amount: -pointDelta,
                            reason: 'Hủy đơn hàng',
                        }, 'system', 'system')
                    }
                } catch (error) {
                    console.error('--- LỖI XỬ LÝ SỰ KIỆN LOYALTY ---', error);
                }
            }
        );
    }
}