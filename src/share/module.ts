import { Module, Provider, Global } from "@nestjs/common";
import { RedisClient, RabbitMQClient, MongoClient } from "./components"; // Import các client mới
import { TerminusModule } from "@nestjs/terminus";
import { MongooseModule } from "@nestjs/mongoose";
import { config } from "./config";
import { 
  EVENT_PUBLISHER, 
  TOKEN_INTROSPECTOR, 
  CACHE_SERVICE, 
  MONGO_CONNECTION 
} from "./di-token";
import { TokenIntrospectorRPCClient } from "./rpc/token-introspect.rpc";

// Khởi tạo provider cho việc kiểm tra token
const tokenRPCClient = new TokenIntrospectorRPCClient(config.rpc.introspectUrl);
const tokenIntrospector: Provider = {
  provide: TOKEN_INTROSPECTOR,
  useValue: tokenRPCClient,
};

// Định nghĩa provider cho RabbitMQ, Redis và MongoDB
const rabbitMQProvider: Provider = {
  provide: EVENT_PUBLISHER, 
  useFactory: async () => {
    // Khởi tạo Singleton RabbitMQ
    console.log(config.rabbitmq.url);
    await RabbitMQClient.init(config.rabbitmq.url); 
    return RabbitMQClient.getInstance();
  }
};

const redisProvider: Provider = {
  provide: CACHE_SERVICE, 
  useFactory: async () => {
    // Khởi tạo Singleton Redis
    console.log(config.redis.url);
    const redisClient = new RedisClient();
    return redisClient;
  }
};

const mongoProvider: Provider = {
  provide: MONGO_CONNECTION,
  useFactory: async () => {
    console.log(config.mongo.uri);
    await MongoClient.init(config.mongo.uri);
    return MongoClient.getInstance();
  }
};

@Global()
@Module({
  providers: [
    tokenIntrospector, // RPC Token Introspector
    rabbitMQProvider, // Pub/Sub
    redisProvider,    // Cache
    mongoProvider     // NoSQL DB
  ],
  exports: [
    tokenIntrospector,
    rabbitMQProvider, 
    redisProvider, 
    mongoProvider
  ]
})
export class ShareModule { }