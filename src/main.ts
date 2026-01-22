import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as swaggerUi from 'swagger-ui-express';
import { ValidationPipe } from '@nestjs/common';
import * as dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
async function bootstrap() {
  // Tạo ứng dụng NestJS
  const app = await NestFactory.create(AppModule);

  // Bật CORS cho tất cả các nguồn
  app.enableCors({
    origin: '*', // Cho phép tất cả các nguồn
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // Các phương thức được phép
  });

  // Sử dụng ValidationPipe toàn cục để tự động validate các DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Cho loại bỏ các thuộc tính không được định nghĩa trong DTO
      forbidNonWhitelisted: true, // Ném lỗi nếu có thuộc tính không được phép
      transform: true // Tự động chuyển đổi payload thành các đối tượng có kiểu theo các lớp DTO
    }),
  )

  // Cấu hình Swagger
  const config = new DocumentBuilder()
    .setTitle('Smart POS API') // Tiêu đề của API
    .setDescription('The Smart POS API description') // Mô tả của API
    .setVersion('1.0') // Phiên bản của API
    .addTag('smart-pos') // Thêm thẻ cho API
    .addBearerAuth() // Thêm xác thực Bearer
    .addServer('http://localhost:5000') // Thêm server mặc định
    .build(); // Xây dựng cấu hình

  // Tạo tài liệu Swagger
  const document = SwaggerModule.createDocument(app, config);
  
  // Thiết lập Swagger UI tại đường dẫn /api/docs
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(document, {
    customJs:  '/assets/swagger.js', // Đường dẫn tới file JavaScript tùy chỉnh
    customfavIcon: '/assets/logo.png', // Đường dẫn tới favicon tùy chỉnh
    customSiteTitle: 'Smart POS API Docs', // Tiêu đề trang tùy chỉnh
    swaggerOptions: {
      persistAuthorization: true,
    },
  }));

  // Lắng nghe kết nối trên cổng được chỉ định trong biến môi trường PORT hoặc mặc định là 5000
  await app.listen(process.env.PORT ?? 5000);

  // In ra URL của ứng dụng và tài liệu Swagger
  console.log(`Ứng dụng đang chạy tại: ${await app.getUrl()}`);
  console.log(`Tài liệu Swagger có thể truy cập tại: ${await app.getUrl()}/api/docs`);
}
bootstrap();
