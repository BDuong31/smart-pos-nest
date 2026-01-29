import { ErrShiftAlreadyExists, ErrShiftNotFound, Shift } from "../models/shift.model";
import { ShiftCondDTO, ShiftCreateDTO, ShiftUpdateDTO } from "../dtos/shift.dto";
import { type IShiftRepository, IShiftService } from "../ports/shift.port";
import { Inject } from "@nestjs/common";
import { SHIFT_REPOSITORY, USER_MONGO_AUDIT_REPOSITORY } from "../user.di-token";
import { AppError } from "src/share";
import { v7 } from "uuid";
import { type IUserMongoAuditRepository } from "../ports/user.port";

// Lớp ShiftService triển khai các phương thức quản lý ca làm việc
export class ShiftService implements IShiftService {
    
    constructor(
        @Inject(SHIFT_REPOSITORY) private readonly shiftRepository: IShiftRepository,
        @Inject(USER_MONGO_AUDIT_REPOSITORY) private readonly userAuditRepo: IUserMongoAuditRepository,
    ){}
    // Nhân viên check in bắt đầu ca làm việc
    async checkIn(userId: string, dto: ShiftCreateDTO, ip: string, userAgent: string): Promise<void> {
        // 1. Kiểm tra nếu nhân viên đã có ca làm việc hiện tại chưa
        const currentShift = await this.shiftRepository.get(userId);
        if (currentShift) {
            await this.userAuditRepo.logUserAudit({
                userId: userId,
                action: 'CHECK_IN',
                success: false,
                ip,
                userAgent,

                // Lưu thông tin bổ sung về ca làm việc
                metadata: {
                    reason: 'Shift already exists'
                }
            });

            throw AppError.from(ErrShiftAlreadyExists, 400);
        }

        // 2. Tạo ca làm việc mới và lưu vào cơ sở dữ liệu
        const shiftId = v7();
        const newShift: Shift = {
            ...dto,
            id: shiftId,
            userId: userId,
            endTime: null,
            cashEnd: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        } 

        await this.shiftRepository.insert(newShift);
    
        // 3. Ghi log hoặc thực hiện các hành động khác nếu cần
        await this.userAuditRepo.logUserAudit({
            userId: userId,
            action: 'CHECK_IN',
            success: true,
            ip,
            userAgent,

            // Lưu thông tin bổ sung về ca làm việc
            metadata: {
                shiftId: shiftId,
                startTime: newShift.startTime,
                cashStart: newShift.cashStart, 
            }
        });

        // 4. Bắn sự kiện RabbitMQ thông báo bắt đầu ca làm việc
    }

    // Nhân viên check out kết thúc ca làm việc
    async checkOut(userId: string, shiftId: string, dto: ShiftUpdateDTO, ip: string, userAgent: string): Promise<void> {
        // 1. Kiểm tra nếu ca làm việc tồn tại và thuộc về nhân viên
        const shift = await this.shiftRepository.get(shiftId);
        if (!shift || shift.userId !== userId) {
            await this.userAuditRepo.logUserAudit({
                userId: userId,
                action: 'CHECK_OUT',
                success: false,
                ip,
                userAgent,
                // Lưu thông tin bổ sung về ca làm việc
                metadata: {
                    reason: 'Shift not found or does not belong to user'
                }
            });
            throw AppError.from(ErrShiftAlreadyExists, 400);
        }

        // 2. Cập nhật ca làm việc với thông tin kết thúc
        await this.shiftRepository.update(shiftId, {
            ...dto,
            updatedAt: new Date(),
        });

        // 3. Ghi log hoặc thực hiện các hành động khác nếu cần
        await this.userAuditRepo.logUserAudit({
            userId: userId,
            action: 'CHECK_OUT',
            success: true,
            ip,
            userAgent,
            // Lưu thông tin bổ sung về ca làm việc
            metadata: {
                shiftId: shiftId,
                endTime: dto.endTime,
                cashEnd: dto.cashEnd,
            }
        });

        // 4. Ghi log chênh lệch tiền mặt nếu có
        const cashDifference = (dto.cashEnd || 0) - shift.cashStart;
        if (cashDifference !== 0) {
            await this.userAuditRepo.logUserAudit({
                userId: userId,
                action: 'CASH_DIFFERENCE',
                success: true,
                ip,
                userAgent,
                // Lưu thông tin bổ sung về chênh lệch tiền mặt
                metadata: {
                    shiftId: shiftId,
                    cashDifference: cashDifference,
                }
            });

            // Bắn sự kiện RabbitMQ thông báo chênh lệch tiền mặt
        }

        // Bắn sự kiện RabbitMQ thông báo kết thúc ca làm việc
    }

    // Lấy ca làm việc hiện tại của nhân viên
    async getCurrentShift(userId: string, ip: string, userAgent: string): Promise<Shift> {
        // 1. Truy vấn ca làm việc hiện tại từ cơ sở dữ liệu
        const shift = await this.shiftRepository.findByCond({ userId: userId, endTime: null });
        if (shift.length === 0) {
            throw AppError.from(ErrShiftNotFound, 404);
        }

        return shift[0];
    }

    // Lấy lịch sử ca làm việc của nhân viên
    async getShiftHistory(userId: string, ip: string, userAgent: string): Promise<Shift[]> {
        // 1. Truy vấn lịch sử ca làm việc từ cơ sở dữ liệu
        const shifts = await this.shiftRepository.findByCond({ userId: userId });
        if (shifts.length === 0) {
            throw AppError.from(ErrShiftNotFound, 404);
        }
        return shifts;
    }

    // Tìm ca làm việc theo điều kiện
    async findShifts(cond: ShiftCondDTO, ip: string, userAgent: string): Promise<Shift[]> {
        // 1. Truy vấn ca làm việc theo điều kiện từ cơ sở dữ liệu
        const shifts = await this.shiftRepository.findByCond(cond);
        
        if (shifts.length === 0) {
            throw AppError.from(ErrShiftNotFound, 404);
        }

        return shifts;
    }

    // Lấy ca làm việc theo ID
    async getShiftById(shiftId: string, ip: string, userAgent: string): Promise<Shift> {
        // 1. Truy vấn ca làm việc theo ID từ cơ sở dữ liệu
        const shift = await this.shiftRepository.get(shiftId);
        if (!shift) {
            throw AppError.from(ErrShiftNotFound, 404);
        }
        return shift;
    }
}