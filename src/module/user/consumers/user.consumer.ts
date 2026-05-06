import { EvtPointsReset, EvtRankUpdated, EvtUserRankChanged, PointsDecreasedEvent, PointsResetEvent, UserRankChangedEvent } from './../../../share/event/loyalty.evt';
import { EvtOrderUpdated, OrderUpdatedEvent } from 'src/share/event/oder.evt';
import { Controller, Inject } from "@nestjs/common";
import { OnModuleInit } from "@nestjs/common";
import { USER_REPOSITORY, USER_SERVICE } from "../user.di-token";
import type { IUserRepository, IUserService } from "../ports/user.port";
import { RabbitMQClient } from "src/share/components";
import { EvtPointsDecreased, EvtPointsIncreased, PointsIncreasedEvent } from 'src/share/event/loyalty.evt';

@Controller()
export class UserComsumer implements OnModuleInit {
    constructor(
        @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,    ) { }
    onModuleInit() {
        this.subscribe();
    }

    subscribe() {
        console.log("--- USER CONSUMER ĐANG KHỞI ĐỘNG ---");
        
        // Nhận sự kiện trừ điểm thành viên
        RabbitMQClient.getInstance().subscribe(
            EvtPointsIncreased,

            async (event: any) => {
                const evt = PointsIncreasedEvent.from(event)
                console.log('--- USER COMSUMER NHẬN SỰ KIỆN TĂNG ĐIỂM THÀNH VIÊN ---', evt)

                await this.userRepo.increaseCount(evt.payload.userId!, "currentPoints", evt.payload.points!)
            }
        )
        
        RabbitMQClient.getInstance().subscribe(
            EvtPointsDecreased,

            async (event: any) => {
                const evt = PointsDecreasedEvent.from(event)
                console.log('--- USER COMSUMER NHẬN SỰ KIỆN TRỪ ĐIỂM THÀNH VIÊN ---', evt)

                await this.userRepo.decreaseCount(evt.payload.userId!, "currentPoints", evt.payload.points!)
            }
        )

        RabbitMQClient.getInstance().subscribe(
            EvtPointsReset,

            async (event: any) => {
                const evt = PointsResetEvent.from(event)
                console.log('--- USER COMSUMER NHẬN SỰ KIỆN RESET ĐIỂM THÀNH VIÊN ---', evt)

                await this.userRepo.update(evt.payload.userId!, { currentPoints: 0 })
            }
        )

        RabbitMQClient.getInstance().subscribe(
            EvtUserRankChanged,

            async (event: any) => {
                const evt = UserRankChangedEvent.from(event)
                console.log('--- USER COMSUMER NHẬN SỰ KIỆN THAY ĐỔI HẠNG NGƯỜI DÙNG ---', evt)

                await this.userRepo.update(evt.payload.userId!, { rankId: evt.payload.newRankId!})
            }
        )
    }
}