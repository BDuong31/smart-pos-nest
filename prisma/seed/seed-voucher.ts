import { Prisma, PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu quá trình seed Voucher...');

  // 1. Đọc dữ liệu từ file JSON
  const vouchersPath = path.join(__dirname, '../data/voucher.json');
  
  if (!fs.existsSync(vouchersPath)) {
    console.error(`Không tìm thấy file data tại: ${vouchersPath}`);
    return;
  }

  const rawVouchersData = JSON.parse(fs.readFileSync(vouchersPath, 'utf-8'));

  // ==========================================
  // PHẦN 1: CHUẨN BỊ DỮ LIỆU (ÉP KIỂU DATE)
  // ==========================================
  if (rawVouchersData.length > 0) {
    const vouchersToInsert = rawVouchersData.map((v: any) => ({
      code: v.code,
      type: v.type,
      value: v.value,
      minOrderVal: v.minOrderVal,
      usageLimit: v.usageLimit,
      isActive: v.isActive,
      // Chuyển đổi chuỗi ISO sang đối tượng Date để Prisma nhận diện đúng DateTime
      startDate: new Date(v.startDate),
      endDate: new Date(v.endDate),
    }));

    // ==========================================
    // PHẦN 2: SEED BẢNG VOUCHER
    // ==========================================
    const resultVoucher = await prisma.voucher.createMany({
      data: vouchersToInsert,
      skipDuplicates: true, // Tránh lỗi nếu mã code đã tồn tại (nếu code là unique)
    });

    console.log(`Đã seed thành công ${resultVoucher.count} Voucher!`);
  } else {
    console.log('Không có dữ liệu Voucher để seed.');
    return;
  }
}

main()
  .catch((e) => {
    console.error('Có lỗi xảy ra trong quá trình seed Voucher:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });