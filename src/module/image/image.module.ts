import { Module, Provider } from "@nestjs/common";
import { IMAGE_REPOSITORY, IMAGE_SERVICE } from "./image.di-token";
import { ImageService } from "./image.service";
import { ImagePrismaRepository } from "./image-prisma.repo";
import { ShareModule } from "src/share/module";
import { ImageHttpController } from "./image-http.controller";

const dependencies: Provider[] = [
    { provide: IMAGE_SERVICE, useClass: ImageService},
    { provide: IMAGE_REPOSITORY, useClass: ImagePrismaRepository},
];

@Module({
    imports: [ShareModule],
    controllers: [ImageHttpController],
    providers: [...dependencies],
})

export class ImageModule {}