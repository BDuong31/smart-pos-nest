import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Request, UseGuards } from "@nestjs/common";
import { SYSTEM_SERVICE } from "./system.di-token";
import { SystemService } from "./system.service";
import { RemoteAuthGuard, Roles, RolesGuard } from "src/share/guard";
import { ReqWithRequester, ReqWithRequesterOpt, UserRole } from "src/share";
import { Public } from "src/share/guard/public.decorator";

@Controller('v1/system')
export class SystemController {
    constructor(
        @Inject(SYSTEM_SERVICE) private readonly systemService: SystemService
    ) {}

    @Post('maintenance')
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.OK)
    async toggleMaintenance(@Body() body: { enabled: boolean}) {
        await this.systemService.setMaintenanceMode(body.enabled);
        return {
            message: body.enabled ? 'Đã bật chế độ bảo trì' : 'Đã tắt chế độ bảo trì',
            status: body.enabled
        };
    }

    @Public()
    @Get('maintenance-status')
    @HttpCode(HttpStatus.OK)
    async getStatus() {
        const isEnabled = await this.systemService.isMaintenanceMode();
        return { enabled: isEnabled }
    }
}