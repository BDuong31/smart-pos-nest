import { Injectable } from "@nestjs/common";
import { IImageRepository } from "./image.port";
import { Image } from "./image.model";
import { Image as ImagePrisma } from "@prisma/client";
import prisma from "src/share/components/prisma";
import { ImageCondDTO } from "./image.dto";
import { Paginated, PagingDTO } from "src/share";

@Injectable()
export class ImagePrismaRepository implements IImageRepository {
    // Lấy ảnh theo ID
    async get(id: string): Promise<Image | null> {
        const data = await prisma.image.findFirst({
            where: { id }
        });
        if (!data) return null;
        return this._toModel(data);
    }

    // Lấy danh sách ảnh theo điều kiện và phân trang
    async list(cond: ImageCondDTO, paging: PagingDTO): Promise<Paginated<Image>> {
        const { isMain, refId, ...rest } = cond

        let where = {
            ...rest,
        }

        if (isMain) {
            where = {
                ...where,
                isMain: isMain
            } as ImageCondDTO
        }

        if (refId) {
            where = {
                ...where,
                refId: refId
            } as ImageCondDTO
        }

        const total = await prisma.image.count({ where });

        const skip = (paging.page - 1) * paging.limit;
        
        const result = await prisma.image.findMany({
            where,
            skip,
            take: paging.limit,
            orderBy: {
                createdAt: 'desc'
            }
        });

        return {
            data: result.map(this._toModel),
            paging,
            total
        };
    }

    // Lấy danh sách ảnh theo mảng IDs
    async listByIds(ids: string[]): Promise<Image[]> {
        const data = await prisma.image.findMany({
            where: { id: { in: ids } }
        });
        return data.map(this._toModel);
    }

    // Lấy danh sách ảnh theo mảng refId và type
    async listByRefIds(refId: string[], type: string, isMain?: boolean): Promise<Image[]> {
        let where: any = {
            refId: { in: refId },
            type
        };

        if (isMain !== undefined) {
            where.isMain = isMain;
        }
        
        const data = await prisma.image.findMany({
            where
        });
        return data.map(this._toModel);
    }

    // Thêm ảnh mới
    async insert(image: Image): Promise<void> {
        await prisma.image.create({ data: image });
    }

    // Cập nhật thông tin ảnh
    async update(id: string, dto: Partial<Image>): Promise<void> {
        await prisma.image.update({
            where: { id },
            data: dto
        });
    }

    // Xóa ảnh theo ID
    async delete(id: string): Promise<void> {
        await prisma.image.delete({
            where: { id }
        });
    }

    // Chuyển đổi dữ liệu từ Prisma sang Model
    private _toModel(data: ImagePrisma): Image {
        return { ...data } as Image;
    }
}
