import { Paginated } from 'src/share';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import type { Request as ExpressRequest } from 'express';
import {
  LOYALTY_REPOSITORY,
  USER_REPOSITORY,
  USER_SERVICE,
} from '../user.di-token';
import { type IUserRepository, type IUserService } from '../ports/user.port';
import {
  userCondDTOSchema,
  type CreateStaffDTO,
  type UserCondDTO,
  type UserUpdateDTO,
  type UserUpdateProfileDTO,
} from '../dtos/user.dto';
import { ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import {
  AppError,
  ErrTokenInvalid,
  getIPv4FromReq,
  IMAGE_RPC,
  ImageType,
  type IPublicImageRpc,
  type IPublicLoyaltyRpc,
  LOYALTY_RPC,
  paginatedResponse,
  type PagingDTO,
  pagingDTOSchema,
  PublicImage,
  PublicRank,
  type ReqWithRequester,
  UserRole,
} from 'src/share';
import { RemoteAuthGuard, Roles, RolesGuard } from 'src/share/guard';
import { ErrUserNotFound, User } from '../models/user.model';

// Lớp UserHttpController xử lý các yêu cầu HTTP liên quan đến người dùng
@Controller('v1/users')
export class UserHttpController {
  constructor(
    @Inject(USER_SERVICE) private readonly userService: IUserService,
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(IMAGE_RPC) private readonly imageRpc: IPublicImageRpc,
    @Inject(LOYALTY_RPC) private readonly loyaltyRpc: IPublicLoyaltyRpc,
  ) {}

  // API tạo tài khoản người dùng mới
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RemoteAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Tạo tài khoản người dùng mới' })
  @ApiCreatedResponse({ description: 'Tài khoản người dùng được tạo thành công, trả về thông tin người dùng đã được tạo.' })
  async createUser(@Request() req: ReqWithRequester, @Body() dto: CreateStaffDTO, @Request() expressReq: ExpressRequest) {
    const requester = req.requester;
    const ip = getIPv4FromReq(expressReq);
    const userAgent = expressReq.headers['user-agent'] || '';
    const data = await this.userService.createStart(requester, dto, ip, userAgent);
    return { data };
  }

  // API lấy profile người dùng
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RemoteAuthGuard)
  @ApiOperation({ summary: 'Lấy thông tin hồ sơ người dùng' })
  @ApiCreatedResponse({ description: 'Trả về thông tin hồ sơ người dùng.' })
  async profile(@Request() req: ReqWithRequester) {
    const result = await this.userService.profile(req.requester.sub);

    if (!result) {
      throw AppError.from(ErrUserNotFound, 404);
    }

    const avatars = await this.imageRpc.getImagesByRefId([result.id], ImageType.AVATAR);

    const avatar = avatars[0];

    const rank = await this.loyaltyRpc.getUserRank(result?.rankId || '');

    const data: Omit<User, 'password' | 'salt'> = { ...result, avatar, rank };
    return { data };
  } 

  // API lấy danh sách người dùng với phân trang và lọc
  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(RemoteAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.KITCHEN)
  @ApiOperation({ summary: 'Lấy danh sách người dùng với phân trang và lọc' })
  @ApiCreatedResponse({ description: 'Trả về danh sách người dùng theo điều kiện với phân trang.' })
  async listUsers(@Request() req: ReqWithRequester, @Query() cond: UserCondDTO, @Query() paging: PagingDTO) {
    paging = pagingDTOSchema.parse(paging);
    cond = userCondDTOSchema.parse(cond);

    const results = await this.userRepo.list(cond, paging);

    const userIds = results.data.map((user) => user.id);
    const rankIds = results.data
      .map((user) => user.rankId)
      .filter((rankId) => rankId !== undefined && rankId !== null);

    const ranks = await this.loyaltyRpc.getUserRanksByIds(rankIds);
    const avatars = await this.imageRpc.getImagesByRefId(userIds, 'avatar');

    const avatarMap: Record<string, PublicImage | null> = {};
    const rankMap: Record<string, PublicRank | null> = {};

    userIds.map((userId) => {
      const avatar = avatars.find((i) => i.refId === userId) || null;
      if (avatar) {
        avatarMap[userId] = avatar;
      } else {
        avatarMap[userId] = null;
      }
    });

    ranks.map((rank) => {
      rankMap[rank.id] = rank;
    });
    
    const mappedData = results.data.map((item) => {
      const userObj: any = { ...item };
      delete userObj.password;
      delete userObj.salt;
      userObj.avatar = avatarMap[item.id];
      userObj.rank = rankMap[item.rankId || ''];

      return userObj;
    });


    const data: Paginated<Omit<User, 'password' | 'salt'>> = {
      ...results,
      data: mappedData,
    };
    return paginatedResponse(data, paging);
  }

  @Get('staff')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RemoteAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.KITCHEN)
  @ApiOperation({ summary: 'Lấy danh sách nhân viên' })
  @ApiCreatedResponse({ description: 'Trả về danh sách nhân viên.' })
  async listStaff(@Request() req: ReqWithRequester, @Query() cond: UserCondDTO, @Query() paging: PagingDTO) {
    paging = pagingDTOSchema.parse(paging);
    cond = userCondDTOSchema.parse(cond);

    const result = await this.userRepo.listStaff(cond, paging);

    const userIds = result.data.map((user) => user.id);
    const rankIds = result.data
      .map((user) => user.rankId)
      .filter((rankId) => rankId !== undefined && rankId !== null);

    const ranks = await this.loyaltyRpc.getUserRanksByIds(rankIds);
    const avatars = await this.imageRpc.getImagesByRefId(userIds, 'avatar');

    const avatarMap: Record<string, PublicImage | null> = {};
    const rankMap: Record<string, PublicRank | null> = {};

    userIds.map((userId) => {
      const avatar = avatars.find((i) => i.refId === userId) || null;
      if (avatar) {
        avatarMap[userId] = avatar;
      } else {
        avatarMap[userId] = null;
      }
    });

    ranks.map((rank) => {
      rankMap[rank.id] = rank;
    });

    const mappedData = result.data.map((item) => {
      const userObj: any =  { ...item };
      delete userObj.password;
      delete userObj.salt;
      userObj.avatar = avatarMap[item.id];
      userObj.rank = rankMap[item.id];

      return userObj;
    });

    const data: Paginated<Omit<User, 'password' | 'salt'>> = {
      ...result,
      data: mappedData,
    };
    return paginatedResponse(data, paging);
  }

  // API lấy thông tin hồ sơ người dùng theo userId
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RemoteAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.KITCHEN)
  @ApiOperation({ summary: 'Lấy thông tin hồ sơ người dùng theo userId' })
  @ApiCreatedResponse({ description: 'Trả về thông tin hồ sơ người dùng theo userId.' })
  async getUserById(@Param('id') id: string, @Request() req: ExpressRequest) {
    const user = await this.userRepo.get(id);

    if (!user) {
      throw AppError.from(ErrUserNotFound, 404);
    }

    const avatars = await this.imageRpc.getImagesByRefId(
      [id],
      ImageType.AVATAR,
    );

    const avatar = avatars[0];

    const rank = await this.loyaltyRpc.getUserRank(user?.rankId || '');

    const data: any = { ...user };
    delete data.password;
    delete data.salt;
    data.avatar = avatar;
    data.rank = rank;
    return { data };
  }

  // API lấy danh sách người dùng theo mảng userIds
  @Post('list-by-ids')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RemoteAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.KITCHEN)
  @ApiOperation({ summary: 'Lấy danh sách người dùng theo mảng userIds' })
  @ApiCreatedResponse({ description: 'Trả về danh sách người dùng theo mảng userIds.' })
  async listUsersByIds(@Body() ids: string[]) {
    const data = await this.userRepo.listByIds(ids);
    return { data };
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
  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.KITCHEN)
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
  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.KITCHEN)
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
    const data = await this.userRepo.get(id);
    if (!data) {
      throw AppError.from(ErrUserNotFound, 404);
    }
    return { data };
  }

  // API RPC lấy danh sách người dùng theo mảng userIds
  @Post('list-by-ids')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy danh sách người dùng theo mảng userIds' })
  @ApiCreatedResponse({ description: 'Trả về danh sách người dùng theo mảng userIds.' })
  async rpcListUsersByIds(@Body('ids') ids: string[]) {
    const data = await this.userRepo.listByIds(ids);
    return { data };
  }
}
