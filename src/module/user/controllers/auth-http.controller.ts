import { Body, Controller, HttpCode, HttpStatus, Inject, Patch, Post, Request, UseGuards } from "@nestjs/common";
import { AUTH_SERVICE } from "../user.di-token";
import { type IAuthService } from "../ports/auth.port";
import { ApiBadRequestResponse, ApiBody, ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiInternalServerErrorResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTooManyRequestsResponse, ApiUnauthorizedResponse } from "@nestjs/swagger";
import type { UserLoginDTO, UserRegistrationDTO, UserResetPasswordDTO } from "../dtos/auth.dto";
import type { Request as ExpressRequest } from "express";
import { getIPv4FromReq, type ReqWithRequester } from "src/share";
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
    @ApiOperation({ summary: 'Đăng ký người dùng mới', description: 'API này cho phép người dùng đăng ký tài khoản mới bằng cách cung cấp thông tin cần thiết như tên người dùng, email, mật khẩu, v.v.' })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['username', 'fullName', 'birthday', 'email', 'password'],
            properties: {
                username: {
                    type: 'string',
                    example: 'john_doe'
                },
                fullName: {
                    type: 'string',
                    example: 'John Doe'
                },
                birthday: {
                    type: 'string',
                    format: 'date',
                    example: '1990-01-01'
                },
                email: {
                    type: 'string',
                    format: 'email',
                    example: 'john.doe@example.com'
                },
                password: {
                    type: 'string',
                    format: 'password',
                    example: 'P@ssw0rd!'
                }
            }
        }
    })
    @ApiCreatedResponse({ description: 'Người dùng được tạo thành công', 
        schema: {
            type: 'object',
            properties: {
                token: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
                }
            }
        }
    })
    @ApiBadRequestResponse({ description: 'Yêu cầu không hợp lệ, có thể do thiếu thông tin hoặc thông tin không đúng định dạng' })
    @ApiConflictResponse({ description: 'Xung đột dữ liệu, có thể do email hoặc tên người dùng đã tồn tại' })
    @ApiTooManyRequestsResponse({ description: 'Quá nhiều yêu cầu đăng ký, vui lòng thử lại sau' })
    @ApiInternalServerErrorResponse({ description: 'Lỗi máy chủ, có thể do sự cố với cơ sở dữ liệu hoặc lỗi không mong muốn khác' })
    async registerUser(@Body() dto: UserRegistrationDTO, @Request() req: ExpressRequest) {
        const ip = getIPv4FromReq(req);
        const userAgent = req.headers['user-agent'] || '';
        const userId = await this.authService.register(dto, ip, userAgent);
        const token = await this.authService.genarateOTPAccount(userId, ip, userAgent);

        return { token }
    }

    // API gửi lại mã OTP xác minh tài khoản
    @Post('resend-verify-otp')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Gửi lại mã OTP xác minh tài khoản', description: 'API này cho phép người dùng gửi lại mã OTP để xác minh tài khoản của họ nếu họ chưa nhận được mã OTP ban đầu hoặc mã OTP đã hết hạn.' })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['token'],
            properties: {
                token: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
                }
            }
        }
    })
    @ApiNoContentResponse({ description: 'Mã OTP xác minh tài khoản được gửi lại thành công' })
    @ApiBadRequestResponse({ description: 'Yêu cầu không hợp lệ, có thể do thiếu token hoặc token không đúng định dạng' })
    @ApiNotFoundResponse({ description: 'Không tìm thấy tài khoản liên quan đến token' })
    @ApiTooManyRequestsResponse({ description: 'Quá nhiều yêu cầu gửi lại mã OTP, vui lòng thử lại sau' })
    @ApiInternalServerErrorResponse({ description: 'Lỗi máy chủ, có thể do sự cố với cơ sở dữ liệu hoặc lỗi không mong muốn khác' })
    async resendVerifyOTP(@Body() body: { token: string }, @Request() req: ExpressRequest) {
        const ip = getIPv4FromReq(req);
        const userAgent = req.headers['user-agent'] || '';
        await this.authService.resendVerifyAccount(body.token, ip, userAgent);
        return { message: 'OTP sent successfully' };
    }

    // API tạo phiên kích hoạt tài khoản
    @Post('activate-account')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Yêu cầu kích hoạt tài khoản', description: 'API này cho phép người dùng yêu cầu kích hoạt tài khoản của họ bằng cách gửi email đã đăng ký. Hệ thống sẽ gửi một mã OTP đến email đó để xác minh và kích hoạt tài khoản.' })
    @ApiOkResponse({ description: 'Yêu cầu kích hoạt tài khoản được gửi thành công.',
        schema: {
            type: 'object',
            properties: {
                token: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
                }
            }
        }
    })
    @ApiBadRequestResponse({ description: 'Yêu cầu không hợp lệ, có thể do thiếu thông tin hoặc thông tin không đúng định dạng' })
    @ApiNotFoundResponse({ description: 'Không tìm thấy tài khoản liên quan đến email' })
    @ApiTooManyRequestsResponse({ description: 'Quá nhiều yêu cầu kích hoạt tài khoản, vui lòng thử lại sau' })
    @ApiInternalServerErrorResponse({ description: 'Lỗi máy chủ, có thể do sự cố với cơ sở dữ liệu hoặc lỗi không mong muốn khác' })
    async activateAccount(@Body() body: { email: string }, @Request() req: ExpressRequest) {
        const ip = getIPv4FromReq(req);
        const userAgent = req.headers['user-agent'] || '';
        await this.authService.activateAccount(body.email, ip, userAgent);
        const token = await this.authService.genarateOTPAccount(body.email, ip, userAgent);
        return { token };
    }

    // API xác minh tài khoản người dùng bằng mã OTP
    @Post('verify-account')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Xác minh tài khoản người dùng bằng mã OTP', description: 'API này cho phép người dùng xác minh tài khoản của họ bằng cách cung cấp mã OTP đã nhận được qua email. Sau khi xác minh thành công, tài khoản của người dùng sẽ được kích hoạt và họ có thể đăng nhập vào hệ thống.' })
    @ApiNoContentResponse({ description: 'Tài khoản người dùng được xác minh thành công' })
    @ApiBadRequestResponse({ description: 'Yêu cầu không hợp lệ, có thể do thiếu thông tin hoặc thông tin không đúng định dạng' })
    @ApiNotFoundResponse({ description: 'Không tìm thấy tài khoản liên quan đến token hoặc mã OTP không hợp lệ' })
    @ApiTooManyRequestsResponse({ description: 'Quá nhiều yêu cầu xác minh tài khoản, vui lòng thử lại sau' })
    @ApiInternalServerErrorResponse({ description: 'Lỗi máy chủ, có thể do sự cố với cơ sở dữ liệu hoặc lỗi không mong muốn khác' })
    async verifyAccount(@Body() body: { token: string, otp: string }, @Request() req: ExpressRequest) {
        const ip = getIPv4FromReq(req);
        const userAgent = req.headers['user-agent'] || '';
        await this.authService.verifyAccount(body.token, body.otp, ip, userAgent);
        return { message: 'Account verified successfully' };
    }

    // API đăng nhập người dùng
    @Post('authenticate')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Đăng nhập người dùng', description: 'API này cho phép người dùng đăng nhập vào hệ thống bằng cách cung cấp thông tin xác thực như email và mật khẩu. Nếu thông tin xác thực hợp lệ, hệ thống sẽ trả về một token truy cập để người dùng có thể sử dụng cho các yêu cầu tiếp theo.' })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['username', 'password'],
            properties: {
                username: {
                    type: 'string',
                    format: 'email',
                    example: 'user@example.com'
                },
                password: {
                    type: 'string',
                    format: 'password',
                    example: 'P@ssw0rd!'
                }
            }
        }
    })
    @ApiOkResponse({ description: 'Người dùng đăng nhập thành công',
        schema: {
            type: 'object',
            properties: {
                accessToken: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
                },
                refreshToken: {
                    type: 'string',
                    example: 'dGhpcy1pcy1hLXJlZnJlc2gtdG9rZW4='
                }
            }   
        }
     })
    @ApiBadRequestResponse({ description: 'Yêu cầu không hợp lệ, có thể do thiếu thông tin hoặc thông tin không đúng định dạng' })  
    @ApiUnauthorizedResponse({ description: 'Thông tin xác thực không hợp lệ, có thể do email hoặc mật khẩu sai' })
    @ApiForbiddenResponse({ description: 'Tài khoản bị cấm hoặc chưa được kích hoạt' })
    @ApiTooManyRequestsResponse({ description: 'Quá nhiều yêu cầu đăng nhập, vui lòng thử lại sau' })
    @ApiInternalServerErrorResponse({ description: 'Lỗi máy chủ, có thể do sự cố với cơ sở dữ liệu hoặc lỗi không mong muốn khác' })
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
