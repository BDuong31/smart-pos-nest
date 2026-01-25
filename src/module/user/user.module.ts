import { Module, Provider } from '@nestjs/common';
import { UserService } from './user.service';
import { UserHttpController, UserHttpRpcController } from './user-http.controller';
import { ACCESS_TOKEN_PROVIDER, REFRESH_TOKEN_PROVIDER, USER_REPOSITORY, USER_SERVICE, USER_MONGO_AUDIT_REPOSITORY, USER_MONGO_OTP_REPOSITORY } from './user.di-token';
import { UserPrismaRepository } from './user-prisma.repo';
import { UserAuditMongoRepo, UserOtpMongoRepo } from './user-mongo.repo';
import { JwtRefreshTokenService, JwtTokenService } from 'src/share/components';
import { config } from 'src/share';
import { ShareModule } from 'src/share/module';
import { ConfigModule } from '@nestjs/config';

// Khai báo các Provider 
const repositories: Provider[] = [
  { provide: USER_REPOSITORY, useClass: UserPrismaRepository },
]

// Khai báo mongo repository
const mongoRepositories: Provider[] = [
  { provide: USER_MONGO_AUDIT_REPOSITORY, useClass: UserAuditMongoRepo },
  { provide: USER_MONGO_OTP_REPOSITORY, useClass: UserOtpMongoRepo },
]

// Khai báo các Service
const services: Provider[] = [
  { provide: USER_SERVICE, useClass: UserService },
]

// Khai báo Provider tạo và xác thực token
const accessTokenJWTProvider = new JwtTokenService(config.accessJwtSecret, '15m');
const refreshTokenJWTProvider = new JwtRefreshTokenService(config.refreshJwtSecret, '7d');

const accessTokenProvider: Provider = { provide: ACCESS_TOKEN_PROVIDER, useValue: accessTokenJWTProvider };
const refreshTokenProvider: Provider = { provide: REFRESH_TOKEN_PROVIDER, useValue: refreshTokenJWTProvider };
@Module({
  imports: [ShareModule, ConfigModule],
  controllers: [UserHttpController, UserHttpRpcController],
  providers: [UserService, ...repositories, ...services, accessTokenProvider, refreshTokenProvider, ...mongoRepositories],
  exports: [USER_SERVICE, USER_REPOSITORY, USER_MONGO_AUDIT_REPOSITORY, USER_MONGO_OTP_REPOSITORY],
})
export class UserModule {}
