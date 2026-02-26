import { z } from 'zod';
import { image } from './image.model';

// ============================
// DTO cho Image
// ============================

// Định nghĩa Schema cho tạo mới Image
export const createImageDTOSchema = image.pick({
    isMain: true,
    refId: true,
    type: true,
}).required();

export type CreateImageDTO = z.infer<typeof createImageDTOSchema>;

export const updateImageDTOSchema = image.pick({
    url: true,
    isMain: true,
    refId: true,
}).partial();

export type UpdateImageDTO = z.infer<typeof updateImageDTOSchema>;

// Định nghĩa Schema cho lọc Image
export const imageCondDTOSchema = image.pick({
    url: true,
    isMain: true,
    refId: true,
    type: true,
}).partial();

export type ImageCondDTO = z.infer<typeof imageCondDTOSchema>;