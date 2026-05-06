import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Bắt đầu seed giỏ hàng (Truy vấn thủ công - No Relations)...");

  // 1. Lấy dữ liệu thô từ các bảng
  const users = await prisma.user.findMany();
  const products = await prisma.product.findMany();
  const variants = await prisma.variant.findMany();
  const configs = await prisma.productOptionConfig.findMany();
  const optionItems = await prisma.optionItem.findMany();

  if (users.length === 0 || products.length === 0) {
    console.error("❌ Thiếu dữ liệu User hoặc Product trong DB.");
    return;
  }

  for (const user of users) {
    // 2. Tạo hoặc lấy Cart cho User (Dùng userId)
    let cart = await prisma.cart.findUnique({
      where: { userId: user.id }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: user.id,
          totalItem: 0
        }
      });
    }

    // 3. Quyết định số lượng món đồ ngẫu nhiên cho User này
    const itemCount = Math.floor(Math.random() * 9); // Từ 0 đến 4 món
    console.log(`🛒 User: ${user.fullName} | Số món: ${itemCount}`);

    if (itemCount === 0) continue;

    for (let i = 0; i < itemCount; i++) {
      // Chọn Product ngẫu nhiên
      const product = products[Math.floor(Math.random() * products.length)];

      // Tìm các Variant thuộc Product này (Lọc thủ công bằng productId)
      const productVariants = variants.filter(v => v.productId === product.id);
      const variant = productVariants.length > 0 
        ? productVariants[Math.floor(Math.random() * productVariants.length)] 
        : null;

      const quantity = Math.floor(Math.random() * 3) + 1;

      // 4. Tạo CartItem
      const cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          variantId: variant?.id || null,
          quantity: quantity,
          note: "Seed data - No Relation"
        }
      });

      // 5. Xử lý CartItemOption (Dựa trên ProductOptionConfig)
      // Tìm các config của Product này
      const productConfigs = configs.filter(c => c.productId === product.id);
      
      for (const config of productConfigs) {
        // Tìm các OptionItem thuộc GroupId trong config[cite: 1]
        const validOptions = optionItems.filter(oi => oi.groupId === config.optionGroupId);
        
        if (validOptions.length > 0 && Math.random() > 0.5) {
          const randomOption = validOptions[Math.floor(Math.random() * validOptions.length)];
          
          await prisma.cartItemOption.create({
            data: {
              cartItemId: cartItem.id,
              optionItemId: randomOption.id
            }
          });
          console.log(`   + Option: ${randomOption.name}`);
        }
      }
    }
  }

  console.log("✅ Hoàn thành seed dữ liệu giỏ hàng!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());