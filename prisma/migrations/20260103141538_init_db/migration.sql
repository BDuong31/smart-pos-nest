-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'inactive', 'banned');

-- CreateEnum
CREATE TYPE "TableStatus" AS ENUM ('available', 'occupied', 'reserved', 'maintenance');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'confirmed', 'processing', 'served', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('cash', 'credit_card', 'bank_transfer', 'wallet');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'success', 'failed');

-- CreateEnum
CREATE TYPE "VoucherType" AS ENUM ('percentage', 'fixed_amount');

-- CreateTable
CREATE TABLE "roles" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "permissions" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_ranks" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "min_point" INTEGER NOT NULL DEFAULT 0,
    "discount_percent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_ranks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" VARCHAR(36) NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "role_id" VARCHAR(36) NOT NULL,
    "rank_id" VARCHAR(36),
    "mongo_user_id" VARCHAR(36),
    "current_points" INTEGER NOT NULL DEFAULT 0,
    "status" "UserStatus" DEFAULT 'active',
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shifts" (
    "id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(36) NOT NULL,
    "start_time" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_time" TIMESTAMP(0),
    "cash_start" DECIMAL(12,2) NOT NULL,
    "cash_end" DECIMAL(12,2),

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "point_histories" (
    "id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(36) NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "point_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "parent_id" VARCHAR(36),

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "printers" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "ip_address" VARCHAR(50) NOT NULL,

    CONSTRAINT "printers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "category_id" VARCHAR(36) NOT NULL,
    "printer_id" VARCHAR(36),
    "base_price" DECIMAL(12,2) NOT NULL,
    "is_combo" BOOLEAN DEFAULT false,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variants" (
    "id" VARCHAR(36) NOT NULL,
    "product_id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "price_diff" DECIMAL(12,2) NOT NULL DEFAULT 0,

    CONSTRAINT "variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "option_groups" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "is_multi_select" BOOLEAN DEFAULT false,

    CONSTRAINT "option_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "option_items" (
    "id" VARCHAR(36) NOT NULL,
    "group_id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "price_extra" DECIMAL(12,2) NOT NULL DEFAULT 0,

    CONSTRAINT "option_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_option_configs" (
    "product_id" VARCHAR(36) NOT NULL,
    "option_group_id" VARCHAR(36) NOT NULL,

    CONSTRAINT "product_option_configs_pkey" PRIMARY KEY ("product_id","option_group_id")
);

-- CreateTable
CREATE TABLE "combo_items" (
    "combo_id" VARCHAR(36) NOT NULL,
    "product_id" VARCHAR(36) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "combo_items_pkey" PRIMARY KEY ("combo_id","product_id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "contact" VARCHAR(100),

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredients" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "base_unit" VARCHAR(20) NOT NULL,
    "min_stock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "forecast_data_id" VARCHAR(36),

    CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_conversions" (
    "id" VARCHAR(36) NOT NULL,
    "ingredient_id" VARCHAR(36) NOT NULL,
    "from_unit" VARCHAR(20) NOT NULL,
    "to_unit" VARCHAR(20) NOT NULL,
    "factor" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "unit_conversions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_batches" (
    "id" VARCHAR(36) NOT NULL,
    "ingredient_id" VARCHAR(36) NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "expiry_date" TIMESTAMP(0) NOT NULL,
    "import_date" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipes" (
    "id" VARCHAR(36) NOT NULL,
    "ingredient_id" VARCHAR(36) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "product_id" VARCHAR(36),
    "variant_id" VARCHAR(36),
    "option_item_id" VARCHAR(36),

    CONSTRAINT "recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_invoices" (
    "id" VARCHAR(36) NOT NULL,
    "supplier_id" VARCHAR(36) NOT NULL,
    "total_cost" DECIMAL(12,2) NOT NULL,
    "import_date" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "import_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_invoice_details" (
    "id" VARCHAR(36) NOT NULL,
    "invoice_id" VARCHAR(36) NOT NULL,
    "ingredient_id" VARCHAR(36) NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" VARCHAR(20) NOT NULL,
    "unit_price" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "import_invoice_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_proposals" (
    "id" VARCHAR(36) NOT NULL,
    "creator_id" VARCHAR(36),
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "note" TEXT,
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchase_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_proposal_details" (
    "id" VARCHAR(36) NOT NULL,
    "proposal_id" VARCHAR(36) NOT NULL,
    "ingredient_id" VARCHAR(36) NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" VARCHAR(20) NOT NULL,

    CONSTRAINT "purchase_proposal_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_checks" (
    "id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(36) NOT NULL,
    "note" TEXT,
    "check_date" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_check_details" (
    "id" VARCHAR(36) NOT NULL,
    "check_id" VARCHAR(36) NOT NULL,
    "ingredient_id" VARCHAR(36) NOT NULL,
    "system_qty" DOUBLE PRECISION NOT NULL,
    "actual_qty" DOUBLE PRECISION NOT NULL,
    "reason" VARCHAR(255),

    CONSTRAINT "stock_check_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zones" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tables" (
    "id" VARCHAR(36) NOT NULL,
    "zone_id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "qr_code" VARCHAR(100) NOT NULL,
    "status" "TableStatus" NOT NULL DEFAULT 'available',

    CONSTRAINT "tables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(36),
    "table_id" VARCHAR(36) NOT NULL,
    "customer_name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "time" TIMESTAMP(0) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carts" (
    "id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(36) NOT NULL,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cart_items" (
    "id" VARCHAR(36) NOT NULL,
    "cart_id" VARCHAR(36) NOT NULL,
    "product_id" VARCHAR(36) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "note" TEXT,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vouchers" (
    "id" VARCHAR(36) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "type" "VoucherType" NOT NULL DEFAULT 'fixed_amount',
    "value" DECIMAL(12,2) NOT NULL,
    "min_order_val" DECIMAL(12,2) DEFAULT 0,
    "usage_limit" INTEGER DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "start_date" TIMESTAMP(0) NOT NULL,
    "end_date" TIMESTAMP(0) NOT NULL,

    CONSTRAINT "vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(36),
    "total_amount" DECIMAL(12,2) NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_vouchers" (
    "order_id" VARCHAR(36) NOT NULL,
    "voucher_id" VARCHAR(36) NOT NULL,

    CONSTRAINT "order_vouchers_pkey" PRIMARY KEY ("order_id","voucher_id")
);

-- CreateTable
CREATE TABLE "order_tables" (
    "order_id" VARCHAR(36) NOT NULL,
    "table_id" VARCHAR(36) NOT NULL,

    CONSTRAINT "order_tables_pkey" PRIMARY KEY ("order_id","table_id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" VARCHAR(36) NOT NULL,
    "order_id" VARCHAR(36) NOT NULL,
    "product_id" VARCHAR(36) NOT NULL,
    "variant_id" VARCHAR(36),
    "product_name" VARCHAR(150) NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_item_options" (
    "id" VARCHAR(36) NOT NULL,
    "order_item_id" VARCHAR(36) NOT NULL,
    "option_item_id" VARCHAR(36) NOT NULL,
    "option_name" VARCHAR(100) NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "order_item_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" VARCHAR(36) NOT NULL,
    "order_id" VARCHAR(36) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL DEFAULT 'cash',
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" VARCHAR(36) NOT NULL,
    "order_id" VARCHAR(36) NOT NULL,
    "tax_code" VARCHAR(50),
    "issued_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "roleIdIdx" ON "users"("role_id");

-- CreateIndex
CREATE INDEX "rankIdIdx" ON "users"("rank_id");

-- CreateIndex
CREATE INDEX "shiftUserIdIdx" ON "shifts"("user_id");

-- CreateIndex
CREATE INDEX "phUserIdIdx" ON "point_histories"("user_id");

-- CreateIndex
CREATE INDEX "categoryParentIdIdx" ON "categories"("parent_id");

-- CreateIndex
CREATE INDEX "prodCatIdx" ON "products"("category_id");

-- CreateIndex
CREATE INDEX "varProdIdx" ON "variants"("product_id");

-- CreateIndex
CREATE INDEX "optGrpIdx" ON "option_items"("group_id");

-- CreateIndex
CREATE INDEX "ucIngIdx" ON "unit_conversions"("ingredient_id");

-- CreateIndex
CREATE INDEX "batchIngIdx" ON "inventory_batches"("ingredient_id");

-- CreateIndex
CREATE INDEX "recProdIdx" ON "recipes"("product_id");

-- CreateIndex
CREATE INDEX "recVarIdx" ON "recipes"("variant_id");

-- CreateIndex
CREATE INDEX "recIngIdx" ON "recipes"("ingredient_id");

-- CreateIndex
CREATE INDEX "invSupIdx" ON "import_invoices"("supplier_id");

-- CreateIndex
CREATE INDEX "invDetIdx" ON "import_invoice_details"("invoice_id");

-- CreateIndex
CREATE INDEX "ppDetailIdx" ON "purchase_proposal_details"("proposal_id");

-- CreateIndex
CREATE INDEX "stockDetIdx" ON "stock_check_details"("check_id");

-- CreateIndex
CREATE UNIQUE INDEX "tables_qr_code_key" ON "tables"("qr_code");

-- CreateIndex
CREATE INDEX "tblZoneIdx" ON "tables"("zone_id");

-- CreateIndex
CREATE INDEX "resTblIdx" ON "reservations"("table_id");

-- CreateIndex
CREATE UNIQUE INDEX "carts_user_id_key" ON "carts"("user_id");

-- CreateIndex
CREATE INDEX "cartItmIdx" ON "cart_items"("cart_id");

-- CreateIndex
CREATE UNIQUE INDEX "vouchers_code_key" ON "vouchers"("code");

-- CreateIndex
CREATE INDEX "ordUserIdx" ON "orders"("user_id");

-- CreateIndex
CREATE INDEX "oiOrdIdx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "oioItemIdx" ON "order_item_options"("order_item_id");

-- CreateIndex
CREATE INDEX "payOrdIdx" ON "payment_transactions"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_order_id_key" ON "invoices"("order_id");
