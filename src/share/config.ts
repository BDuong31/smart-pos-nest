import dotenv from 'dotenv';

dotenv.config({
    // path: process.env.NODE_ENV === 'production' ? '.env' : `.env.${process.env.NODE_ENV}`,
});

const port = process.env.PORT || '5000';

export const config = {
    envName: process.env.NODE_ENV,
    port,

    accessJwtSecret: process.env.ACCESS_JWT_SECRET || 'baso_smart_pos_secret_key',
    refreshJwtSecret: process.env.REFRESH_JWT_SECRET || 'baso_smart_pos_refresh_secret_key',

    // Cấu hình giao tiếp
    rpc: {
        accessJwtSecret: process.env.ACCESS_JWT_SECRET || 'baso_smart_pos_secret_key',
        refreshJwtSecret: process.env.REFRESH_JWT_SECRET || 'baso_smart_pos_refresh_secret_key',
        introspectUrl: process.env.VERIFY_TOKEN_URL || `http://localhost:${port}/v1/rpc/introspect`,
    },

    // Cấu hình redis
    redis: {
        host: process.env.REDIS_HOST || 'redis-baso',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        user: process.env.REDIS_USER || 'default',
        password: process.env.REDIS_PASSWORD || '',
        url: process.env.REDIS_URL || 'redis://:baso_redis@localhost:6379',
    },

    // Cấu hình cơ sở dữ liệu
    db: {
        name: process.env.DATABASE_NAME || 'postgres',
        user: process.env.DATABASE_USER || 'postgres',
        password: process.env.DATABASE_PASSWORD || 'password',
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT || '5432'),
        url: process.env.DIRECT_URL || 'postgresql://postgres:password@localhost:5432/postgres',
    },

    // Cấu hình mongodb
    mongo: {
        uri: process.env.MONGO_URI || 'mongodb://localhost:27017/smart-pos',
    },

    // Cấu hình RabbitMQ
    rabbitmq: {
        url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
    },
}