import { Module, Provider } from "@nestjs/common";
import { RESERVATION_REPOSITORY, RESERVATION_SERVICE, TABLE_REPOSITORY, TABLE_SERVICE, ZONE_REPOSITORY, ZONE_SERVICE } from "./operations.di-token";
import { ZonePrismaRepo } from "./repos/zone-prisma.repo";
import { ZoneService } from "./services/zone.service";
import { TablePrismaRepo } from "./repos/table-prisma.repo";
import { TableService } from "./services/table.service";
import { ReservationPrismaRepo } from "./repos/reservation-prisma.repo";
import { ReservationService } from "./services/reservation.service";
import { ShareModule } from "src/share/module";
import { ZoneHttpController, ZoneRpcController } from "./controller/zone-http.controller";
import { TableHttpController, TableRpcController } from "./controller/table-http.controller";
import { ReservationHttpController, ReservationRpcController } from "./controller/reservation-http.controller";

const dependencies: Provider[] = [
    { provide: ZONE_REPOSITORY,  useClass: ZonePrismaRepo },
    { provide: ZONE_SERVICE, useClass: ZoneService },
    { provide: TABLE_REPOSITORY, useClass: TablePrismaRepo },
    { provide: TABLE_SERVICE, useClass: TableService },
    { provide: RESERVATION_REPOSITORY, useClass: ReservationPrismaRepo },
    { provide: RESERVATION_SERVICE, useClass: ReservationService },
]

@Module({
    imports: [ShareModule],
    controllers: [ZoneHttpController, ZoneRpcController, TableHttpController, TableRpcController, ReservationHttpController, ReservationRpcController],
    providers: [...dependencies],
})

export class OperationsModule {}