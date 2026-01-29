import { Controller, Delete, HttpCode, HttpStatus, Inject, Patch, Post, UseGuards } from "@nestjs/common";
import { LOYALTY_SERVICE } from "../user.di-token";
import { type ILoyaltyService } from "../ports/loyalty.port";
import { getIPv4FromReq } from "src/share/utils";
import type { Request as ExpressRequest } from "express";
import { RemoteAuthGuard, Roles, RolesGuard } from "src/share/guard";
import { UserRole } from "src/share";
import { ApiCreatedResponse, ApiOperation } from "@nestjs/swagger";
import type { UserRankUpdateDTO, UserRankDTO, PointHistoryDTO, PointHistoryCondDTO, UserRankCondDTO } from "../dtos/loyalty.dto";
import { User } from "@prisma/client";

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
    async createUserRank(@Inject('Request') req: ExpressRequest, @Inject('Body') dto: UserRankDTO) {
        const ip = getIPv4FromReq(req);
        const userAgent = req.headers['user-agent'] || '';
        await this.loyaltyService.createUserRank(dto, ip, userAgent);
        return { message: 'User rank created successfully' };
    }

    // API lấy danh sách hạng thành viên
    @Post('user-ranks/list')
    @HttpCode(HttpStatus.OK)
    @UseGuards(RemoteAuthGuard)
    @ApiOperation({ summary: 'Lấy danh sách hạng thành viên' })
    @ApiCreatedResponse({ description: 'Trả về danh sách hạng thành viên' })
    async getUserRanks(@Inject('Request') req: ExpressRequest, @Inject('Body') dto: any) {
        const ip = getIPv4FromReq(req);
        const userAgent = req.headers['user-agent'] || '';
        const userRanks = await this.loyaltyService.getUserRanks(dto, ip, userAgent);
        return { data: userRanks };
    }

    // API cập nhật hạng thành viên
    @Patch('user-ranks/:id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Cập nhật hạng thành viên' })
    @ApiCreatedResponse({ description: 'Cập nhật hạng thành viên thành công' })
    async updateUserRank(@Inject('Request') req: ExpressRequest, @Inject('Body') dto: UserRankUpdateDTO, @Inject('Param') params: { id: string }) {
        const ip = getIPv4FromReq(req);
        const userAgent = req.headers['user-agent'] || '';
        await this.loyaltyService.updateUserRank(params.id, dto, ip, userAgent);
        return { message: 'User rank updated successfully' };
    }

    // API xóa hạng thành viên
    @Delete('user-ranks/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Xóa hạng thành viên' })
    @ApiCreatedResponse({ description: 'Xóa hạng thành viên thành công' })
    async deleteUserRank(@Inject('Request') req: ExpressRequest, @Inject('Param') params: { id: string }) {
        const ip = getIPv4FromReq(req);
        const userAgent = req.headers['user-agent'] || '';

        await this.loyaltyService.deleteUserRank(params.id, ip, userAgent);
        return { message: 'User rank deleted successfully' };
    }

    // API cộng/điểm thủ công
    @Post('point-histories')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.STAFF)
    @ApiOperation({ summary: 'Tạo lịch sử điểm thành viên' })
    @ApiCreatedResponse({ description: 'Tạo lịch sử điểm thành viên thành công' })
    async createPointHistory(@Inject('Request') req: ExpressRequest, @Inject('Body') dto: PointHistoryDTO) {
        const ip = getIPv4FromReq(req);
        const userAgent = req.headers['user-agent'] || '';

        await this.loyaltyService.createPointHistory(dto, ip, userAgent);
        return { message: 'Point history created successfully' };
    }

    // API lấy lịch sử điểm thành viên
    @Post('point-histories/list')
    @HttpCode(HttpStatus.OK)
    @UseGuards(RemoteAuthGuard)
    @ApiOperation({ summary: 'Lấy danh sách lịch sử điểm thành viên' })
    async getPointHistories(@Inject('Request') req: ExpressRequest, @Inject('Body') dto: PointHistoryCondDTO) {
        const ip = getIPv4FromReq(req);
        const userAgent = req.headers['user-agent'] || '';
        const pointHistories = await this.loyaltyService.getPointHistories(dto, ip, userAgent);
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
    @Post('user-ranks/list')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'RPC lấy danh sách hạng thành viên' })
    @ApiCreatedResponse({ description: 'Trả về danh sách hạng thành viên' })
    async getUserRanksRpc(req: ExpressRequest, dto: UserRankCondDTO) {
        const { ip, userAgent } = this.getRpcMetadata(req);
        return await this.loyaltyService.getUserRanks(dto, ip, userAgent);
    }

}