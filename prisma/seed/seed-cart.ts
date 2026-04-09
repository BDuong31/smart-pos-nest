import { Prisma, PrismaClient } from '@prisma/client';
import { v7 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('Bắt đầu quá trình seed Cart cho User...');

  // 1. Lấy danh sách tất cả User hiện có trong Database
  const users = await prisma.user.findMany();

  if (users.length === 0) {
    console.log('Không có User nào trong database để tạo Cart.');
    return;
  }

  // 2. Lấy danh sách Cart hiện có để đối chiếu (tránh 1 User bị tạo 2 Cart)
  const existingCarts = await prisma.cart.findMany();
  const existingUserIdsWithCart = new Set(existingCarts.map((c) => c.userId));

  const cartsToInsert: Prisma.CartCreateInput[] = [];

  // 3. Chuẩn bị dữ liệu Cart mới
  for (const user of users) {
    // Chỉ tạo Cart cho những User chưa có
    if (!existingUserIdsWithCart.has(user.id)) {
      cartsToInsert.push({
        id: v7(), // Khởi tạo UUID v7
        userId: user.id,
        totalItem: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  // 4. Insert dữ liệu vào Database
  if (cartsToInsert.length > 0) {
    const result = await prisma.cart.createMany({
      data: cartsToInsert,
      skipDuplicates: true, // Đảm bảo an toàn nếu gặp lỗi trùng khoá chính
    });
    console.log(`Đã seed thành công ${result.count} Cart mới cho các User!`);
  } else {
    console.log('Tất cả User trong hệ thống đều đã có Cart. Không cần tạo thêm.');
  }
}

main()
  .catch((e) => {
    console.error('Có lỗi xảy ra trong quá trình seed Cart:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });