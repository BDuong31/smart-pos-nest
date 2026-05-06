import { forwardRef, Module } from '@nestjs/common';
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
import { SalesModule } from './module/sales/sales.module';
import { InventoryModule } from './module/inventory/inventory.module';
import { SystemModule } from './module/system/system.module';
import { NotificationModule } from './module/notification/notification.module';
import { APP_GUARD } from '@nestjs/core';
import { MaintenanceGuard } from './share/guard/maintenance';
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
    SalesModule,
    InventoryModule,
    SystemModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: MaintenanceGuard,
    },
    AppService,
  ],
})
export class AppModule {}
