import { Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { AccessTokenPayload, IAccessTokenProvider, IRefreshTokenProvider, RefreshTokenPayload, TokenPayload } from '../interface';
import ms, { StringValue } from 'ms';

// Lớp cung cấp dịch vụ tạo và xác thực AccessToken sử dụng JWT
@Injectable()
export class JwtTokenService implements IAccessTokenProvider {
    private readonly secretKey: string;
    private readonly expiresIn: string | number;

    constructor(secretKey: string, expiresIn: string | number) {
        this.secretKey = secretKey;
        this.expiresIn = expiresIn;
    }

    // Tạo mã truy cập token
    async generateToken(payload: AccessTokenPayload): Promise<string> {
        return jwt.sign(payload, this.secretKey, {
            expiresIn: this.expiresIn as StringValue | number,
        });
    }

    // Giải mã và xác thực token
    async verifyToken(token: string): Promise<AccessTokenPayload | null> {
        try {
            const decoded = jwt.verify(token, this.secretKey) as AccessTokenPayload;
            return decoded;
        } catch (error) {
            return null;
        }
    }
}

// Lớp cung cấp dịch vụ tạo và xác thực RefreshToken sử dụng JWT
@Injectable()
export class JwtRefreshTokenService implements IRefreshTokenProvider {
    private readonly secretKey: string;
    private readonly expiresIn: string | number;
    constructor(secretKey: string, expiresIn: string | number) {
        this.secretKey = secretKey;
        this.expiresIn = expiresIn;
    }

    // Tạo mã làm mới token
    async generateToken(payload: RefreshTokenPayload): Promise<string> {
        return jwt.sign(payload, this.secretKey, {
            expiresIn: this.expiresIn as StringValue | number,
        });
    }

    // Giải mã và xác thực token
    async verifyToken(token: string): Promise<RefreshTokenPayload | null> {
        try {
            const decoded = jwt.verify(token, this.secretKey) as RefreshTokenPayload;
            if (decoded.type !== 'refresh') return null;
            return decoded;
        } catch (error) {
            return null;
        }
    }

    // Helper: tạo payload cho refresh token
    static createPayload(userId: string): RefreshTokenPayload {
        return {
            sub: userId,
            type: 'refresh',
            jti: crypto.randomUUID(),
        }
    };

    // Helper: TTL của refresh token
    getTTL(): number {
        return typeof this.expiresIn === 'string' ? ms(this.expiresIn) : this.expiresIn * 1000;
    }
}