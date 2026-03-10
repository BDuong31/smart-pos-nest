import { z } from "zod";
import { voucherSchema } from "../models/voucher.model";

// ============================
// Định nghĩa các DTO cho Voucher
// ============================

// Định nghĩa schema cho tạo voucher
export const voucherCreateDTOSchema = voucherSchema.pick({
    code: true, // Mã voucher
    type: true, // Loại voucher
    value: true, // Giá trị voucher
    minOrderVal: true, // Giá trị tối thiểu áp dụng voucher
    usageLimit: true, // Giới hạn sử dụng voucher
    isActive: true, // Trạng thái kích hoạt voucher
    startDate: true, // Ngày bắt đầu của voucher
    endDate: true, // Ngày kết thúc của voucher
}).required()

// Định nghĩa kiểu dữ liệu cho tạo voucher
export interface VoucherCreateDTO extends z.infer<typeof voucherCreateDTOSchema> {}

// Định nghĩa schema cho cập nhật voucher
export const voucherUpdateDTOSchema = voucherSchema.pick({
    code: true, // Mã voucher
    type: true, // Loại voucher
    value: true, // Giá trị voucher
    minOrderVal: true, // Giá trị tối thiểu áp dụng voucher
    usageLimit: true, // Giới hạn sử dụng voucher
    isActive: true, // Trạng thái kích hoạt voucher
    startDate: true, // Ngày bắt đầu của voucher
    endDate: true, // Ngày kết thúc của voucher
}).partial()

// Định nghĩa kiểu dữ liệu cho cập nhật voucher
export interface VoucherUpdateDTO extends z.infer<typeof voucherUpdateDTOSchema> {}

// Định nghĩa schema cho điều kiện truy vấn voucher
export const voucherCondDTOSchema = voucherSchema.pick({
    code: true, // Mã voucher
    type: true, // Loại voucher
    value: true, // Giá trị voucher
    minOrderVal: true, // Giá trị tối thiểu áp dụng voucher
    usageLimit: true, // Giới hạn sử dụng voucher
    isActive: true, // Trạng thái kích hoạt voucher
    startDate: true, // Ngày bắt đầu của voucher
    endDate: true, // Ngày kết thúc của voucher
}).partial();

// Định nghĩa kiểu dữ liệu cho điều kiện truy vấn voucher
export interface VoucherCondDTO extends z.infer<typeof voucherCondDTOSchema> {}