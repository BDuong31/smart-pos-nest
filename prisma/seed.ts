import { PrismaClient, Prisma } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { v7 as uuidv7 } from 'uuid';

const prisma = new PrismaClient();

// ==============================
// HELPER
// ==============================
function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

function isWeekend(date: Date) {
  return [0, 6].includes(date.getDay());
}

function isHoliday(date: Date) {
  const d = date.getDate();
  const m = date.getMonth() + 1;
  return (m === 1 && d <= 5) || (m === 4 && d === 30) || (m === 9 && d === 2);
}

function getMultiplier(date: Date) {
  if (isHoliday(date)) return 2.5;
  if (isWeekend(date)) return 1.5;
  return 1;
}

function getPeakHour() {
  const r = Math.random();
  if (r < 0.3) return faker.number.int({ min: 7, max: 9 });
  if (r < 0.7) return faker.number.int({ min: 11, max: 13 });
  return faker.number.int({ min: 17, max: 21 });
}

// ==============================
// MAIN
// ==============================
async function main() {
  console.log('START SEED');

  // =========================
  // USERS
  // =========================
  const users: { id: string }[] = [];

  for (let i = 0; i < 20; i++) {
    const id = uuidv7();

    users.push({ id });

    await prisma.user.create({
      data: {
        id,
        username: `user${i}`,
        email: `user${i}@mail.com`,
        salt: 'salt',
        password: 'hashed',
        fullName: faker.person.fullName(),
        birthday: faker.date.birthdate(),
        role: 'customer',
        currentPoints: faker.number.int({ min: 0, max: 1000 }),
        status: 'active',
      },
    });
  }

  // =========================
  // CATEGORY
  // =========================
  const categoryIds: string[] = [];

  for (let i = 0; i < 5; i++) {
    const id = uuidv7();
    categoryIds.push(id);

    await prisma.category.create({
      data: { id, name: `Category ${i}` },
    });
  }

  // =========================
  // PRODUCT + VARIANT
  // =========================
  const productIds: string[] = [];
  const variantMap = new Map<string, string[]>();

  for (let i = 0; i < 20; i++) {
    const productId = uuidv7();
    productIds.push(productId);

    await prisma.product.create({
      data: {
        id: productId,
        name: faker.commerce.productName(),
        categoryId: faker.helpers.arrayElement(categoryIds),
        basePrice: faker.number.int({ min: 20000, max: 80000 }),
      },
    });

    const variants: string[] = [];

    for (let v = 0; v < 3; v++) {
      const variantId = uuidv7();
      variants.push(variantId);

      await prisma.variant.create({
        data: {
          id: variantId,
          productId,
          name: ['S', 'M', 'L'][v],
          priceDiff: v * 5000,
        },
      });
    }

    variantMap.set(productId, variants);
  }

  // =========================
  // OPTION
  // =========================
  const groupId = uuidv7();
  await prisma.optionGroup.create({
    data: { id: groupId, name: 'Topping', isMultiSelect: true },
  });

  const optionItemIds: string[] = [];

  for (let i = 0; i < 5; i++) {
    const id = uuidv7();
    optionItemIds.push(id);

    await prisma.optionItem.create({
      data: {
        id,
        groupId,
        name: faker.commerce.productAdjective(),
        priceExtra: faker.number.int({ min: 2000, max: 10000 }),
      },
    });
  }

  // =========================
  // INGREDIENT + RECIPE
  // =========================
  const ingredientIds: string[] = [];

  for (let i = 0; i < 10; i++) {
    const id = uuidv7();
    ingredientIds.push(id);

    await prisma.ingredient.create({
      data: {
        id,
        name: faker.commerce.productMaterial(),
        baseUnit: 'gram',
        minStock: 1000,
      },
    });
  }

  for (const productId of productIds) {
    for (let i = 0; i < 3; i++) {
      await prisma.recipe.create({
        data: {
          id: uuidv7(),
          productId,
          ingredientId: faker.helpers.arrayElement(ingredientIds),
          amount: faker.number.float({ min: 10, max: 50 }),
        },
      });
    }
  }

  // =========================
  // CART (CF)
  // =========================
  for (const user of users) {
    const cartId = uuidv7();

    await prisma.cart.create({
      data: {
        id: cartId,
        userId: user.id,
        totalItem: 0,
      },
    });

    const itemCount = faker.number.int({ min: 1, max: 5 });

    for (let i = 0; i < itemCount; i++) {
      const productId = faker.helpers.arrayElement(productIds);
      const variantId = faker.helpers.arrayElement(variantMap.get(productId)!);

      await prisma.cartItem.create({
        data: {
          id: uuidv7(),
          cartId,
          productId,
          variantId,
          quantity: faker.number.int({ min: 1, max: 3 }),
        },
      });
    }
  }

  // =========================
  // ORDERS 120 DAYS
  // =========================
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  for (let d = 0; d < 120; d++) {
    const baseDate = new Date(startDate);
    baseDate.setDate(startDate.getDate() - d);

    const multiplier = getMultiplier(baseDate);

    const ordersCount = Math.floor(
      faker.number.int({ min: 10, max: 40 }) * multiplier,
    );

    const orderBatch: Prisma.OrderCreateManyInput[] = [];
    const itemBatch: Prisma.OrderItemCreateManyInput[] = [];
    const optionBatch: Prisma.OrderItemOptionCreateManyInput[] = [];
    const paymentBatch: Prisma.PaymentTransactionCreateManyInput[] = [];

    for (let i = 0; i < ordersCount; i++) {
      const orderId = uuidv7();
      const user = faker.helpers.arrayElement(users);

      const createdAt = new Date(baseDate);
      createdAt.setHours(getPeakHour());
      createdAt.setMinutes(faker.number.int({ min: 0, max: 59 }));

      let total = 0;

      const itemCount = faker.number.int({ min: 1, max: 4 });

      for (let j = 0; j < itemCount; j++) {
        const productId = faker.helpers.arrayElement(productIds);
        const variantId = faker.helpers.arrayElement(
          variantMap.get(productId)!,
        );

        const price = faker.number.int({ min: 20000, max: 80000 });
        const qty = faker.number.int({ min: 1, max: 3 });

        total += price * qty;

        const orderItemId = uuidv7();

        itemBatch.push({
          id: orderItemId,
          orderId,
          productId,
          variantId,
          productName: `Product-${productId.slice(0, 5)}`,
          price,
          quantity: qty,
          createdAt,
          updatedAt: createdAt,
        });

        if (Math.random() > 0.5) {
          optionBatch.push({
            id: uuidv7(),
            orderItemId,
            optionItemId: faker.helpers.arrayElement(optionItemIds),
            optionName: 'Extra',
            price: 5000,
          });
        }
      }

      orderBatch.push({
        id: orderId,
        code: `ORD-${faker.string.alphanumeric(8).toUpperCase()}`,
        userId: user.id,
        totalAmount: total,
        status: 'completed',
        createdAt,
        updatedAt: createdAt,
      });

      paymentBatch.push({
        id: uuidv7(),
        orderId,
        amount: total,
        method: 'cash',
        status: 'success',
        paidAt: createdAt,
      });
    }

    // 🔥 insert đúng thứ tự
    await prisma.order.createMany({ data: orderBatch });
    await prisma.orderItem.createMany({ data: itemBatch });
    await prisma.orderItemOption.createMany({ data: optionBatch });
    await prisma.paymentTransaction.createMany({ data: paymentBatch });

    if (d % 10 === 0) {
      console.log(`✔️ Day ${d}`);
      await sleep(100);
    }
  }

  console.log('DONE SEED');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
