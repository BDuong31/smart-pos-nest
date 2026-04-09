import { Module, Provider } from "@nestjs/common";
import { SYSTEM_SERVICE } from "./system.di-token";
import { SystemService } from "./system.service";
import { ShareModule } from "src/share/module";
import { SystemController } from "./system-http.controller";

const dependencies: Provider[] = [
    { provide: SYSTEM_SERVICE, useClass: SystemService, }
]

@Module({
    imports: [ShareModule],
    controllers: [SystemController],
    providers: [...dependencies]
})

export class SystemModule {}