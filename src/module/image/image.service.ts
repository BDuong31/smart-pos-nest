import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { type IImageRepository, IImageService } from "./image.port";
import { PrismaClient } from "@prisma/client";
import prisma from "src/share/components/prisma";
import { IMAGE_REPOSITORY } from "./image.di-token";
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { CreateImageDTO, createImageDTOSchema, UpdateImageDTO, updateImageDTOSchema } from "./image.dto";
import { v7 } from "uuid";
import { ErrImageNotFound, ImageType } from "./image.model";
import { AppError } from "src/share";

@Injectable()
export class ImageService implements IImageService {
    private readonly prisma: PrismaClient = prisma;

    constructor(
        @Inject(IMAGE_REPOSITORY) private readonly imageRepo: IImageRepository
    ) {
        cloudinary.config(process.env.CLOUDINARY_URL || '');
    }

    onModuleInit(){
        if (!process.env.CLOUDINARY_URL) {
            console.warn("CLOUDINARY_URL is not set. Cloudinary operations will likely fail.");
        }
    }

    private fileToDataURI(file: Express.Multer.File): string {
        if (!file.buffer){
            throw new BadRequestException("File buffer is missing. Check Multer setup.");
        }
        return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    }

    async create(dto: CreateImageDTO, file: Express.Multer.File): Promise<string> {
        const data = createImageDTOSchema.parse(dto);

        let uploadResult: UploadApiResponse;

        if (!file) {
            throw new BadRequestException("No file provided for upload.");
        }

        try {
            const fileUri = this.fileToDataURI(file);
            
            uploadResult = await cloudinary.uploader.upload(fileUri, {
                folder: `smart-pos/${data.type}/${data.refId}`,
            });
        } catch (error) {
            console.error("Cloudinary upload error:", error);
            throw new BadRequestException("Error uploading file to Cloudinary: ");
        }

        const newId = v7();

        await this.prisma.$transaction(async(tx) => {
            if (data.isMain){
                const existingMainImages = await tx.image.findFirst({
                    where: { refId: data.refId, isMain: true }
                });

                if (existingMainImages) {
                    await tx.image.update({
                        where: { id: existingMainImages.id },
                        data: { isMain: false }
                    });
                }
            }

            const newImage = {
                id: newId,
                url: uploadResult.secure_url,
                isMain: data.isMain,
                publicId: uploadResult.public_id,
                refId: data.refId,
                type: data.type as ImageType,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            await this.imageRepo.insert(newImage);
        })

        return newId;
    }

    // Cập nhật ảnh
    async update(imageId: string, dto: UpdateImageDTO): Promise<boolean> {
        const data = updateImageDTOSchema.parse(dto);

        const imageExist = await this.imageRepo.get(imageId);

        if (!imageExist) {
            throw AppError.from(ErrImageNotFound, 404);
        }

        if (data.isMain === true){
            await this.prisma.$transaction(async(tx) => {
                await tx.image.updateMany({
                    where: { refId: imageExist.refId, isMain: true },
                    data: { isMain: false }
                });

                const updatedImage = {
                    ...data,
                    updatedAt: new Date()
                }

                await this.imageRepo.update(imageId, updatedImage);
            })
        } else {
            const updatedImage = {
                ...data,
                updatedAt: new Date()
            }

            await this.imageRepo.update(imageId, updatedImage);
        }
        
        return true;
    }

    // Xóa ảnh
    async delete(imageId: string): Promise<boolean> {
        const imageExist = await this.imageRepo.get(imageId);

        if (!imageExist) {
            throw AppError.from(ErrImageNotFound, 404);
        }

        if (imageExist.publicId) {
            try {
                await cloudinary.uploader.destroy(imageExist.publicId);
            } catch (error) {
                console.error("Cloudinary deletion error:", error);
                throw new BadRequestException("Error deleting image from Cloudinary.");
            }
        }

        await this.prisma.$transaction(async(tx) => {
            await this.imageRepo.delete(imageId);

            if(imageExist.isMain) {
                const nextMainCandidate = await tx.image.findFirst({
                    where: { refId: imageExist.refId },
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                });

                if (nextMainCandidate) {
                    await tx.image.update({
                        where: { id: nextMainCandidate.id },
                        data: { isMain: true }
                    });
                }
            }
        });

        return true;
    }
}