import { Injectable, Inject } from '@nestjs/common';
import { MongoClient, MongoRepository } from 'src/share/components/mongo';
import {
  IUserAudit,
  IOtpAttempt,
  IUserAuditSchema,
  IOtpAttemptSchema,
} from '../models/user-mongo.model';
import { MONGO_SERVICE } from 'src/share/di-token';
import { IUserMongoAuditRepository, IUserMongoOtpRepository } from '../ports/user.port';
@Injectable()
export class UserAuditMongoRepo extends MongoRepository<IUserAudit> implements IUserMongoAuditRepository {
  constructor(
    @Inject(MONGO_SERVICE) private readonly mongoClient: MongoClient,
  ) {
    super('UserAudit', IUserAuditSchema, 'user_audits');
  }

  async logUserAudit(data: {
    userId?: string;
    action: string;
    success: boolean;
    ip?: string;
    userAgent?: string;
    metaData?: Record<string, any>;
  }): Promise<void> {
    await this.create(data);
  }

  async getUserAudits(userId: string, limit: number): Promise<IUserAudit[]> {
    return this.model
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }
}

@Injectable()
export class UserOtpMongoRepo extends MongoRepository<IOtpAttempt> implements IUserMongoOtpRepository {
  constructor(
    @Inject(MONGO_SERVICE) private readonly mongoClient: MongoClient
  ) {
    super('OtpAttempt', IOtpAttemptSchema, 'otp_attempts');
  }

  async logOTPAttempt(data: {
    identifier: string;
    type: string;
    action: string;
    success: boolean;
    ip?: string;
    userAgent?: string;
    metaData?: Record<string, any>;
  }): Promise<void> {
    await this.create(data);
  }

    async getOTPAttempts(identifier: string, type: string, limit: number): Promise<IOtpAttempt[]> {
    return this.model
      .find({ identifier, type })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  // Đếm số lần thất bại của OTP trong khoảng thời gian
    async countFailOTPAttempts(identifier: string, type: string, from: Date, to?: Date): Promise<number> {
        const query: any = {
        identifier,
        type,
            success: false,
            createdAt: { $gte: from },
        };
        if (to) {
        query.createdAt.$lte = to;
        }
        return this.model.countDocuments(query);
    }
}
