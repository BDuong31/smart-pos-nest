import dotenv from 'dotenv';

dotenv.config({
  // path: process.env.NODE_ENV === 'production' ? '.env' : `.env.${process.env.NODE_ENV}`,
});

const port = process.env.PORT || '5000'; // Cổng mặc định nếu không có biến môi trường PORT

export const config = {
  envName: process.env.NODE_ENV, // Tên môi trường (development, production, test)
  port, // Cổng ứng dụng

  accessJwtSecret: process.env.ACCESS_JWT_SECRET || 'baso_smart_pos_secret_key', // Bí mật JWT cho access token
  refreshJwtSecret:
    process.env.REFRESH_JWT_SECRET || 'baso_smart_pos_refresh_secret_key', // Bí mật JWT cho refresh token

  // Cấu hình giao tiếp
  rpc: {
    accessJwtSecret:
      process.env.ACCESS_JWT_SECRET || 'baso_smart_pos_secret_key', // Bí mật JWT cho RPC access token
    refreshJwtSecret:
      process.env.REFRESH_JWT_SECRET || 'baso_smart_pos_refresh_secret_key', // Bí mật JWT cho RPC refresh token
    introspectUrl:
      process.env.VERIFY_TOKEN_URL ||
      `http://localhost:${port}/v1/rpc/auth/introspect`, // URL để introspect token
    userServiceUrl:
      process.env.USER_SERVICE_URL || `http://localhost:${port}/v1`, // URL của User Service RPC
    shiftServiceUrl:
      process.env.SHIFT_SERVICE_URL || `http://localhost:${port}/v1`, // URL của Shift Service RPC
    loyaltyServiceUrl:
      process.env.LOYALTY_SERVICE_URL || `http://localhost:${port}/v1`, // URL của Loyalty Service RPC
    categoryServiceUrl:
      process.env.CATEGORY_SERVICE_URL || `http://localhost:${port}/v1`, // URL của Category Service RPC
    productServiceUrl:
      process.env.PRODUCT_SERVICE_URL || `http://localhost:${port}/v1`, // URL của Product Service RPC
    variantServiceUrl:
      process.env.VARIANT_SERVICE_URL || `http://localhost:${port}/v1`, // URL của Variant Service RPC
    optionGroupServiceUrl:
      process.env.OPTION_GROUP_SERVICE_URL || `http://localhost:${port}/v1`, // URL của Option Group Service RPC
    optionItemServiceUrl:
      process.env.OPTION_ITEM_SERVICE_URL || `http://localhost:${port}/v1`, // URL của Option Item Service RPC
    productOptionConfigServiceUrl:
      process.env.PRODUCT_OPTION_CONFIG_SERVICE_URL ||
      `http://localhost:${port}/v1`, // URL của Product Option Config Service RPC
    comboServiceUrl:
      process.env.COMBO_SERVICE_URL || `http://localhost:${port}/v1`, // URL của Combo Service RPC
    comboItemServiceUrl:
      process.env.COMBO_ITEM_SERVICE_URL || `http://localhost:${port}/v1`, // URL của Combo Item Service RPC
    supplierServiceUrl:
      process.env.SUPPLIER_SERVICE_URL || `http://localhost:${port}/v1`, // URL của Supplier Service RPC
    ingredientServiceUrl:
      process.env.INGREDIENT_SERVICE_URL || `http://localhost:${port}/v1`, // URL của Ingredient Service RPC
    unitConversionServiceUrl:
      process.env.UNIT_CONVERSION_SERVICE_URL || `http://localhost:${port}/v1`, // URL của Unit Conversion Service RPC
    inventoryBatchServiceUrl:
      process.env.INVENTORY_BATCH_SERVICE_URL || `http://localhost:${port}/v1`, // URL của Inventory Batch Service RPC
    recipeServiceUrl:
      process.env.RECIPE_SERVICE_URL || `http://localhost:${port}/v1`, // URL của Recipe Service RPC
    importInvoiceServiceUrl:
      process.env.IMPORT_INVOICE_SERVICE_URL || `http://localhost:${port}/v1`, // URL của Import Invoice Service RPC
    importInvoiceDetailServiceUrl:
      process.env.IMPORT_INVOICE_DETAIL_SERVICE_URL ||
      `http://localhost:${port}/v1`, // URL của Import Invoice Detail Service RPC
    purchaseProposalServiceUrl:
      process.env.PURCHASE_PROPOSAL_SERVICE_URL ||
      `http://localhost:${port}/v1`, // URL của Purchase Proposal Service RPC
    purchaseProposalDetailServiceUrl:
      process.env.PURCHASE_PROPOSAL_DETAIL_SERVICE_URL ||
      `http://localhost:${port}/v1`, // URL của Purchase Proposal Detail Service RPC
    stockCheckServiceUrl:
      process.env.STOCK_CHECK_SERVICE_URL || `http://localhost:${port}/v1`, // URL của Stock Check Service RPC
    stockCheckDetailServiceUrl:
      process.env.STOCK_CHECK_DETAIL_SERVICE_URL ||
      `http://localhost:${port}/v1`, // URL của Stock Check Detail Service RPC
    zoneServiceUrl:
      process.env.ZONE_SERVICE_URL || `http://localhost:${port}/v1`, // URL của Zone Service RPC
    tableServiceUrl:
      process.env.TABLE_SERVICE_URL || `http://localhost:${port}/v1`, // URL của Table Service RPC
    reservationServiceUrl:
      process.env.RESERVATION_SERVICE_URL || `http://localhost:${port}/v1`, // URL của Reservation Service RPC
    cartServiceUrl:
      process.env.CART_SERVICE_URL || `http://localhost:${port}/v1`, // URL của Cart Service RPC
    cartItemServiceUrl:
      process.env.CART_ITEM_SERVICE_URL || `http://localhost:${port}/v1`, // URL của Cart Item Service RPC
    cartItemOptionServiceUrl:
      process.env.CART_ITEM_OPTION_SERVICE_URL || `http://localhost:${port}/v1`, // URL của Cart Item Option Service RPC
    voucherServiceUrl:
      process.env.VOUCHER_SERVICE_URL || `http://localhost:${port}/v1`, // URL của Voucher Service RPC
    orderServiceUrl:
      process.env.ORDER_SERVICE_URL || `http://localhost:${port}/v1`, // URL của Order Service RPC
    orderVoucherServiceUrl:
      process.env.ORDER_VOUCHER_SERVICE_URL || `http://localhost:${port}/v1`, // URL của Order Voucher Service RPC
    orderTableServiceUrl:
      process.env.ORDER_TABLE_SERVICE_URL || `http://localhost:${port}/v1`, // URL của Order Table Service RPC
    orderItemServiceUrl:
      process.env.ORDER_ITEM_SERVICE_URL || `http://localhost:${port}/v1`, // URL của Order Item Service RPC
    orderItemOptionServiceUrl:
      process.env.ORDER_ITEM_OPTION_SERVICE_URL ||
      `http://localhost:${port}/v1`, // URL của Order Item Option Service RPC
    paymentTransactionServiceUrl:
      process.env.PAYMENT_TRANSACTION_SERVICE_URL ||
      `http://localhost:${port}/v1`, // URL của Payment Transaction Service RPC
    invoiceServiceUrl:
      process.env.INVOICE_SERVICE_URL || `http://localhost:${port}/v1`, // URL của Invoice Service RPC
    imageServiceUrl:
      process.env.IMAGE_SERVICE_URL || `http://localhost:${port}/v1`, // URL của Image Service RPC
  },

  // Cấu hình redis
  redis: {
    host: process.env.REDIS_HOST || 'redis-baso', // Địa chỉ host của Redis
    port: parseInt(process.env.REDIS_PORT || '6379'), // Cổng của Redis
    user: process.env.REDIS_USER || 'default', // Tên người dùng Redis (nếu có)
    password: process.env.REDIS_PASSWORD || '', // Mật khẩu Redis (nếu có)
    url: process.env.REDIS_URL || 'redis://:baso_redis@localhost:6379', // URL kết nối Redis (nếu có) - định dạng: redis://:password@host:port
  },

  // Cấu hình cơ sở dữ liệu
  db: {
    name: process.env.DATABASE_NAME || 'postgres', // Tên cơ sở dữ liệu
    user: process.env.DATABASE_USER || 'postgres', // Tên người dùng cơ sở dữ liệu
    password: process.env.DATABASE_PASSWORD || 'password', // Mật khẩu cơ sở dữ liệu
    host: process.env.DATABASE_HOST || 'localhost', // Địa chỉ host của cơ sở dữ liệu
    port: parseInt(process.env.DATABASE_PORT || '5432'), // Cổng của cơ sở dữ liệu
    url:
      process.env.DIRECT_URL ||
      'postgresql://postgres:password@localhost:5432/postgres', // URL kết nối cơ sở dữ liệu
  },

  // Cấu hình mongodb
  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/smart-pos', // URI kết nối MongoDB
  },

  // Cấu hình RabbitMQ
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672', // URL kết nối RabbitMQ
  },
};
