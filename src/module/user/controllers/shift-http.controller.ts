import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Post, Query, Request, UseGuards } from "@nestjs/common";
import type { Request as ExpressRequest } from "express";
import { SHIFT_SERVICE } from "../user.di-token";
import type { IShiftService } from "../ports/shift.port";
import { RemoteAuthGuard, Roles, RolesGuard } from "src/share/guard";
import { getIPv4FromReq,type PagingDTO,type ReqWithRequester, UserRole } from "src/share";
import { ApiCreatedResponse, ApiOperation } from "@nestjs/swagger";
import type{ ShiftCondDTO, ShiftCreateDTO, ShiftUpdateDTO } from "../dtos/shift.dto";

@Controller('v1/shifts')
export class ShiftHttpController {
    constructor(
        @Inject(SHIFT_SERVICE) private readonly shiftService: IShiftService
    ){ }

    // API checkin
    @Post('checkin')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.STAFF, UserRole.ADMIN, UserRole.KITCHEN)
    @ApiOperation({ summary: 'Checkin ca làm việc' })
    @ApiCreatedResponse({ description: 'Checkin ca làm việc thành công' })
    async checkinShift(@Request() req: ReqWithRequester,@Body() dto: ShiftCreateDTO, @Request() reqExpress: ExpressRequest) {
        const userId = req.requester.sub;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        await this.shiftService.checkIn(userId, dto, ip, userAgent);
        return { message: 'Checkin successful' };
    }

    // API checkout
    @Post('checkout/:shiftId')
    @HttpCode(HttpStatus.OK)
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.STAFF, UserRole.ADMIN, UserRole.KITCHEN)
    @ApiOperation({ summary: 'Checkout ca làm việc' })
    @ApiCreatedResponse({ description: 'Checkout ca làm việc thành công' })
    async checkoutShift(@Request() req: ReqWithRequester, @Param('shiftId') shiftId: string, @Body() dto: ShiftUpdateDTO, @Request() reqExpress: ExpressRequest) {
        const userId = req.requester.sub;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        await this.shiftService.checkOut(userId, shiftId, dto, ip, userAgent);
        return { message: 'Checkout successful' };
    }

    // API lấy ca làm việc hiện tại
    @Get('current')
    @HttpCode(HttpStatus.OK)
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.STAFF, UserRole.ADMIN, UserRole.KITCHEN)
    @ApiOperation({ summary: 'Lấy ca làm việc hiện tại' })
    @ApiCreatedResponse({ description: 'Trả về ca làm việc hiện tại.' })
    async getCurrentShift(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest) {
        const userId = req.requester.sub;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const shift = await this.shiftService.getCurrentShift(userId, ip, userAgent);
        return { data: shift };
    }

    // API lấy lịch sử ca làm việc
    @Get('history')
    @HttpCode(HttpStatus.OK)
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.STAFF, UserRole.ADMIN, UserRole.KITCHEN)
    @ApiOperation({ summary: 'Lấy lịch sử ca làm việc' })
    @ApiCreatedResponse({ description: 'Trả về lịch sử ca làm việc.' })
    async getShiftHistory(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Query() paging: PagingDTO) {
        const userId = req.requester.sub;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const shifts = await this.shiftService.getShiftHistory(userId, ip, userAgent, paging);
        return { data: shifts };
    }

    // API tìm kiếm ca làm việc
    @Get('search')
    @HttpCode(HttpStatus.OK)
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.STAFF, UserRole.ADMIN, UserRole.KITCHEN)
    @ApiOperation({ summary: 'Tìm kiếm ca làm việc' })
    @ApiCreatedResponse({ description: 'Trả về danh sách ca làm việc theo điều kiện tìm kiếm.' })
    async findShifts(@Query() cond: ShiftCondDTO, @Request() reqExpress: ExpressRequest, @Query() paging: PagingDTO) {
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const shifts = await this.shiftService.findShifts(cond, ip, userAgent, paging);
        return { data: shifts };
    }

    // API lấy ca làm việc theo ID
    @Get(':shiftId')
    @HttpCode(HttpStatus.OK)
    @UseGuards(RemoteAuthGuard, RolesGuard)
    @Roles(UserRole.STAFF, UserRole.ADMIN, UserRole.KITCHEN)
    @ApiOperation({ summary: 'Lấy ca làm việc theo ID' })
    @ApiCreatedResponse({ description: 'Trả về ca làm việc theo ID.' })
    async getShiftById(@Param('shiftId') shiftId: string, @Request() reqExpress: ExpressRequest) {
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || '';
        const shift = await this.shiftService.getShiftById(shiftId, ip, userAgent);
        return { data: shift };
    }

}

@Controller('v1/rpc/shifts')
export class ShiftRpcController {
    constructor(
        @Inject(SHIFT_SERVICE) private readonly shiftService: IShiftService
    ) { }

    // Helper: Tạo metadata giả lập RPC
    private getRpcMetadata(req: ExpressRequest){
        return {
            ip: getIPv4FromReq(req) || '127.0.0.1',
            userAgent: 'INTERNAL_RPC_CALL'
        }
    };

    // RPC lấy ca hiện tại của user
    @Get('current')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'RPC lấy ca hiện tại của user' })
    @ApiCreatedResponse({ description: 'Trả về ca hiện tại của user.' })
    async getCurrentShift(@Query() body: { userId: string }, @Request() req: ExpressRequest) {
        const { ip, userAgent } = this.getRpcMetadata(req);

        const shift = await this.shiftService.getCurrentShift(body.userId, ip, userAgent);
        return { data: shift };
    }

    // RPC lấy chi tiết ca
    @Get('detail')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'RPC lấy chi tiết ca' })
    @ApiCreatedResponse({ description: 'Trả về chi tiết ca.' })
    async getShiftById(@Query() body: { shiftId: string }, @Request() req: ExpressRequest) {
        const { ip, userAgent } = this.getRpcMetadata(req);
        const shift = await this.shiftService.getShiftById(body.shiftId, ip, userAgent);
        return { data: shift };
    }

    // // RPC: Kiểm tra nhanh User có đang làm việc không (Trả về Boolean)
    @Get('is-working/:userId')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'RPC kiểm tra nhanh User có đang làm việc không' })
    @ApiCreatedResponse({ description: 'Trả về trạng thái làm việc của User.' })
    async isUserWorking(@Param('userId') userId: string, @Request() req: ExpressRequest) {
        const { ip, userAgent } = this.getRpcMetadata(req);
        try {
            await this.shiftService.getCurrentShift(userId, ip, userAgent);
            return { data: true };
        } catch (error) {
            return { data: false };
        }
    }
}
