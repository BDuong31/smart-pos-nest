import { PrismaClient, OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { subDays, isWeekend, isSameDay } from "date-fns";
import { v4 as uuidv4 } from "uuid"; // Cài: pnpm add uuid

const prisma = new PrismaClient();

const HOLIDAYS = [
  new Date("2026-04-30"),
  new Date("2026-05-01"),
  new Date("2026-01-01"),
];

async function main() {
  console.log("🚀 Bắt đầu Robust Seed (No Transaction) cho 150 ngày...");

  const [users, products, variants, configs, optionItems, tables] = await Promise.all([
    prisma.user.findMany(),
    prisma.product.findMany(),
    prisma.variant.findMany(),
    prisma.productOptionConfig.findMany(),
    prisma.optionItem.findMany(),
    prisma.table.findMany(),
  ]);

  for (let i = 149; i >= 0; i--) {
    const currentDate = subDays(new Date(), i);
    const isHoliday = HOLIDAYS.some(h => isSameDay(h, currentDate));
    const isSatSun = isWeekend(currentDate);

    let ordersCount = Math.floor(Math.random() * 8) + 5; // 5-13 đơn cho ngày thường
    if (isHoliday) ordersCount = Math.floor(Math.random() * 15) + 35; // 35-50 đơn ngày lễ
    else if (isSatSun) ordersCount = Math.floor(Math.random() * 10) + 20; // 20-30 đơn ngày cuối tuần

    console.log(`📅 Đang đẩy dữ liệu: ${currentDate.toISOString().split('T')[0]} | ${ordersCount} đơn...`);

    // Mảng chứa dữ liệu của ngày hôm đó
    const ordersBatch: any[] = [];
    const itemsBatch: any[] = [];
    const optionsBatch: any[] = [];
    const paymentsBatch: any[] = [];
    const orderTablesBatch: any[] = [];

    for (let j = 0; j < ordersCount; j++) {
      const orderId = uuidv4();
      const user = users[Math.floor(Math.random() * users.length)];
      let orderTotal = 0;

      // 1. Chuẩn bị Order
      ordersBatch.push({
        id: orderId,
        code: `ORD-${Date.now()}-${j}-${i}`,
        userId: user.id,
        totalAmount: 0, // Sẽ update sau khi tính xong
        status: OrderStatus.completed,
        createdAt: currentDate,
      });

      // 2. Chuẩn bị Items & Options
      const itemsCount = Math.floor(Math.random() * 3) + 1;
      for (let k = 0; k < itemsCount; k++) {
        const orderItemId = uuidv4();
        const product = products[Math.floor(Math.random() * products.length)];
        const productVariants = variants.filter(v => v.productId === product.id);
        const variant = productVariants.length > 0 ? productVariants[Math.floor(Math.random() * productVariants.length)] : null;
        
        const price = product.basePrice + (variant?.priceDiff || 0);
        const quantity = Math.floor(Math.random() * 2) + 1;

        itemsBatch.push({
          id: orderItemId,
          orderId: orderId,
          productId: product.id,
          variantId: variant?.id || null,
          productName: product.name,
          price: price,
          quantity: quantity,
          createdAt: currentDate,
        });

        let itemOptionExtra = 0;
        const allowedConfigs = configs.filter(c => c.productId === product.id);
        for (const conf of allowedConfigs) {
          const opts = optionItems.filter(oi => oi.groupId === conf.optionGroupId);
          if (opts.length > 0 && Math.random() > 0.5) {
            const opt = opts[Math.floor(Math.random() * opts.length)];
            optionsBatch.push({
              orderItemId: orderItemId,
              optionItemId: opt.id,
              optionName: opt.name,
              price: opt.priceExtra,
              createdAt: currentDate,
            });
            itemOptionExtra += opt.priceExtra;
          }
        }
        orderTotal += (price + itemOptionExtra) * quantity;
      }

      // Cập nhật lại tiền trong mảng
      const currentOrder = ordersBatch.find(o => o.id === orderId);
      if (currentOrder) currentOrder.totalAmount = orderTotal;

      // 3. Chuẩn bị Payment & Table
      paymentsBatch.push({
        orderId: orderId,
        amount: orderTotal,
        method: PaymentMethod.cash,
        status: PaymentStatus.success,
        paidAt: currentDate,
        createdAt: currentDate,
      });

      if (tables.length > 0) {
        orderTablesBatch.push({
          orderId: orderId,
          tableId: tables[Math.floor(Math.random() * tables.length)].id,
          createdAt: currentDate,
        });
      }
    }

    // Đẩy tất cả dữ liệu của 1 ngày lên bằng createMany (Cực nhanh và không bị timeout)
    await prisma.order.createMany({ data: ordersBatch });
    await prisma.orderItem.createMany({ data: itemsBatch });
    if (optionsBatch.length > 0) await prisma.orderItemOption.createMany({ data: optionsBatch });
    await prisma.paymentTransaction.createMany({ data: paymentsBatch });
    if (orderTablesBatch.length > 0) await prisma.orderTable.createMany({ data: orderTablesBatch });
  }

  console.log("🏁 Hoàn thành Seed 150 ngày mà không lỗi Transaction!");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());