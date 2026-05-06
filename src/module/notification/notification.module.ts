import { Module } from '@nestjs/common';
import { NotificationHttpController } from './notification-http.controller';
import { NotificationService } from './notification.service';
import { NotificationPrismaRepository } from './notification-prisma.repo';
import { 
  NOTIFICATION_REPOSITORY, 
  NOTIFICATION_SERVICE 
} from './notification.di-token';
import { Provider } from '@nestjs/common';
import { ShareModule } from "src/share/module";
import { NotificationConsumer } from './notification.consumer';

const dependencies: Provider[] = [
    { provide: NOTIFICATION_REPOSITORY, useClass: NotificationPrismaRepository },
    { provide: NOTIFICATION_SERVICE, useClass: NotificationService },
]

@Module({
    imports: [ShareModule],
    controllers: [NotificationHttpController, NotificationConsumer],
    providers: [...dependencies],
})

export class NotificationModule {}
