import { Module, Provider, Global } from "@nestjs/common";
import { RedisClient, RabbitMQClient, MongoClient } from "./components"; // Import các client mới
import { TerminusModule } from "@nestjs/terminus";
import { MongooseModule } from "@nestjs/mongoose";
import { config } from "./config";
import { 
  EVENT_PUBLISHER, 
  TOKEN_INTROSPECTOR, 
  CACHE_SERVICE, 
  MONGO_SERVICE, 
  USER_RPC,
  SHIFT_RPC,
  LOYALTY_RPC,
  CATEGORY_RPC,
  PRODUCT_RPC,
  VARIANT_RPC,
  OPTION_GROUP_RPC,
  OPTION_ITEM_RPC,
  PRODUCT_OPTION_CONFIG_RPC,
  COMBO_RPC,
  COMBO_ITEM_RPC,
  SUPPLIER_RPC,
  INGREDIENT_RPC,
  UNIT_CONVERSION_RPC,
  INVENTORY_BATCH_RPC,
  RECIPE_RPC,
  IMPORT_INVOICE_RPC,
  IMPORT_INVOICE_DETAIL_RPC,
  PURCHASE_PROPOSAL_RPC,
  PURCHASE_PROPOSAL_DETAIL_RPC,
  STOCK_CHECK_RPC,
  STOCK_CHECK_DETAIL_RPC,
  ZONE_RPC,
  TABLE_RPC,
  RESERVATION_RPC,
  CART_RPC,
  CART_ITEM_RPC,
  CART_ITEM_OPTION_RPC,
  VOUCHER_RPC,
  ORDER_RPC,
  ORDER_VOUCHER_RPC,
  ORDER_TABLE_RPC,
  ORDER_ITEM_RPC,
  ORDER_ITEM_OPTION_RPC,
  PAYMENT_TRANSACTION_RPC,
  INVOICE_RPC,
  IMAGE_RPC
} from "./di-token";
import { TokenIntrospectorRPCClient } from "./rpc/token-introspect.rpc";
import { UserRPCClient } from "./rpc/user.rpc";
import { ShiftRPCClient } from "./rpc/shift.rpc";
import { LoyaltyRPCClient } from "./rpc/loyalty.rpc";
import { CategoryRPCClient } from "./rpc/category.rpc";
import { ProductRPCClient } from "./rpc/product.rpc";
import { VariantRPCClient } from "./rpc/variant.rpc";
import { OptionGroupRPCClient } from "./rpc/option-group.rpc";
import { OptionItemRPCClient } from "./rpc/option-item.rpc";
import { ProductOptionConfigRPCClient } from "./rpc/product-option-config.rpc";
import { ComboRPCClient } from "./rpc/combo.rpc";
import { SupplierRPCClient } from "./rpc/supplier.rpc";
import { IngredientRPCClient } from "./rpc/ingredient.rpc";
import { ComboItemRPCClient } from "./rpc/combo-item.rpc";
import { UnitConversionRPCClient } from "./rpc/unit-conversion.rpc";
import { InventoryBatchRPCClient } from "./rpc/inventory-batch.rpc";
import { RecipeRPCClient } from "./rpc/recipe.rpc";
import { ImportInvoiceRPCClient } from "./rpc/import-invoice.rpc";
import { ImportInvoiceDetailRPCClient } from "./rpc/import-invoice-detail.rpc";
import { PurchaseProposalRPCClient } from "./rpc/purchase-proposal.rpc";
import { PurchaseProposalDetailRPCClient } from "./rpc/purchase-proposal-detail.rpc";
import { StockCheckRPCClient } from "./rpc/stock-check.rpc";
import { StockCheckDetailRPCClient } from "./rpc/stock-check-detail.rpc";
import { ZoneRPCClient } from "./rpc/zone.rpc"; 
import { TableRPCClient } from "./rpc/table.rpc";
import { ReservationRPCClient } from "./rpc/reservation.rpc";
import { CartRPCClient } from "./rpc/cart.rpc";
import { CartItemRPCClient } from "./rpc/cart-item.rpc";
import { CartItemOptionRPCClient } from "./rpc/cart-item-option.rpc";
import { VoucherRPCClient } from "./rpc/voucher.rpc";
import { OrderRPCClient } from "./rpc/order.rpc";
import { OrderVoucherRPCClient } from "./rpc/order-voucher.rpc";
import { OrderTableRPCClient } from "./rpc/order-table.rpc";
import { OrderItemRPCClient } from "./rpc/order-item.rpc";
import { OrderItemOptionRPCClient } from "./rpc/order-item-option.rpc";
import { PaymentTransactionRPCClient } from "./rpc/payment-transaction.rpc";
import { InvoiceRPCClient } from "./rpc/invoice.rpc";
import { ImageRPCClient } from "./rpc/image.rpc";

// Khởi tạo provider cho việc kiểm tra token
const tokenRPCClient = new TokenIntrospectorRPCClient(config.rpc.introspectUrl);
const tokenIntrospector: Provider = {
  provide: TOKEN_INTROSPECTOR,
  useValue: tokenRPCClient,
};

// Định nghĩa provider cho RabbitMQ, Redis và MongoDB
const rabbitMQProvider: Provider = {
  provide: EVENT_PUBLISHER, 
  useFactory: async () => {
    // Khởi tạo Singleton RabbitMQ
    await RabbitMQClient.init(config.rabbitmq.url); 
    return RabbitMQClient.getInstance();
  }
};

const redisProvider: Provider = {
  provide: CACHE_SERVICE, 
  useFactory: async () => {
    // Khởi tạo Singleton Redis
    const redisClient = new RedisClient();
    return redisClient;
  }
};

const mongoProvider: Provider = {
  provide: MONGO_SERVICE,
  useFactory: async () => {
    await MongoClient.init(config.mongo.uri);
    return MongoClient.getInstance();
  }
};

// Khởi tạo các RPC
// Khởi tạo client cho việc giao tiếp với user service
const userRPCClient = new UserRPCClient(config.rpc.userServiceUrl);
const userRPC: Provider = {
  provide: USER_RPC,
  useValue: userRPCClient,
};

// Khởi tạo client cho việc. giao tiếp với shift service
const shiftRPCClient = new ShiftRPCClient(config.rpc.shiftServiceUrl);
const shiftRPC: Provider = {
  provide: SHIFT_RPC,
  useValue: shiftRPCClient,
};

// Khởi tạo client cho việc giao tiếp với loyalty service
const loyaltyRPCClient = new LoyaltyRPCClient(config.rpc.loyaltyServiceUrl);
const loyaltyRPC: Provider = {
  provide: LOYALTY_RPC,
  useValue: loyaltyRPCClient,
};

// Khởi tạo client cho việc giao tiếp với category service
const categoryRPCClient = new CategoryRPCClient(config.rpc.categoryServiceUrl);
const categoryRPC: Provider = {
  provide: CATEGORY_RPC,
  useValue: categoryRPCClient,
};

// Khởi tạo client cho việc giao tiếp với product service
const productRPCClient = new ProductRPCClient(config.rpc.productServiceUrl);
const productRPC: Provider = {
  provide: PRODUCT_RPC,
  useValue: productRPCClient,
};

// Khởi tạo client cho việc giao tiếp với variant service
const variantRPCClient = new VariantRPCClient(config.rpc.variantServiceUrl);
const variantRPC: Provider = {
  provide: VARIANT_RPC,
  useValue: variantRPCClient,
};

// Khởi tạo client cho việc giao tiếp với option group service
const optionGroupRPCClient = new OptionGroupRPCClient(config.rpc.optionGroupServiceUrl);
const optionGroupRPC: Provider = {
  provide: OPTION_GROUP_RPC,
  useValue: optionGroupRPCClient,
};

// Khởi tạo client cho việc giao tiếp với option item service
const optionGroupItemRPCClient = new OptionItemRPCClient(config.rpc.optionItemServiceUrl);
const optionGroupItemRPC: Provider = {
  provide: OPTION_ITEM_RPC,
  useValue: optionGroupItemRPCClient,
};

// Khởi tạo client cho việc giao tiếp với product option config service
const productOptionConfigRPCClient = new ProductOptionConfigRPCClient(config.rpc.productOptionConfigServiceUrl);  
const productOptionConfigRPC: Provider = {
  provide: PRODUCT_OPTION_CONFIG_RPC,
  useValue: productOptionConfigRPCClient,
};

// Khởi tạo client cho việc giao tiếp với combo service
const comboRPCClient = new ComboRPCClient(config.rpc.comboServiceUrl);
const comboRPC: Provider = {
  provide: COMBO_RPC,
  useValue: comboRPCClient,
};

// Khởi tạo client cho việc giao tiếp với combo item service
const comboItemRPCClient = new ComboItemRPCClient(config.rpc.comboItemServiceUrl);
const comboItemRPC: Provider = {
  provide: COMBO_ITEM_RPC,
  useValue: comboItemRPCClient,
};

// Khởi tạo client cho việc giao tiếp với supplier service
const supplierRPCClient = new SupplierRPCClient(config.rpc.supplierServiceUrl);
const supplierRPC: Provider = {
  provide: SUPPLIER_RPC,
  useValue: supplierRPCClient,
};

// Khởi tạo client cho việc giao tiếp với ingrendient service
const ingredientRPCClient = new IngredientRPCClient(config.rpc.ingredientServiceUrl);
const ingredientRPC: Provider = {
  provide: INGREDIENT_RPC,
  useValue: ingredientRPCClient,
};

// Khởi tạo client cho việc giao tiếp với unit conversion service
const unitConversionRPCClient = new UnitConversionRPCClient(config.rpc.unitConversionServiceUrl);
const unitConversionRPC: Provider = {
  provide: UNIT_CONVERSION_RPC,
  useValue: unitConversionRPCClient,
};

// Khởi tạo client cho việc giao tiếp với inventory batch service
const inventoryRPCClient = new InventoryBatchRPCClient(config.rpc.inventoryBatchServiceUrl);
const inventoryRPC: Provider = {
  provide: INVENTORY_BATCH_RPC,
  useValue: inventoryRPCClient,
};

// Khởi tạo client cho việc giao tiếp với recipe service
const recipeRPCClient = new RecipeRPCClient(config.rpc.recipeServiceUrl);
const recipeRPC: Provider = {
  provide: RECIPE_RPC,
  useValue: recipeRPCClient,
};

// Khởi tạo client cho việc giao tiếp với import invoice service
const importInvoiceRPCClient = new ImportInvoiceRPCClient(config.rpc.importInvoiceServiceUrl);
const importInvoiceRPC: Provider = {
  provide: IMPORT_INVOICE_RPC,
  useValue: importInvoiceRPCClient,
};

// Khởi tạo client cho việc giao tiếp với import invoice detail service
const importInvoiceDetailRPCClient = new ImportInvoiceDetailRPCClient(config.rpc.importInvoiceDetailServiceUrl);
const importInvoiceDetailRPC: Provider = {
  provide: IMPORT_INVOICE_DETAIL_RPC,
  useValue: importInvoiceDetailRPCClient,
};

// Khởi tạo client cho việc giao tiếp với purchase proposal service
const purchaseProposalRPCClient = new PurchaseProposalRPCClient(config.rpc.purchaseProposalServiceUrl);
const purchaseProposalRPC: Provider = {
  provide: PURCHASE_PROPOSAL_RPC,
  useValue: purchaseProposalRPCClient,
};

// Khởi tạo client cho việc giao tiếp với purchase proposal detail service
const purchaseProposalDetailRPCClient = new PurchaseProposalDetailRPCClient(config.rpc.purchaseProposalDetailServiceUrl);
const purchaseProposalDetailRPC: Provider = {
  provide: PURCHASE_PROPOSAL_DETAIL_RPC,
  useValue: purchaseProposalDetailRPCClient,
};

// Khởi tạo client cho việc giao tiếp với stock check service
const stockCheckRPCClient = new StockCheckRPCClient(config.rpc.stockCheckServiceUrl);
const stockCheckRPC: Provider = {
  provide: STOCK_CHECK_RPC,
  useValue: stockCheckRPCClient,
};

// Khởi tạo client cho việc giao tiếp với stock check detail service
const stockCheckDetailRPCClient = new StockCheckDetailRPCClient(config.rpc.stockCheckDetailServiceUrl);
const stockCheckDetailRPC: Provider = {
  provide: STOCK_CHECK_DETAIL_RPC,
  useValue: stockCheckDetailRPCClient,
};

// Khởi tạo client cho việc giao tiếp với zone service
const zoneRPCClient = new ZoneRPCClient(config.rpc.zoneServiceUrl);
const zoneRPC: Provider = {
  provide: ZONE_RPC,
  useValue: zoneRPCClient,
};  

// Khởi tạo client cho việc giao tiếp với table service
const tableRPCClient = new TableRPCClient(config.rpc.tableServiceUrl);
const tableRPC: Provider = {
  provide: TABLE_RPC,
  useValue: tableRPCClient,
};

// Khởi tạo client cho việc giao tiếp với reservation service
const reservationRPCClient = new ReservationRPCClient(config.rpc.reservationServiceUrl);
const reservationRPC: Provider = {
  provide: RESERVATION_RPC,
  useValue: reservationRPCClient,
};

// Khởi tạo client cho việc giao tiếp với cart service
const cartRPCClient = new CartRPCClient(config.rpc.cartServiceUrl); 
const cartRPC: Provider = {
  provide: CART_RPC,
  useValue: cartRPCClient,
};

// Khởi tạo client cho việc giao tiếp với cart item service
const cartItemRPCClient = new CartItemRPCClient(config.rpc.cartItemServiceUrl);
const cartItemRPC: Provider = {
  provide: CART_ITEM_RPC,
  useValue: cartItemRPCClient,
};

// Khởi tạo client cho việc giao tiếp với cart item option service
const cartItemOptionRPCClient = new CartItemOptionRPCClient(config.rpc.cartItemOptionServiceUrl);
const cartItemOptionRPC: Provider = {
  provide: CART_ITEM_OPTION_RPC,
  useValue: cartItemOptionRPCClient,
};

// Khởi tạo client cho việc giao tiếp với voucher service
const voucherRPCClient = new VoucherRPCClient(config.rpc.voucherServiceUrl);
const voucherRPC: Provider = {
  provide: VOUCHER_RPC,
  useValue: voucherRPCClient,
};

// Khởi tạo client cho việc giao tiếp với order service
const orderRPCClient = new OrderRPCClient(config.rpc.orderServiceUrl);
const orderRPC: Provider = {
  provide: ORDER_RPC,
  useValue: orderRPCClient,
};

// Khởi tạo client cho việc giao tiếp với order voucher service
const orderVoucherRPCClient = new OrderVoucherRPCClient(config.rpc.orderVoucherServiceUrl);
const orderVoucherRPC: Provider = {
  provide: ORDER_VOUCHER_RPC,
  useValue: orderVoucherRPCClient,
};

// Khởi tạo client cho việc giao tiếp với order table service
const orderTableRPCClient = new OrderTableRPCClient(config.rpc.orderTableServiceUrl);
const orderTableRPC: Provider = {
  provide: ORDER_TABLE_RPC,
  useValue: orderTableRPCClient,
};

// Khởi tạo client cho việc giao tiếp với order item service
const orderItemRPCClient = new OrderItemRPCClient(config.rpc.orderItemServiceUrl);
const orderItemRPC: Provider = {
  provide: ORDER_ITEM_RPC,
  useValue: orderItemRPCClient,
};

// Khởi tạo client cho việc giao tiếp với order item option service
const orderItemOptionRPCClient = new OrderItemOptionRPCClient(config.rpc.orderItemOptionServiceUrl);
const orderItemOptionRPC: Provider = {
  provide: ORDER_ITEM_OPTION_RPC,
  useValue: orderItemOptionRPCClient,
};

// Khởi tạo client cho việc giao tiếp với payment transaction service
const paymentTransactionRPCClient = new PaymentTransactionRPCClient(config.rpc.paymentTransactionServiceUrl);
const paymentTransactionRPC: Provider = {
  provide: PAYMENT_TRANSACTION_RPC,
  useValue: paymentTransactionRPCClient,
};

// Khởi tạo client cho việc giao tiếp với invoice service
const invoiceRPCClient = new InvoiceRPCClient(config.rpc.invoiceServiceUrl);
const invoiceRPC: Provider = {
  provide: INVOICE_RPC,
  useValue: invoiceRPCClient,
};

// Khởi tạo client cho việc giao tiếp với image service
const imageRPCClient = new ImageRPCClient(config.rpc.imageServiceUrl);
const imageRPC: Provider = {
  provide: IMAGE_RPC,
  useValue: imageRPCClient,
};

@Global()
@Module({
  providers: [
    tokenIntrospector, // RPC Token Introspector
    rabbitMQProvider, // Pub/Sub
    redisProvider,    // Cache
    mongoProvider,     // NoSQL DB
    userRPC,          // RPC User Service
    shiftRPC,         // RPC Shift Service
    loyaltyRPC,       // RPC Loyalty Service
    categoryRPC,      // RPC Category Service
    productRPC,       // RPC Product Service
    variantRPC,       // RPC Variant Service
    optionGroupRPC,   // RPC Option Group Service
    optionGroupItemRPC, // RPC Option Item Service
    productOptionConfigRPC, // RPC Product Option Config Service
    comboRPC,         // RPC Combo Service
    comboItemRPC,     // RPC Combo Item Service
    supplierRPC,      // RPC Supplier Service
    ingredientRPC,     // RPC Ingredient Service
    unitConversionRPC,  // RPC Unit Conversion Service
    inventoryRPC,       // RPC Inventory Batch Service
    recipeRPC,          // RPC Recipe Service
    importInvoiceRPC,   // RPC Import Invoice Service
    importInvoiceDetailRPC, // RPC Import Invoice Detail Service
    purchaseProposalRPC,   // RPC Purchase Proposal Service
    purchaseProposalDetailRPC, // RPC Purchase Proposal Detail Service
    stockCheckRPC,         // RPC Stock Check Service
    stockCheckDetailRPC,   // RPC Stock Check Detail Service
    zoneRPC,              // RPC Zone Service
    tableRPC,             // RPC Table Service
    reservationRPC,       // RPC Reservation Service
    cartRPC,              // RPC Cart Service
    cartItemRPC,          // RPC Cart Item Service
    cartItemOptionRPC,    // RPC Cart Item Option Service
    voucherRPC,           // RPC Voucher Service
    orderRPC,             // RPC Order Service
    orderVoucherRPC,      // RPC Order Voucher Service
    orderTableRPC,        // RPC Order Table Service
    orderItemRPC,         // RPC Order Item Service
    orderItemOptionRPC,   // RPC Order Item Option Service
    paymentTransactionRPC,  // RPC Payment Transaction Service
    invoiceRPC,             // RPC Invoice Service
    imageRPC,               // RPC Image Service
  ],
  exports: [
    tokenIntrospector, // RPC Token Introspector
    rabbitMQProvider, // Pub/Sub
    redisProvider, // Cache
    mongoProvider, // NoSQL DB
    userRPC, // RPC User Service
    shiftRPC, // RPC Shift Service
    loyaltyRPC, // RPC Loyalty Service
    categoryRPC, // RPC Category Service
    productRPC, // RPC Product Service
    variantRPC, // RPC Variant Service
    optionGroupRPC, // RPC Option Group Service
    optionGroupItemRPC, // RPC Option Item Service
    productOptionConfigRPC, // RPC Product Option Config Service
    comboRPC, // RPC Combo Service
    comboItemRPC, // RPC Combo Item Service
    supplierRPC, // RPC Supplier Service
    ingredientRPC, // RPC Ingredient Service
    unitConversionRPC, // RPC Unit Conversion Service
    inventoryRPC, // RPC Inventory Batch Service
    recipeRPC, // RPC Recipe Service
    importInvoiceRPC, // RPC Import Invoice Service
    importInvoiceDetailRPC, // RPC Import Invoice Detail Service
    purchaseProposalRPC, // RPC Purchase Proposal Service
    purchaseProposalDetailRPC, // RPC Purchase Proposal Detail Service
    stockCheckRPC, // RPC Stock Check Service
    stockCheckDetailRPC, // RPC Stock Check Detail Service
    zoneRPC, // RPC Zone Service
    tableRPC, // RPC Table Service
    reservationRPC, // RPC Reservation Service
    cartRPC, // RPC Cart Service
    cartItemRPC, // RPC Cart Item Service
    cartItemOptionRPC, // RPC Cart Item Option Service
    voucherRPC, // RPC Voucher Service
    orderRPC, // RPC Order Service
    orderVoucherRPC, // RPC Order Voucher Service
    orderTableRPC, // RPC Order Table Service
    orderItemRPC, // RPC Order Item Service
    orderItemOptionRPC, // RPC Order Item Option Service
    paymentTransactionRPC, // RPC Payment Transaction Service
    invoiceRPC, // RPC Invoice Service
    imageRPC, // RPC Image Service
  ]
})
export class ShareModule { }
