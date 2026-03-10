import { z } from "zod";
import { purchaseProposalSchema } from "../models/purchaseProposal.model";
import { v7 } from "uuid";

// ============================
// Định nghĩa các DTO cho PurchaseProposal
// ============================

// Định nghĩa schema cho tạo đề xuất mua hàng
export const purchaseProposalCreateDTOSchema = purchaseProposalSchema.pick({
    code: true, // Mã đề xuất mua hàng
    creatorId: true, // ID người tạo đề xuất mua hàng
    note: true, // Ghi chú cho đề xuất mua hàng
}).partial({ creatorId: true }).transform((data) => ({
    ...data,
    creatorId: data.creatorId || 'AI_GENERATED_' + v7(), // Nếu không có creatorId, tạo một UUID mới
}))

// Định nghĩa kiểu dữ liệu cho tạo đề xuất mua hàng
export interface PurchaseProposalCreateDTO extends z.infer<typeof purchaseProposalCreateDTOSchema> {}   

// Định nghĩa schema cho cập nhật đề xuất mua hàng
export const purchaseProposalUpdateDTOSchema = purchaseProposalSchema.pick({
    code: true, // Mã đề xuất mua hàng
    creatorId: true, // ID người tạo đề xuất mua hàng
    status: true, // Trạng thái của đề xuất mua hàng
    note: true, // Ghi chú cho đề xuất mua hàng
}).partial()            

// Định nghĩa kiểu dữ liệu cho cập nhật đề xuất mua hàng
export interface PurchaseProposalUpdateDTO extends z.infer<typeof purchaseProposalUpdateDTOSchema> {}

// Định nghĩa schema cho điều kiện truy vấn đề xuất mua hàng
export const purchaseProposalCondDTOSchema = purchaseProposalSchema.pick({
    code: true, // Mã đề xuất mua hàng
    creatorId: true, // ID người tạo đề xuất mua hàng
    status: true, // Trạng thái của đề xuất mua hàng
    note: true, // Ghi chú cho đề xuất mua hàng
}).partial()

// Định nghĩa kiểu dữ liệu cho điều kiện truy vấn đề xuất mua hàng
export interface PurchaseProposalCondDTO extends z.infer<typeof purchaseProposalCondDTOSchema> {}