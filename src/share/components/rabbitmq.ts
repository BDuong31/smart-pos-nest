import { Logger } from "@nestjs/common";
import * as amqp from "amqplib";
import { EventHandler } from "..";
import { AppEvent } from "../data-model";
import { IEventPublisher } from "../interface";

// RabbitMQClient: Lớp đại diện cho kết nối với RabbitMQ (Event Bus)
export class RabbitMQClient implements IEventPublisher {
  private static instance: RabbitMQClient;

  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private readonly exchangeName = 'baso_events'; // Tên Exchange chung cho toàn hệ thống

  private constructor(private connectionUrl: string) {}

  // Khởi tạo kết nối với RabbitMQ (Singleton)
  public static async init(connectionUrl: string) {
    if (!this.instance) {
      this.instance = new RabbitMQClient(connectionUrl);
      await this.instance._connect();
    }
  }

  // Lấy ra một thể hiện của RabbitMQClient
  public static getInstance(): RabbitMQClient {
    if (!this.instance) {
      throw new Error('RabbitMQClient instance not initialized');
    }
    return this.instance;
  }

  // Kết nối tới RabbitMQ và thiết lập Exchange
  private async _connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(this.connectionUrl);
      this.channel = await this.connection.createChannel();

      // Tạo Exchange dạng 'topic' để hỗ trợ routing linh hoạt
      await this.channel.assertExchange(this.exchangeName, 'topic', { durable: true });

      Logger.log('Connected to RabbitMQ server');

      // Xử lý khi mất kết nối
      this.connection.on('close', () => {
        Logger.error('RabbitMQ connection closed');
      });
      this.connection.on('error', (err) => {
        Logger.error(`RabbitMQ connection error: ${err}`);
      });

    } catch (error) {
      Logger.error(`RabbitMQ init error: ${(error as Error).message}`);
    }
  }

  // Gửi một sự kiện tới RabbitMQ (Implement IEventPublisher)
  public async publish<T>(event: AppEvent<T>): Promise<void> {
  console.log('Publishing event to RabbitMQ:', event.eventName, event.payload);
    try {
      if (!this.channel) {
        throw new Error('RabbitMQ channel is not ready');
      }

      const message = JSON.stringify(event.plainObject());
      const routingKey = event.eventName; // Dùng tên sự kiện làm routing key

      // Publish message lên exchange
      this.channel.publish(this.exchangeName, routingKey, Buffer.from(message));
      
    } catch (err) {
      Logger.error(`RabbitMQ publish error: ${(err as Error).message}`);
    }
  }

  // Đăng ký nhận sự kiện (Subscribe)
  public async subscribe(topic: string, fn: EventHandler): Promise<void> {
    try {
      if (!this.connection) {
        throw new Error('RabbitMQ connection is not ready');
      }

      // Tạo một channel riêng cho consumer để đảm bảo an toàn
      const consumerChannel = await this.connection.createChannel();

      // 1. Tạo hàng đợi tạm (exclusive: true) -> App tắt là queue tự xóa
      // Nếu muốn queue bền vững (không mất msg khi app chết), bỏ exclusive và đặt tên queue cụ thể
      const q = await consumerChannel.assertQueue('', { exclusive: true });

      // 2. Bind hàng đợi vào Exchange với topic (routing key) mong muốn
      await consumerChannel.bindQueue(q.queue, this.exchangeName, topic);

      // 3. Bắt đầu lắng nghe
        await consumerChannel.consume(q.queue, (msg) => {
        if (msg) {
            const content = msg.content.toString();

            const event = JSON.parse(content); // ⭐ FIX Ở ĐÂY

            fn(event);

            consumerChannel.ack(msg);
        }
        });

    } catch (error) {
      Logger.error(`RabbitMQ subscribe error: ${(error as Error).message}`);
    }
  }

  // Ngắt kết nối
  public async disconnect(): Promise<void> {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
    Logger.log('Disconnected RabbitMQ server');
  }
}