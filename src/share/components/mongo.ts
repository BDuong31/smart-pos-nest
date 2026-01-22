import { Logger } from "@nestjs/common";
import mongoose, { Mongoose } from "mongoose";

// MongoClient: Lớp đại diện cho kết nối với MongoDB
export class MongoClient {
  private static instance: MongoClient;
  private mongooseInstance: Mongoose;

  private constructor(private connectionUrl: string) {}

  // Khởi tạo kết nối với MongoDB (Singleton)
  public static async init(connectionUrl: string) {
    if (!this.instance) {
      this.instance = new MongoClient(connectionUrl);
      await this.instance._connect();
    }
  }

  // Lấy ra một thể hiện của MongoClient
  public static getInstance(): MongoClient {
    if (!this.instance) {
      throw new Error('MongoClient instance not initialized');
    }
    return this.instance;
  }

  // Kết nối tới MongoDB
  private async _connect(): Promise<void> {
    try {
      // Thiết lập strictQuery nếu cần (tùy version mongoose)
      mongoose.set('strictQuery', false);

      this.mongooseInstance = await mongoose.connect(this.connectionUrl, {
        family: 4,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        tls: true,      
        retryWrites: true,
      });
      Logger.log('Connected to MongoDB server');

      // Lắng nghe các sự kiện kết nối
      mongoose.connection.on('disconnected', () => {
        Logger.warn('MongoDB disconnected');
      });
      
      mongoose.connection.on('error', (err) => {
        Logger.error(`MongoDB connection error: ${err}`);
      });

    } catch (error) {
      Logger.error(`MongoDB init error: ${(error as Error).message}`);
      // Có thể throw error để chặn app khởi động nếu DB quan trọng
      // throw error; 
    }
  }

  // Helper để lấy native connection nếu cần thao tác raw
  public getConnection() {
    return this.mongooseInstance.connection;
  }

  // Ngắt kết nối
  public async disconnect(): Promise<void> {
    await mongoose.disconnect();
    Logger.log('Disconnected MongoDB server');
  }
}