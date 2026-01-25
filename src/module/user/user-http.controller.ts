import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Post, Request, UseGuards } from "@nestjs/common";
import type { Request as ExpressRequest } from "express";
import { USER_REPOSITORY, USER_SERVICE } from "./user.di-token";
import { type IUserRepository, type IUserService } from "./user.port";
import type { UserLoginDTO, UserRegistrationDTO, UserResetPasswordDTO, UserUpdateDTO, UserUpdateProfileDTO } from "./user.dto";
import { ApiCreatedResponse, ApiOperation } from "@nestjs/swagger";
import { AppError, ErrTokenInvalid, getIPv4FromReq, type ReqWithRequester, UserRole } from "src/share";
import { RemoteAuthGuard, Roles, RolesGuard } from "src/share/guard";
import { ErrUserNotFound, User } from "./user.model";

// Lớp UserHttpController xử lý các yêu cầu HTTP liên quan đến người dùng
@Controller('v1')
export class UserHttpController {
  constructor(
    @Inject(USER_SERVICE) private readonly userService: IUserService,
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository
  ) {}

  // API đăng ký tài khoản người dùng mới
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Đăng ký tài khoản người dùng mới' })
  @ApiCreatedResponse({ description: 'Tài khoản người dùng được tạo thành công, trả về token OTP để xác minh tài khoản.' })
  async register(@Body() dto: UserRegistrationDTO, @Request() req: ExpressRequest) {
    const ip = getIPv4FromReq(req);
    const userAgent = req.headers['user-agent'] || '';
    const userId = await this.userService.register(dto, ip, userAgent);
    const token = await this.userService.genarateOTPAccount(userId, ip, userAgent);
    return { token };
  }

  // API gửi lại mã OTP xác minh tài khoản
  @Post('resend-verify-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gửi lại mã OTP xác minh tài khoản' })
  @ApiCreatedResponse({ description: 'Mã OTP xác minh tài khoản được gửi lại thành công.' })
  async resendOTP(@Body() body: { token: string }, @Request() req: ExpressRequest) {
    const ip = getIPv4FromReq(req);
    const userAgent = req.headers['user-agent'] || '';
    await this.userService.resendVerifyAccount(body.token, ip, userAgent);
    return { message: 'OTP resent successfully' };
  }

  // API yêu cầu kích hoạt tài khoản
  @Post('activate-account')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Yêu cầu kích hoạt tài khoản' })
  @ApiCreatedResponse({ description: 'Yêu cầu kích hoạt tài khoản được gửi thành công.' })
  async activateAccount(@Body() body: { email: string }, @Request() req: ExpressRequest) {
    const ip = getIPv4FromReq(req);
    const userAgent = req.headers['user-agent'] || '';
    await this.userService.activateAccount(body.email, ip, userAgent);
    const token = await this.userService.genarateOTPAccount(body.email, ip, userAgent);
    return { token };
  }

  // API xác minh tài khoản người dùng bằng mã OTP
  @Post('verify-account')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xác minh tài khoản người dùng bằng mã OTP' })
  @ApiCreatedResponse({ description: 'Tài khoản người dùng được xác minh thành công.' })
  async verifyAccount(@Body() body: { token: string, otp: string }, @Request() req: ExpressRequest) {
    const ip = getIPv4FromReq(req);
    const userAgent = req.headers['user-agent'] || '';
    await this.userService.verifyAccount(body.token, body.otp, ip, userAgent);
    return { message: 'Account verified successfully' };
  }

  // API đăng nhập người dùng
  @Post('authenticate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập người dùng' })
  @ApiCreatedResponse({ description: 'Người dùng đăng nhập thành công, trả về access token và refresh token.' })
  async login(@Body() body: UserLoginDTO, @Request() req: ExpressRequest) {
    const ip = getIPv4FromReq(req);
    const userAgent = req.headers['user-agent'] || '';
    const data = await this.userService.login(body, ip, userAgent);
    return data;
  }

  // API đăng nhập người dùng bằng Google
  @Post('google-authenticate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đăng nhập người dùng bằng Google' })
  @ApiCreatedResponse({ description: 'Người dùng đăng nhập thành công bằng Google, trả về access token và refresh token.' })
  async googleLogin(@Body() body: { idToken: string }, @Request() req: ExpressRequest) {
    const ip = getIPv4FromReq(req);
    const userAgent = req.headers['user-agent'] || '';
    const data = await this.userService.googleLogin(body.idToken, ip, userAgent);
    return data;
  }

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

  // API lấy thông tin hồ sơ người dùng theo userId
  @Get('user/:id')
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
  @Post('users/list-by-ids')
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
  @Post('user/:id/update')
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
  @Post('user/:id/admin-update')
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
  @Post('user/:id/delete')
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

  // API quên mật khẩu
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xử lý quên mật khẩu' })
  @ApiCreatedResponse({ description: 'Nếu email tồn tại, mã OTP đặt lại mật khẩu sẽ được gửi đến email.' })
  async forgotPassword(@Body() body: { email: string }, @Request() expressReq: ExpressRequest) {
    const ip = getIPv4FromReq(expressReq);
    const userAgent = expressReq.headers['user-agent'] || '';
    await this.userService.forgotPassword(body.email, ip, userAgent);

    await this.userService.genarateOTPForgotPassword(body.email, ip, userAgent);

    return { message: 'If the email exists, a password reset OTP has been sent.' };
  }

  // API gửi lại mã OTP đặt lại mật khẩu
  @Post('resend-forgot-password-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gửi lại mã OTP đặt lại mật khẩu' })
  @ApiCreatedResponse({ description: 'Mã OTP đặt lại mật khẩu được gửi lại thành công.' })
  async resendForgotPasswordOTP(@Body() body: { token: string }, @Request() expressReq: ExpressRequest) {
    const ip = getIPv4FromReq(expressReq);
    const userAgent = expressReq.headers['user-agent'] || '';
    await this.userService.resendForgotPasswordOTP(body.token, ip, userAgent);
    return { message: 'Forgot password OTP resent successfully' };
  }

  // API xác minh token đặt lại mật khẩu bằng mã OTP
  @Post('verify-reset-password-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xác minh token đặt lại mật khẩu bằng mã OTP' })
  @ApiCreatedResponse({ description: 'Token đặt lại mật khẩu được xác minh thành công.' })
  async verifyResetPasswordToken(@Body() body: { token: string, otp: string }, @Request() expressReq: ExpressRequest) {
    const ip = getIPv4FromReq(expressReq);
    const userAgent = expressReq.headers['user-agent'] || '';
    await this.userService.verifyResetPasswordToken(body.token, body.otp, ip, userAgent);
    return { message: 'Reset password token verified successfully' };
  }

  // API đặt lại mật khẩu bằng token
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Đặt lại mật khẩu bằng token' })
  @ApiCreatedResponse({ description: 'Mật khẩu được đặt lại thành công.' })
  async resetPassword(@Body() body: { token: string, dto: UserResetPasswordDTO }, @Request() expressReq: ExpressRequest) {
    const ip = getIPv4FromReq(expressReq);
    const userAgent = expressReq.headers['user-agent'] || '';
    await this.userService.resetPassword(body.token, body.dto, ip, userAgent);
    return { message: 'Password reset successfully' };
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
  @Post('remove-fcm-token')
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

  // API làm mới token
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Làm mới token' })
  @ApiCreatedResponse({ description: 'Trả về access token và refresh token mới.' })
  async refreshToken(@Body() body: { refreshToken: string }) {
    const data = await this.userService.refreshToken(body.refreshToken);
    return data;
  }

  // API đăng xuất người dùng
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RemoteAuthGuard)
  @ApiOperation({ summary: 'Đăng xuất người dùng' })
  @ApiCreatedResponse({ description: 'Người dùng đăng xuất thành công.' })
  async logout(@Request() req: ExpressRequest, @Body() body: { refreshToken: string }, @Request() expressReq: ExpressRequest) {
    const refreshToken = body.refreshToken;
    const [type, accessToken] = req.headers.authorization?.split(' ') ?? [];
    const ip = getIPv4FromReq(expressReq);
    const userAgent = expressReq.headers['user-agent'] || '';

    await this.userService.logout(accessToken, refreshToken, ip, userAgent);
    return { message: 'Logged out successfully' };
  }
}

@Controller('v1/rpc')
export class UserHttpRpcController{
  constructor(
    @Inject(USER_SERVICE) private readonly userService: IUserService,
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository
  ) {}

  // API kiểm tra token và trả về thông tin người dùng
  @Post('introspect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kiểm tra token và trả về thông tin người dùng' })
  @ApiCreatedResponse({ description: 'Trả về thông tin người dùng nếu token hợp lệ.' })
  async introspect(@Body() dto: { token: string }) {
    const data = await this.userService.introspectAccessToken(dto.token);
    return { data: data}
  }

  // API RPC lấy thông tin hồ sơ người dùng theo userId
  @Get('user/:id')
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
  @Post('users/list-by-ids')
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