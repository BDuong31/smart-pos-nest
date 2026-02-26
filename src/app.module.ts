import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ShareModule } from './share/module';
import { MailModule } from './module/mail/mail.module';
import { UserModule } from './module/user/user.module';
import { ImageModule } from './module/image/image.module';
import { CatalogModule } from './module/catalog/catalog.module';
import { OperationsModule } from './module/operations/operations.module';
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'assets'),
      serveRoot: '/assets',
    }),
    ShareModule,
    MailModule,
    ImageModule,
    UserModule,
    CatalogModule,
    OperationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}