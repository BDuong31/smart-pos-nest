import { z } from "zod";

// ============================
// Model cho Purchase Proposal Detail
// ============================ 
// Định nghĩa lỗi cho Purchase Proposal Detail
// 1. Lỗi chung về Purchase Proposal Detail
export const ErrPurchaseProposalDetailNotFound = new Error('Purchase proposal detail not found'); // Lỗi chi tiết đề xuất mua hàng không tồn tại
export const ErrPurchaseProposalDetailAlreadyExists = new Error('Purchase proposal detail already exists'); // Lỗi chi tiết đề xuất mua hàng đã tồn tại

// 2. Lỗi về số lượng của chi tiết đề xuất mua hàng
export const ErrPurchaseProposalDetailQuantityNegative = new Error('Purchase proposal detail quantity cannot be negative'); // Lỗi số lượng của chi tiết đề xuất mua hàng không được âm

// 3. Lỗi về đơn vị của chi tiết đề xuất mua hàng
export const ErrPurchaseProposalDetailUnitRequired = new Error('Purchase proposal detail unit is required'); // Lỗi đơn vị của chi tiết đề xuất mua hàng bắt buộc
export const ErrPurchaseProposalDetailUnitTooShort = new Error('Purchase proposal detail unit is too short'); // Lỗi đơn vị của chi tiết đề xuất mua hàng quá ngắn
export const ErrPurchaseProposalDetailUnitTooLong = new Error('Purchase proposal detail unit is too long'); // Lỗi đơn vị của chi tiết đề xuất mua hàng quá dài

// Mô hình dữ liệu cho Purchase Proposal Detail
export const purchaseProposalDetailSchema = z.object({
    id: z.string().uuid(),  
    proposalId: z.string().uuid(),
    ingredientId: z.string().uuid(),
    quantity: z.number().min(0, {message: ErrPurchaseProposalDetailQuantityNegative.message}),
    unit: z.string().min(1, {message: ErrPurchaseProposalDetailUnitRequired.message}).max(50, {message: ErrPurchaseProposalDetailUnitTooLong.message}),
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type PurchaseProposalDetail = z.infer<typeof purchaseProposalDetailSchema>;