import { Module, Provider } from '@nestjs/common';
import { UserService } from './user.service';
import { UserHttpController, UserHttpRpcController } from './user-http.controller';
import { ACCESS_TOKEN_PROVIDER, REFRESH_TOKEN_PROVIDER, USER_REPOSITORY, USER_SERVICE } from './user.di-token';
import { UserPrismaRepository } from './user-prisma.repo';
import { JwtRefreshTokenService, JwtTokenService } from 'src/share/components';
import { config } from 'src/share';
import { ShareModule } from 'src/share/module';
import { ConfigModule } from '@nestjs/config';

// Khai báo các Provider 
const repositories: Provider[] = [
  { provide: USER_REPOSITORY, useClass: UserPrismaRepository },
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
  providers: [UserService, ...repositories, ...services, accessTokenProvider, refreshTokenProvider],
  exports: [USER_SERVICE, USER_REPOSITORY]
})
export class UserModule {}
