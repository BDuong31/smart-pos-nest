import { Prisma, PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu quá trình seed Zone...');

  // 1. Đọc dữ liệu từ file JSON
  const zonesPath = path.join(__dirname, '../data/zone.json');
  
  // Kiểm tra file tồn tại trước khi đọc để tránh lỗi sập app
  if (!fs.existsSync(zonesPath)) {
    console.error(`Không tìm thấy file data tại: ${zonesPath}`);
    return;
  }

  const zonesData = JSON.parse(fs.readFileSync(zonesPath, 'utf-8'));

  // ==========================================
  // PHẦN 1: SEED BẢNG ZONE
  // ==========================================
  if (zonesData.length > 0) {
    const resultZone = await prisma.zone.createMany({
      data: zonesData,
      skipDuplicates: true, // Bỏ qua nếu đã tồn tại (nếu schema có set @unique cho name)
    });
    console.log(`Đã seed thành công ${resultZone.count} Zone!`);
  } else {
    console.log('Không có dữ liệu Zone để seed.');
    return;
  }
}

main()
  .catch((e) => {
    console.error('Có lỗi xảy ra trong quá trình seed Zone:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });