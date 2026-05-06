import { Controller, Inject, OnModuleInit } from "@nestjs/common";
import { TABLE_REPOSITORY, TABLE_SERVICE } from "../operations.di-token";
import { RabbitMQClient } from "src/share/components";
import { EvtOrderTableAssigned, OrderTableAssignedEvent } from "src/share/event/oder.evt";
import type { ITableRepository } from "../ports/table.port";
import { TableStatus } from "src/share";

@Controller()
export class TableConsumer implements OnModuleInit {
    constructor(
        @Inject(TABLE_REPOSITORY) private readonly tableRepo:  ITableRepository,
    ) {}

    async onModuleInit() {
        this.subscribe();
    }

    subscribe() {
        console.log('--- TABLE CONSUMER ĐANG KHỞI ĐỘNG ---');

        RabbitMQClient.getInstance().subscribe(
            EvtOrderTableAssigned,
            async (event: any) => {
                const evt = OrderTableAssignedEvent.from(event);
                console.log('--- TABLE CONSUMER TỚI ORDER TABLE ASSIGNED ---', evt);
                
                await this.tableRepo.update(evt.payload.tableId, {status: 'occupied' as TableStatus});
            }
        )
    }
}