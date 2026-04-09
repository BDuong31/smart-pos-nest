import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu quá trình seed bảng Supplier (Nhà cung cấp)...');

  // 1. Đọc file JSON suppliers
  // Hãy đảm bảo bạn đã lưu file suppliers.json trong thư mục data nhé
  const filePath = path.join(__dirname, '../data/supplier.json'); 
  const suppliersData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  if (suppliersData.length === 0) {
    console.log('File JSON trống, không có nhà cung cấp nào để seed.');
    return;
  }

  // 2. Insert dữ liệu vào Database
  const result = await prisma.supplier.createMany({
    data: suppliersData,
    skipDuplicates: true, // Bỏ qua nếu nhà cung cấp đã tồn tại (nếu bạn set trường 'name' là @unique)
  });

  console.log(`Đã seed thành công ${result.count} nhà cung cấp (Supplier)!`);
}

main()
  .catch((e) => {
    console.error('Có lỗi xảy ra trong quá trình seed Supplier:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });