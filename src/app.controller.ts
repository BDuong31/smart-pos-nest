import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Post, Body } from '@nestjs/common';
import { RabbitMQClient } from './share/components/rabbitmq';
import { AppEvent } from './share';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
