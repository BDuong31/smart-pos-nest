import { Prisma, PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu quá trình seed Table...');

  // 1. Đọc dữ liệu từ file JSON
  const tablesPath = path.join(__dirname, '../data/table.json');
  
  if (!fs.existsSync(tablesPath)) {
    console.error(`Không tìm thấy file data tại: ${tablesPath}`);
    return;
  }

  const rawTablesData = JSON.parse(fs.readFileSync(tablesPath, 'utf-8'));
  
  // Lọc bỏ các phần tử chỉ chứa comment (nếu có) để tránh lỗi khi map dữ liệu
  const tablesData = rawTablesData.filter((item: any) => !item.comment);

  if (tablesData.length === 0) {
    console.log('Không có dữ liệu Table để seed.');
    return;
  }

  // ==========================================
  // PHẦN 1: CHUẨN BỊ MAP ZONE ID
  // ==========================================
  console.log('Đang chuẩn bị map ID cho Zone...');
  
  // Lấy dữ liệu Zone từ DB lên để dò ID
  const dbZones = await prisma.zone.findMany();
  
  // Tạo Map để dò nhanh ID theo Tên Zone
  const zoneMap = new Map<string, string | number>();
  dbZones.forEach((z) => zoneMap.set(z.name, z.id));

  const tablesToInsert: Prisma.TableCreateManyInput[] = [];

  for (const item of tablesData) {
    // Dò tìm ID thực sự của Zone trong Database dựa vào tên truyền trong file JSON
    const actualZoneId = zoneMap.get(item.zoneId);

    if (!actualZoneId) {
      console.warn(`Bỏ qua bàn "${item.name}": Không tìm thấy Khu vực "${item.zoneId}" trong DB.`);
      continue;
    }

    tablesToInsert.push({
      zoneId: actualZoneId as string, // Nếu id của bạn là Int thì đổi thành `as number`
      name: item.name,
      qrCode: item.qrCode,
      capacity: item.capacity,
      isActive: item.isActive,
      status: item.status,
    });
  }

  // ==========================================
  // PHẦN 2: SEED BẢNG TABLE
  // ==========================================
  if (tablesToInsert.length > 0) {
    const resultTable = await prisma.table.createMany({
      data: tablesToInsert,
      skipDuplicates: true,
    });
    console.log(`Đã seed thành công ${resultTable.count} Table!`);
  } else {
    console.log('Không có dữ liệu Table hợp lệ để insert.');
  }
}

main()
  .catch((e) => {
    console.error('Có lỗi xảy ra trong quá trình seed Table:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });