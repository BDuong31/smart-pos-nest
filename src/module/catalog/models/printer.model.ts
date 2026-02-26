import { z } from 'zod';
// Định nghĩa lỗi về máy in

// 1. Định nghĩa lỗi chung về máy in
export const ErrPrinterNotFound = new Error('Printer not found'); // Lỗi máy in không tồn tại
export const ErrPrinterAlreadyExists = new Error('Printer already exists'); // Lỗi máy in đã tồn tại

// 2. Định nghĩa lỗi về tên máy in
export const ErrPrinterNameRequired = new Error('Printer name is required');
export const ErrPrinterNameTooShort = new Error('Printer name is too short');
export const ErrPrinterNameTooLong = new Error('Printer name is too long');
export const ErrPrinterNameInvalidFormat = new Error('Printer name has invalid format');

// 3. Định nghĩa lỗi về địa chỉ IP
export const ErrPrinterIpAddressRequired = new Error('Printer IP address is required');
export const ErrPrinterIpAddressInvalid = new Error('Printer IP address is invalid');

// 4. Định nghĩa lỗi về loại máy in
export const ErrPrinterTypeInvalid = new Error('Printer type is invalid');


// Định nghĩa dữ liệu máy in
export const printerSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(200),
    ipAddress: z.string().ipv4(),
    type: z.enum(['RECEIPT', 'KITCHEN', 'LABEL']),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type Printer = z.infer<typeof printerSchema>;