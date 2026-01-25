import { Schema } from 'mongoose';


// Lưu trữ các hành động audit của người dùng
export interface IUserAudit {
  userId?: string | null;
  action: string;
  success: boolean;
  ip?: string;
  userAgent?: string;
  metaData?: Record<string, any>;
  createdAt?: Date;
}

export const IUserAuditSchema = new Schema<IUserAudit>(
  {
    userId: { type: String, index: true, default: null },
    action: { type: String, required: true, index: true },
    success: { type: Boolean, required: true },
    ip: { type: String },
    userAgent: { type: String },
    metaData: { type: Schema.Types.Mixed },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'user_audits',
  },
);

// Lưu trữ các lần yêu cầu OTP và kết quả
export interface IOtpAttempt {
  identifier: string;
  type: string; // REGISTER | RESET_PASSWORD | LOGIN | ...
  action: string;
  success: boolean;
  ip?: string;
  userAgent?: string;
  createdAt?: Date;
  metaData?: Record<string, any>;
}

export const IOtpAttemptSchema = new Schema<IOtpAttempt>(
  {
    identifier: { type: String, required: true, index: true },
    type: { type: String, required: true, index: true },
    action: { type: String, required: true, index: true },
    success: { type: Boolean, required: true },
    ip: { type: String },
    userAgent: { type: String },
    metaData: { type: Schema.Types.Mixed },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'otp_attempts',
  },
);
