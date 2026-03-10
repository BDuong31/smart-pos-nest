import { z } from "zod";
import { purchaseProposalDetailSchema } from "../models/purchaseProposalDetail.model";

// ============================
// Định nghĩa các DTO cho PurchaseProposalDetail
// ============================

// Định nghĩa schema cho tạo chi tiết đề xuất mua hàng
export const purchaseProposalDetailCreateDTOSchema = purchaseProposalDetailSchema.pick({
    proposalId: true, // ID đề xuất mua hàng    
    ingredientId: true, // ID nguyên liệu
    quantity: true, // Số lượng nguyên liệu đề xuất mua
    unit: true, // Đơn vị của nguyên liệu đề xuất mua
}).required()   

// Định nghĩa kiểu dữ liệu cho tạo chi tiết đề xuất mua hàng    
export interface PurchaseProposalDetailCreateDTO extends z.infer<typeof purchaseProposalDetailCreateDTOSchema> {}

// Định nghĩa schema cho cập nhật chi tiết đề xuất mua hàng
export const purchaseProposalDetailUpdateDTOSchema = purchaseProposalDetailSchema.pick({
    proposalId: true, // ID đề xuất mua hàng    
    ingredientId: true, // ID nguyên liệu
    quantity: true, // Số lượng nguyên liệu đề xuất mua
    unit: true, // Đơn vị của nguyên liệu đề xuất mua
}).partial()

// Định nghĩa kiểu dữ liệu cho cập nhật chi tiết đề xuất mua hàng
export interface PurchaseProposalDetailUpdateDTO extends z.infer<typeof purchaseProposalDetailUpdateDTOSchema> {}

// Định nghĩa schema cho điều kiện truy vấn chi tiết đề xuất mua hàng
export const purchaseProposalDetailCondDTOSchema = purchaseProposalDetailSchema.pick({
    proposalId: true, // ID đề xuất mua hàng    
    ingredientId: true, // ID nguyên liệu
    quantity: true, // Số lượng nguyên liệu đề xuất mua
    unit: true, // Đơn vị của nguyên liệu đề xuất mua
}).partial()

// Định nghĩa kiểu dữ liệu cho điều kiện truy vấn chi tiết đề xuất mua hàng
export interface PurchaseProposalDetailCondDTO extends z.infer<typeof purchaseProposalDetailCondDTOSchema> {}