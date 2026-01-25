import { Logger } from "@nestjs/common";
import mongoose, { Mongoose, Model, Schema } from 'mongoose';

// MongoClient: Lớp đại diện cho dịch vụ MongoDB
export class MongoClient {
  private static instance: MongoClient;
  private mongooseInstance: Mongoose;

  private constructor(private connectionUrl: string) {}

  // Khởi tạo kết nối với MongoDB (Singleton)
  static async init(connectionUrl: string) {
    if (!this.instance) {
      this.instance = new MongoClient(connectionUrl);
      await this.instance.connect();
    }
  }

  // Lấy ra một thể hiện của MongoClient
  static getInstance(): MongoClient {
    if (!this.instance) {
      throw new Error('MongoClient not initialized');
    }
    return this.instance;
  }

  // Kết nối tới MongoDB
  private async connect() {
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

// MongoRepository: Lớp trừu tượng cho các repository sử dụng MongoDB
export abstract class MongoRepository<T> {
  protected model: Model<T>;

  // Khởi tạo repository với model name, schema và collection tùy chọn
  constructor(
    modelName: string,
    schema: Schema,
    collection?: string,
  ) {
    const conn = MongoClient.getInstance().getConnection();

    // tránh lỗi OverwriteModelError
    this.model =
      conn.models[modelName] ??
      conn.model<T>(modelName, schema, collection);
  }

  // Tạo một tài liệu mới
  create(doc: Partial<T>) {
    const document = new this.model(doc);
    return document.save();
  }

  // Tìm một tài liệu theo bộ lọc
  findOne(filter: Partial<T>) {
    return this.model.findOne(filter).lean();
  }

  // Tìm nhiều tài liệu theo bộ lọc
  findMany(filter: Partial<T> = {}) {
    return this.model.find(filter).lean();
  }

  // Cập nhật một tài liệu theo bộ lọc
  updateOne(filter: Partial<T>, update: Partial<T>) {
    return this.model.updateOne(filter, { $set: update });
  }

  // Xoá một tài liệu theo bộ lọc
  deleteOne(filter: Partial<T>) {
    return this.model.deleteOne(filter);
  }
}
