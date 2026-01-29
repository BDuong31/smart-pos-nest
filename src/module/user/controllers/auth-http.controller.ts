import { Body, Controller, HttpCode, HttpStatus, Inject, Patch, Post, Request, UseGuards } from "@nestjs/common";
import { AUTH_SERVICE } from "../user.di-token";
import { type IAuthService } from "../ports/auth.port";
import { ApiCreatedResponse, ApiOperation } from "@nestjs/swagger";
import type { UserLoginDTO, UserRegistrationDTO, UserResetPasswordDTO } from "../dtos/auth.dto";
import type { Request as ExpressRequest } from "express";
import { getIPv4FromReq } from "src/share";
import { RemoteAuthGuard } from "src/share/guard";

// Lớp AuthHttpController xử lý các yêu cầu HTTP liên quan đến người dùng
@Controller('v1/auth')
export class AuthHttpController {
    constructor(
        @Inject(AUTH_SERVICE) private readonly authService: IAuthService
    ) {}

    // API đăng ký người dùng mới
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Đăng ký người dùng mới' })
    @ApiCreatedResponse({ description: 'Người dùng được tạo thành công' })
    async registerUser(@Body() dto: UserRegistrationDTO, @Request() req: ExpressRequest) {
        const ip = getIPv4FromReq(req);
        const userAgent = req.headers['user-agent'] || '';
        const userId = await this.authService.register(dto, ip, userAgent);
        const token = await this.authService.genarateOTPAccount(userId, ip, userAgent);

        return { token }
    }

    // API gửi lại mã OTP xác minh tài khoản
    @Post('resend-verify-otp')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Gửi lại mã OTP xác minh tài khoản' })
    @ApiCreatedResponse({ description: 'Mã OTP xác minh tài khoản được gửi lại thành công' })
    async resendVerifyOTP(@Body() body: { token: string }, @Request() req: ExpressRequest) {
        const ip = getIPv4FromReq(req);
        const userAgent = req.headers['user-agent'] || '';
        await this.authService.resendVerifyAccount(body.token, ip, userAgent);
        return { message: 'OTP sent successfully' };
    }

    // API tạo phiên kích hoạt tài khoản
    @Post('activate-account')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Yêu cầu kích hoạt tài khoản' })
    @ApiCreatedResponse({ description: 'Yêu cầu kích hoạt tài khoản được gửi thành công.' })
    async activateAccount(@Body() body: { email: string }, @Request() req: ExpressRequest) {
        const ip = getIPv4FromReq(req);
        const userAgent = req.headers['user-agent'] || '';
        await this.authService.activateAccount(body.email, ip, userAgent);
        const token = await this.authService.genarateOTPAccount(body.email, ip, userAgent);
        return { token };
    }

    // API xác minh tài khoản người dùng bằng mã OTP
    @Post('verify-account')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Xác minh tài khoản người dùng bằng mã OTP' })
    @ApiCreatedResponse({ description: 'Tài khoản người dùng được xác minh thành công' })
    async verifyAccount(@Body() body: { token: string, otp: string }, @Request() req: ExpressRequest) {
        const ip = getIPv4FromReq(req);
        const userAgent = req.headers['user-agent'] || '';
        await this.authService.verifyAccount(body.token, body.otp, ip, userAgent);
        return { message: 'Account verified successfully' };
    }

    // API đăng nhập người dùng
    @Post('authenticate')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Đăng nhập người dùng' })
    @ApiCreatedResponse({ description: 'Người dùng đăng nhập thành công' })
    async login(@Body() body: UserLoginDTO, @Request() req: ExpressRequest) {
        const ip = getIPv4FromReq(req);
        const userAgent = req.headers['user-agent'] || '';
        const token = await this.authService.login(body, ip, userAgent);
        return { token };
    }

    // API đăng nhập người dùng bằng Google
    @Post('google-authenticate')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Đăng nhập người dùng bằng Google' })
    @ApiCreatedResponse({ description: 'Người dùng đăng nhập thành công bằng Google' })
    async googleLogin(@Body() body: { idToken: string }, @Request() req: ExpressRequest) {
        const ip = getIPv4FromReq(req);
        const userAgent = req.headers['user-agent'] || '';
        const token = await this.authService.googleLogin(body.idToken, ip, userAgent);
        return { token };
    }

    // API quên mật khẩu
    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Yêu cầu quên mật khẩu' })
    @ApiCreatedResponse({ description: 'Yêu cầu quên mật khẩu được gửi thành công' })
    async forgotPassword(@Body() body: { email: string }, @Request() req: ExpressRequest) {
        const ip = getIPv4FromReq(req);
        const userAgent = req.headers['user-agent'] || '';
        await this.authService.forgotPassword(body.email, ip, userAgent);

        const data = await this.authService.genarateOTPForgotPassword(body.email, ip, userAgent);

        return { data  };
    }

    // API gửi lại mã OTP đặt lại mật khẩu
    @Post('resend-forgot-password-otp')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Gửi lại mã OTP đặt lại mật khẩu' })
    @ApiCreatedResponse({ description: 'Mã OTP đặt lại mật khẩu được gửi lại thành công' })
    async resendForgotPasswordOTP(@Body() body: { token: string }, @Request() req: ExpressRequest) {
        const ip = getIPv4FromReq(req);
        const userAgent = req.headers['user-agent'] || '';
        await this.authService.resendForgotPasswordOTP(body.token, ip, userAgent);
        return { message: 'OTP sent successfully' };
    }

    // API xác minh mã OTP đặt lại mật khẩu
    @Post('verify-forgot-password-otp')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Xác minh mã OTP đặt lại mật khẩu' })
    async verifyForgotPasswordOTP(@Body() body: { token: string, otp: string }, @Request() req: ExpressRequest) {
        const ip = getIPv4FromReq(req);
        const userAgent = req.headers['user-agent'] || '';
        const resetToken = await this.authService.verifyPasswordToken(body.token, body.otp, ip, userAgent);
        return { resetToken };
    }

    // API đặt lại mật khẩu
    @Patch('reset-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Đặt lại mật khẩu' })
    async resetPassword(@Body() body: { resetToken: string, dto: UserResetPasswordDTO }, @Request() req: ExpressRequest) {
        const ip = getIPv4FromReq(req);
        const userAgent = req.headers['user-agent'] || '';
        await this.authService.resetPassword(body.resetToken, body.dto, ip, userAgent);
        return { message: 'Password reset successfully' };
    }

    // API làm mới token
    @Post('refresh-token')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Làm mới token' })
    @ApiCreatedResponse({ description: 'Token được làm mới thành công' })
    async refreshToken(@Body() body: { refreshToken: string }) {
        const token = await this.authService.refreshToken(body.refreshToken);
        return { token };
    }

    // API đăng xuất người dùng
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @UseGuards(RemoteAuthGuard)
    @ApiOperation({ summary: 'Đăng xuất người dùng' })
    @ApiCreatedResponse({ description: 'Người dùng đăng xuất thành công' })
    async logout(@Body() body: { accessToken: string, refreshToken: string }, @Request() req: ExpressRequest) {
        const ip = getIPv4FromReq(req);
        const userAgent = req.headers['user-agent'] || '';
        await this.authService.logout(body.accessToken, body.refreshToken, ip, userAgent);
        return { message: 'Logged out successfully' };
    }
}

@Controller('v1/rpc/auth')
export class AuthRpcHttpController {
    constructor(
        @Inject(AUTH_SERVICE) private readonly authService: IAuthService
    ) {}

    // API introspect access token
    @Post('introspect')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Introspect access token' })
    async introspectAccessToken(@Body() body: { token: string }) {
        const payload =  await this.authService.introspectAccessToken(body.token);
        return { data: payload };
    }
}