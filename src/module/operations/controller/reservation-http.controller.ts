import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import { RESERVATION_SERVICE } from "../operations.di-token";
import {type IReservationService } from "../ports/reservation.port";
import { RolesGuard } from "src/share/guard/roles";
import { RemoteAuthGuard, Roles } from "src/share/guard";
import { AppError, getIPv4FromReq,type IPublicTableRpc,type IPublicUserRpc,type PagingDTO, type ReqWithRequester, TABLE_RPC, USER_RPC, UserRole } from "src/share";
import {type Request as ExpressRequest } from "express";
import type { ReservationUpdateDTO, ReservationCreatedDTO, ReservationCondDTO } from "../dtos/reservation.dto";
import { ErrReservationNotFound, Reservation } from "../models/reservation.model";

@Controller('v1/reservations')
export class ReservationHttpController {
    constructor(
        @Inject(RESERVATION_SERVICE) private readonly reservationService: IReservationService,
        @Inject(USER_RPC) private readonly userRpc: IPublicUserRpc,
        @Inject(TABLE_RPC) private readonly tableRpc: IPublicTableRpc,
    ){}
    
    // API để tạo mới đặt bàn
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Body() dto: ReservationCreatedDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        const data = await this.reservationService.create(requester, dto, ip, userAgent);
        return { data }; 
    }

    // API để cập nhật thông tin đặt bàn
    @Patch(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async update(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') id: string,  @Body() dto: ReservationUpdateDTO) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        await this.reservationService.update(requester, id, dto, ip, userAgent);
    }

    // API để xóa đặt bàn theo ID
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Request() req: ReqWithRequester, @Request() reqExpress: ExpressRequest, @Param('id') id: string) {
        const requester = req.requester;
        const ip = getIPv4FromReq(reqExpress);
        const userAgent = reqExpress.headers['user-agent'] || 'unknown';
        await this.reservationService.delete(requester, id, ip, userAgent);
    }
    
    // API để lấy thông tin đặt bàn theo ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async get(@Param('id') id: string) {
        const result = await this.reservationService.get(id);

        if (!result) {
            throw AppError.from(ErrReservationNotFound, 404);
        }
        let user;
        if (result.userId) {
            user = await this.userRpc.getUserById(result.userId);
        }
        const table = await this.tableRpc.findById(result.tableId);

        const data = { ...result, user, table } as Reservation;

        return { data };
    }

    // API để lấy danh sách đặt bàn theo điều kiện với phân trang
    @Get()
    @HttpCode(HttpStatus.OK)
    async list(@Request() req: ReqWithRequester, @Query() cond: ReservationCondDTO, @Query() paging: PagingDTO) {
        const data = await this.reservationService.list(cond, paging);
        return { data };
    }   

    // API để lấy danh sách đặt bàn theo nhiều ID với phân trang
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listByIds(@Request() req: ReqWithRequester, @Body('ids') ids: string[]) {
        const data = await this.reservationService.listByIds(ids);
        return { data };
    }
}

@Controller('v1/rpc/reservations')
export class ReservationRpcController {
    constructor(
        @Inject(RESERVATION_SERVICE) private readonly reservationService: IReservationService
    ){}

    // RPC để lấy thông tin đặt bàn theo ID
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async get(@Param('id') id: string) {
        const data = await this.reservationService.get(id);
        return { data };
    }

    // RPC để lấy danh sách đặt bàn theo nhiều ID với phân trang
    @Post('list-by-ids')
    @HttpCode(HttpStatus.OK)
    async listByIds(@Request() req: ReqWithRequester, @Body() ids: string[]) {
        const data = await this.reservationService.listByIds(ids);
        return { data };
    }
}