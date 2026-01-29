import { Module, Provider } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserHttpController, UserHttpRpcController } from './controllers/user-http.controller';
import { ACCESS_TOKEN_PROVIDER, REFRESH_TOKEN_PROVIDER, USER_REPOSITORY, USER_SERVICE, USER_MONGO_AUDIT_REPOSITORY, USER_MONGO_OTP_REPOSITORY, SHIFT_REPOSITORY, LOYALTY_REPOSITORY, AUTH_SERVICE, SHIFT_SERVICE, LOYALTY_SERVICE } from './user.di-token';
import { UserPrismaRepository } from './repos/user-prisma.repo';
import { UserAuditMongoRepo, UserOtpMongoRepo } from './repos/user-mongo.repo';
import { JwtRefreshTokenService, JwtTokenService } from 'src/share/components';
import { config } from 'src/share';
import { ShareModule } from 'src/share/module';
import { ConfigModule } from '@nestjs/config';
import { ShiftPrismaRepository } from './repos/shift-prisma.repo';
import { LoyaltyPrismaRepository } from './repos/loyalty-prisma.repo';
import { AuthService } from './services/auth.service';
import { ShiftService } from './services/shift.service';
import { LoyaltyService } from './services/loyalty.serivce';
import { AuthHttpController, AuthRpcHttpController } from './controllers/auth-http.controller';
import { ShiftHttpController, ShiftRpcController } from './controllers/shift-http.controller';
import { LoyaltyHttpController, LoyaltyRpcController } from './controllers/loyalty-http.controller';

// Khai báo các Provider 
const repositories: Provider[] = [
  { provide: USER_REPOSITORY, useClass: UserPrismaRepository },
  { provide: SHIFT_REPOSITORY, useClass: ShiftPrismaRepository},
  { provide: LOYALTY_REPOSITORY, useClass: LoyaltyPrismaRepository },
]

// Khai báo mongo repository
const mongoRepositories: Provider[] = [
  { provide: USER_MONGO_AUDIT_REPOSITORY, useClass: UserAuditMongoRepo },
  { provide: USER_MONGO_OTP_REPOSITORY, useClass: UserOtpMongoRepo },
]

// Khai báo các Service
const services: Provider[] = [
  { provide: AUTH_SERVICE, useClass: AuthService },
  { provide: USER_SERVICE, useClass: UserService },
  { provide: SHIFT_SERVICE, useClass: ShiftService },
  { provide: LOYALTY_SERVICE, useClass: LoyaltyService },
]

// Khai báo Provider tạo và xác thực token
const accessTokenJWTProvider = new JwtTokenService(config.accessJwtSecret, '15m');
const refreshTokenJWTProvider = new JwtRefreshTokenService(config.refreshJwtSecret, '7d');

const accessTokenProvider: Provider = { provide: ACCESS_TOKEN_PROVIDER, useValue: accessTokenJWTProvider };
const refreshTokenProvider: Provider = { provide: REFRESH_TOKEN_PROVIDER, useValue: refreshTokenJWTProvider };
@Module({
  imports: [ShareModule, ConfigModule],
  controllers: [AuthHttpController, AuthRpcHttpController,UserHttpController, UserHttpRpcController, ShiftHttpController, ShiftRpcController, LoyaltyHttpController, LoyaltyRpcController],
  providers: [UserService, ...repositories, ...services, accessTokenProvider, refreshTokenProvider, ...mongoRepositories],
  exports: [USER_SERVICE, AUTH_SERVICE, SHIFT_SERVICE, LOYALTY_SERVICE, USER_REPOSITORY, SHIFT_REPOSITORY, LOYALTY_REPOSITORY, USER_MONGO_AUDIT_REPOSITORY, USER_MONGO_OTP_REPOSITORY],
})
export class UserModule {}
