import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { LOYALTY_SERVICE } from "../user.di-token";
import { type ILoyaltyService } from "../ports/loyalty.port";
import { getIPv4FromReq } from "src/share/utils";
import type { Request as ExpressRequest } from "express";
import { RemoteAuthGuard, Roles, RolesGuard } from "src/share/guard";
import { type PagingDTO, UserRole } from "src/share";
import { ApiCreatedResponse, ApiOperation } from "@nestjs/swagger";
import type { UserRankUpdateDTO, UserRankDTO, PointHistoryDTO, PointHistoryCondDTO, UserRankCondDTO } from "../dtos/loyalty.dto";

@Controller('v1/loyalty')
export class LoyaltyHttpController {
    constructor(
        @Inject(LOYALTY_SERVICE) private readonly loyaltyService: ILoyaltyService
    ){}

    // API tạo hạng thành viên mới
    @Post('user-ranks')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Tạo hạng thành viên mới' })
    @ApiCreatedResponse({ description: 'Tạo hạng thành viên thành công' })
    async createUserRank(@Request() req: ExpressRequest, @Body() dto: UserRankDTO) {
        const ip = getIPv4FromReq(req);
        const userAgent = req.headers['user-agent'] || '';
        await this.loyaltyService.createUserRank(dto, ip, userAgent);
        return { message: 'User rank created successfully' };
    }

    // API lấy danh sách hạng thành viên
    @Get('user-ranks/list')
    @HttpCode(HttpStatus.OK)
    @UseGuards(RemoteAuthGuard)
    @ApiOperation({ summary: 'Lấy danh sách hạng thành viên' })
    @ApiCreatedResponse({ description: 'Trả về danh sách hạng thành viên' })
    async getUserRanks(@Request() req: ExpressRequest, @Query() dto: UserRankCondDTO, @Query() paging: PagingDTO) {
        const ip = getIPv4FromReq(req);
        const userAgent = req.headers['user-agent'] || '';
        const userRanks = await this.loyaltyService.getUserRanks(dto, ip, userAgent, paging);
        return { data: userRanks };
    }

    // API cập nhật hạng thành viên
    @Patch('user-ranks/:id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Cập nhật hạng thành viên' })
    @ApiCreatedResponse({ description: 'Cập nhật hạng thành viên thành công' })
    async updateUserRank(@Request() req: ExpressRequest, @Body() dto: UserRankUpdateDTO, @Param('id') id: string) {
        const ip = getIPv4FromReq(req);
        const userAgent = req.headers['user-agent'] || '';
        await this.loyaltyService.updateUserRank(id, dto, ip, userAgent);
        return { message: 'User rank updated successfully' };
    }

    // API xóa hạng thành viên
    @Delete('user-ranks/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Xóa hạng thành viên' })
    @ApiCreatedResponse({ description: 'Xóa hạng thành viên thành công' })
    async deleteUserRank(@Request() req: ExpressRequest, @Param('id') id: string) {
        const ip = getIPv4FromReq(req);
        const userAgent = req.headers['user-agent'] || '';

        await this.loyaltyService.deleteUserRank(id, ip, userAgent);
        return { message: 'User rank deleted successfully' };
    }

    // API cộng/điểm thủ công
    @Post('point-histories')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.STAFF)
    @ApiOperation({ summary: 'Tạo lịch sử điểm thành viên' })
    @ApiCreatedResponse({ description: 'Tạo lịch sử điểm thành viên thành công' })
    async createPointHistory(@Request() req: ExpressRequest, @Body() dto: PointHistoryDTO) {
        const ip = getIPv4FromReq(req);
        const userAgent = req.headers['user-agent'] || '';

        await this.loyaltyService.createPointHistory(dto, ip, userAgent);
        return { message: 'Point history created successfully' };
    }

    // API lấy lịch sử điểm thành viên
    @Get('point-histories/list')
    @HttpCode(HttpStatus.OK)
    @UseGuards(RemoteAuthGuard)
    @ApiOperation({ summary: 'Lấy danh sách lịch sử điểm thành viên' })
    async getPointHistories(@Request() req: ExpressRequest, @Query() dto: PointHistoryCondDTO, @Query() paging: PagingDTO) {
        const ip = getIPv4FromReq(req);
        const userAgent = req.headers['user-agent'] || '';
        const pointHistories = await this.loyaltyService.getPointHistories(dto, ip, userAgent, paging);
        return { data: pointHistories };
    }
}

@Controller('v1/rpc/loyalty')
export class LoyaltyRpcController {
    constructor(
        @Inject(LOYALTY_SERVICE) private readonly loyaltyService: ILoyaltyService
    ){}

    // Helper: Giả lập thông tin request nội bộ
    private getRpcMetadata(req: ExpressRequest) {
        return {
            ip: getIPv4FromReq(req) || '127.0.0.1', 
            userAgent: 'INTERNAL_RPC_SERVICE' 
        };
    }

    // RPC lấy danh sách hạng thành viên
    @Get('user-ranks/list')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'RPC lấy danh sách hạng thành viên' })
    @ApiCreatedResponse({ description: 'Trả về danh sách hạng thành viên' })
    async getUserRanksRpc(@Request() req: ExpressRequest, @Query() dto: UserRankCondDTO, @Query() paging: PagingDTO) {
        const { ip, userAgent } = this.getRpcMetadata(req);
        return await this.loyaltyService.getUserRanks(dto, ip, userAgent, paging);
    }

}
