import { PublicUser } from "src/share/data-model";
import { z } from "zod";

// ============================
// Model cho Purchase Proposal
// ============================
// Định nghĩa lỗi cho Purchase Proposal
// 1. Lỗi chung về Purchase Proposal
export const ErrPurchaseProposalNotFound = new Error('Purchase proposal not found'); // Lỗi đề xuất mua hàng không tồn tại
export const ErrPurchaseProposalAlreadyExists = new Error('Purchase proposal already exists'); // Lỗi đề xuất mua hàng đã tồn tại

// Mô hình dữ liệu cho Purchase Proposal
export const purchaseProposalSchema = z.object({
    id: z.string().uuid(),
    code: z.string().max(50),
    creatorId: z.string().uuid().optional(),
    status: z.string().optional(),
    note: z.string().optional(), 
    createdAt: z.date(),
    updatedAt: z.date(),
})

export type PurchaseProposal = z.infer<typeof purchaseProposalSchema> & { creator?: PublicUser };  