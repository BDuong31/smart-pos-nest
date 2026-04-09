import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Request,
  UseGuards,
  HttpStatus,
  HttpCode,
} from "@nestjs/common";
import { NotificationService } from "./notification.service";
import type {
  CreateNotificationDTO,
  UpdateNotificationDTO,
  NotificationCondDTO,
} from "./notification.dto";
import { getIPv4FromReq, paginatedResponse, PagingDTO,UserRole,type ReqWithRequester } from "src/share";
import type { Request as ExpressRequest } from "express";
import { RemoteAuthGuard, Roles, RolesGuard } from "src/share/guard";

@Controller("notifications")
export class NotificationHttpController {
  constructor(private readonly service: NotificationService) {}

  // ========================
  // ADMIN / STAFF
  // ========================

  @Post()
  @UseGuards(RemoteAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.KITCHEN)
  @HttpCode(HttpStatus.CREATED)
  async createNotification(@Body() dto: CreateNotificationDTO, @Request() req: ReqWithRequester, @Request() expressReq: ExpressRequest) {
    const requester = req.requester;
    const ip = getIPv4FromReq(expressReq);
    const userAgent = expressReq.headers["user-agent"] || "";

    const id = await this.service.createNotification(
      requester,
      dto,
      ip,
      userAgent
    );

    return {
      message: "Created",
      id,
    };
  }

  @Put(":id")
  async updateNotification(
    @Param("id") id: string,
    @Body() dto: UpdateNotificationDTO,
    @Request() req: ReqWithRequester,
    @Request() expressReq: ExpressRequest
  ) {
    const ip = getIPv4FromReq(expressReq);
    const userAgent = expressReq.headers["user-agent"] || "";

    await this.service.updateNotification(
      req.requester,
      id,
      dto,
      ip,
      userAgent
    );

    return { message: "Updated" };
  }

  @Delete(":id")
  async deleteNotification(@Param("id") id: string, @Request() req: ReqWithRequester, @Request() expressReq: ExpressRequest) {
    const ip = getIPv4FromReq(expressReq);
    const userAgent = expressReq.headers["user-agent"] || "";

    await this.service.deleteNotification(
      req.requester,
      id,
      ip,
      userAgent
    );

    return { message: "Deleted" };
  }

  // ========================
  // USER
  // ========================

  @Get()
  async listNotification(@Query() query: any) {
    const cond: NotificationCondDTO = {
      userId: query.userId,
      role: query.role,
      type: query.type,
      refType: query.refType,
      refId: query.refId,
    };

    const paging: PagingDTO = {
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 10,
    };

    const result = await this.service.listNotification(cond, paging);

    return paginatedResponse(result, paging);
  }

  @Get(":id")
  async getNotification(@Param("id") id: string) {
    return this.service.getNotification(id);
  }

  @Post(":id/read")
  async markAsRead(@Param("id") id: string, @Request() req: ReqWithRequester, @Request() expressReq: ExpressRequest) {
    const ip = getIPv4FromReq(expressReq);
    const userAgent = expressReq.headers["user-agent"] || "";

    await this.service.markAsRead(
      req.requester,
      id,
      ip,
      userAgent
    );

    return { message: "Marked as read" };
  }

  @Post("read-all")
  async markAllAsRead(@Request() req: ReqWithRequester, @Request() expressReq: ExpressRequest) {
    const requester = req.requester;
    const ip = getIPv4FromReq(expressReq);
    const userAgent = expressReq.headers["user-agent"] || "";
    await this.service.markAllAsRead(requester, requester.sub, ip, userAgent);

    return { message: "All marked as read" };
  }

  @Get("unread/count")
  async countUnread(@Request() req: ReqWithRequester) {
    const total = await this.service.countUnread(req.requester.sub);

    return { total };
  }

  // ========================
  // SETTING
  // ========================

  @Get("settings/me")
  async getMySetting(@Request() req: any) {
    return this.service.getNotificationSetting(req.user.userId);
  }

  @Put("settings/me")
  async updateMySetting(@Body() dto: any, @Request() req: any) {
    await this.service.updateNotificationSetting(
      req.user,
      req.user.userId,
      dto,
      req.ip,
      req.headers["user-agent"]
    );

    return { message: "Updated setting" };
  }
}