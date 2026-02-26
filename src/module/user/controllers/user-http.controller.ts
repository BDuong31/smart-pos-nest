import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Patch, Post, Query, Request, UseGuards } from "@nestjs/common";
import type { Request as ExpressRequest } from "express";
import { USER_REPOSITORY, USER_SERVICE } from "../user.di-token";
import { type IUserRepository, type IUserService } from "../ports/user.port";
import type { UserCondDTO, UserUpdateDTO, UserUpdateProfileDTO } from "../dtos/user.dto";
import { ApiCreatedResponse, ApiOperation } from "@nestjs/swagger";
import { AppError, ErrTokenInvalid, getIPv4FromReq, type PagingDTO, type ReqWithRequester, UserRole } from "src/share";
import { RemoteAuthGuard, Roles, RolesGuard } from "src/share/guard";
import { ErrUserNotFound, User } from "../models/user.model";

// Lớp UserHttpController xử lý các yêu cầu HTTP liên quan đến người dùng
@Controller('v1/users')
export class UserHttpController {
  constructor(
    @Inject(USER_SERVICE) private readonly userService: IUserService,
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository
  ) {}

  // API lấy profile người dùng
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RemoteAuthGuard)
  @ApiOperation({ summary: 'Lấy thông tin hồ sơ người dùng' })
  @ApiCreatedResponse({ description: 'Trả về thông tin hồ sơ người dùng.' })
  async profile(@Request() req: ReqWithRequester, @Request() expressReq: ExpressRequest) {
    const ip = getIPv4FromReq(expressReq);
    const userAgent = expressReq.headers['user-agent'] || '';
    const data = await this.userService.profile(req.requester.sub, ip, userAgent);
    return { data };
  } 

  // API lấy danh sách người dùng với phân trang và lọc
  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(RemoteAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Lấy danh sách người dùng với phân trang và lọc' })
  @ApiCreatedResponse({ description: 'Trả về danh sách người dùng theo điều kiện với phân trang.' })
  async listUsers(@Request() req: ReqWithRequester, @Request() expressReq: ExpressRequest, @Query() cond: UserCondDTO, @Query() paging: PagingDTO) {
    const ip = getIPv4FromReq(expressReq);
    const userAgent = expressReq.headers['user-agent'] || '';
    const { data, total } = await this.userRepo.list(cond, paging);
    return { data, total };
  }

  // API lấy thông tin hồ sơ người dùng theo userId
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RemoteAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Lấy thông tin hồ sơ người dùng theo userId' })
  @ApiCreatedResponse({ description: 'Trả về thông tin hồ sơ người dùng theo userId.' })
  async getUserById(@Param('id') id: string, @Request() req: ExpressRequest) {
    const user = await this.userRepo.get(id);

    if (!user) {
      throw AppError.from(ErrUserNotFound, 404);
    }
    return { data: user };
  }

  // API lấy danh sách người dùng theo mảng userIds
  @Post('list-by-ids')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RemoteAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Lấy danh sách người dùng theo mảng userIds' })
  @ApiCreatedResponse({ description: 'Trả về danh sách người dùng theo mảng userIds.' })
  async listUsersByIds(@Body() body: { userIds: string[] }) {
    const users =  await this.userRepo.listByIds(body.userIds);
    return { data: users };
  }

  // API cập nhật thông tin cho người dùng
  @Patch('user/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RemoteAuthGuard)
  @ApiOperation({ summary: 'Cập nhật thông tin cho người dùng' })
  @ApiCreatedResponse({ description: 'Cập nhật thông tin người dùng thành công, trả về thông tin người dùng đã được cập nhật.' })
  async updateUser(@Request() req: ReqWithRequester, @Param('id') id: string, @Body() dto: UserUpdateDTO, @Request() expressReq: ExpressRequest) {
    const requester = req.requester;
    const ip = getIPv4FromReq(expressReq);
    const userAgent = expressReq.headers['user-agent'] || '';
    const { role, rankId, mongoUserId, currentPoints, status, salt, password, username, email, fcmToken, ...updatableFields } = dto; // Loại bỏ các trường không được phép cập nhật

    await this.userService.update(requester, id, updatableFields, ip, userAgent);
    return { data:  true };
  }

  // API cập nhật thông tin người dùng cho Admin và Staff
  @Patch('admin-update/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RemoteAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Cập nhật thông tin người dùng cho Admin và Staff' })
  @ApiCreatedResponse({ description: 'Cập nhật thông tin người dùng thành công, trả về thông tin người dùng đã được cập nhật.' })
  async adminUpdateUser(@Request() req: ReqWithRequester, @Param('id') id: string, @Body() dto: UserUpdateDTO, @Request() expressReq: ExpressRequest) {
    const requester = req.requester;
    const ip = getIPv4FromReq(expressReq);
    const userAgent = expressReq.headers['user-agent'] || '';
    await this.userService.update(requester, id, dto, ip, userAgent);
    return { data:  true };
  }

  // API xóa tài khoản người dùng
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RemoteAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiOperation({ summary: 'Xóa tài khoản người dùng' })
  @ApiCreatedResponse({ description: 'Xóa tài khoản người dùng thành công.' })
  async deleteUser(@Request() req: ReqWithRequester, @Param('id') id: string, @Request() expressReq: ExpressRequest) {
    const requester = req.requester;
    const ip = getIPv4FromReq(expressReq);
    const userAgent = expressReq.headers['user-agent'] || '';
    await this.userService.deleteAccount(requester, id, ip, userAgent);
    return { data: true };
  }

  // API thêm token FCM cho người dùng
  @Post('add-fcm-token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RemoteAuthGuard)
  @ApiOperation({ summary: 'Thêm token FCM cho người dùng' })
  @ApiCreatedResponse({ description: 'Thêm token FCM cho người dùng thành công.' })
  async addFcmToken(@Request() req: ReqWithRequester,  @Body() body: { fcmToken: string }, @Request() expressReq: ExpressRequest) {
    const requester = req.requester;
    const ip = getIPv4FromReq(expressReq);
    const userAgent = expressReq.headers['user-agent'] || '';
    await this.userService.addFcmToken(requester.sub, body.fcmToken, ip, userAgent);
    return { message: 'FCM token added successfully' };
  }

  // API xóa token FCM cho người dùng
  @Delete('remove-fcm-token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RemoteAuthGuard)
  @ApiOperation({ summary: 'Xóa token FCM cho người dùng' })
  @ApiCreatedResponse({ description: 'Xóa token FCM cho người dùng thành công.' })
  async removeFcmToken(@Request() req: ReqWithRequester,  @Body() body: { fcmToken: string }, @Request() expressReq: ExpressRequest) {
    const requester = req.requester;
    const ip = getIPv4FromReq(expressReq);
    const userAgent = expressReq.headers['user-agent'] || '';
    await this.userService.removeFcmToken(requester.sub, body.fcmToken, ip, userAgent);
    return { message: 'FCM token removed successfully' };
  }
}

@Controller('v1/rpc/users')
export class UserHttpRpcController{
  constructor(
    @Inject(USER_SERVICE) private readonly userService: IUserService,
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository
  ) {}

  // API RPC lấy thông tin hồ sơ người dùng theo userId
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy thông tin hồ sơ người dùng theo userId' })
  @ApiCreatedResponse({ description: 'Trả về thông tin hồ sơ người dùng theo userId.' })
  async rpcGetUserById(@Param('id') id: string) {
    const user = await this.userRepo.get(id);
    if (!user) {
      throw AppError.from(ErrUserNotFound, 404);
    }
    return { data: this._toResponseModel(user) };
  }

  // API RPC lấy danh sách người dùng theo mảng userIds
  @Post('list-by-ids')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy danh sách người dùng theo mảng userIds' })
  @ApiCreatedResponse({ description: 'Trả về danh sách người dùng theo mảng userIds.' })
  async rpcListUsersByIds(@Body() body: { userIds: string[] }) {
    const users =  await this.userRepo.listByIds(body.userIds);
    return { data: users.map(user => this._toResponseModel(user)) };
  }

  // Chuyển đổi dữ liệu từ User sang dạng trả về
  private _toResponseModel(data: User): Omit<User, 'password' | 'salt'> {
    const { password, salt, ...responseModel } = data;
    return responseModel;
  }
}