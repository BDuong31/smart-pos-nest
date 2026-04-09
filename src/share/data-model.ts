import { v7 } from 'uuid';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
// Các trạng thái cơ bản
export enum BasicStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  BANNED = 'banned',
}

// Trạng thái bàn
export enum TableStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  MAINTENANCE = 'maintenance',
}

// Trạng thái đặt bàn
export enum ReservationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  ARRIVED = 'arrived',
  CANCELLED = 'cancelled',
}

// Trạng thái đơn hàng
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SERVED = 'served',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

// Phương thức thanh toán
export enum PaymentMethod {
  CASH = 'cash',
  MOMO = 'momo',
  VNPAY = 'vnpay',
  ZALO = 'zalo',
}

// Trạng thái thanh toán
export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

// Kiểu khuyến mãi
export enum VoucherType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
}

// Kiểu hình ảnh
export enum ImageType {
  CATEGORY = 'category',
  COMBO = 'combo',
  AVATAR = 'avatar',
  PRODUCT = 'product',
  INGREDIENT = 'ingredient',
  OPTION = 'option',
}

// Schema của hình ảnh
export const publicImageSchema = z.object({
  id: z.string().uuid(),
  url: z.string(),
  isMain: z.boolean(),
  type: z.string(),
  publicId: z.string(),
  refId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu hình ảnh
export type PublicImage = z.infer<typeof publicImageSchema>;

// Schema của người dùng
export const publicUserSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  email: z.string().email(),
  fullName: z.string(),
  birthday: z.date(),
  rankId: z.string().nullable(),
});

// Kiểu dữ liệu người dùng công khai
export interface PublicUser extends z.infer<typeof publicUserSchema> {}

// Schema của ca làm việc
export const publicShiftSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  startTime: z.date(),
  endTime: z.date().nullable(),
  cashStart: z.number(),
  cashEnd: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu ca làm việc
export interface PublicShift extends z.infer<typeof publicShiftSchema> {}

// Schema của hạng người dùng
export const publicRankSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  minPoint: z.number(),
  discountPercent: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu hạng người dùng
export interface PublicRank extends z.infer<typeof publicRankSchema> {}

// Schema của lịch sử điểm tích luỹ
export const publicPointHistorySchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  amount: z.number(),
  reason: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu lịch sử điểm tích luỹ
export interface PublicPointHistory extends z.infer<
  typeof publicPointHistorySchema
> {}

// Schema của danh mục
export const publicCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  parentId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu danh mục
export type PublicCategory = z.infer<typeof publicCategorySchema>;

// Schema của món
export const publicProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  categoryId: z.string(),
  printerId: z.string().nullable(),
  basePrice: z.number(),
  isCombo: z.boolean().nullable(),
  isActive: z.boolean().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu món
export interface PublicProduct extends z.infer<typeof publicProductSchema> {}

// Schema của biến thể món
export const publicVariantSchema = z.object({
  id: z.string().uuid(),
  productId: z.string(),
  name: z.string(),
  priceDiff: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu biến thể món
export interface PublicVariant extends z.infer<typeof publicVariantSchema> {}

// Schema của nhóm tuỳ chọn
export const publicOptionGroupSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  isMultiSelect: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu nhóm tuỳ chọn
export interface PublicOptionGroup extends z.infer<
  typeof publicOptionGroupSchema
> {}

// Schema của mục tuỳ chọn
export const publicOptionItemSchema = z.object({
  id: z.string().uuid(),
  groupId: z.string(),
  name: z.string(),
  priceExtra: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu mục tuỳ chọn
export interface PublicOptionItem extends z.infer<
  typeof publicOptionItemSchema
> {}

// Schema của Kết nối tuỳ chọn với món
export const publicProductOptionConfigSchema = z.object({
  productId: z.string(),
  optionGroupId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu Kết nối tuỳ chọn với món
export interface PublicProductOptionConfig extends z.infer<
  typeof publicProductOptionConfigSchema
> {}

// Schema của Combos
export const publicComboSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  price: z.number(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu Combos
export interface PublicCombo extends z.infer<typeof publicComboSchema> {}

// Schema của mục trong combo
export const publicComboItemSchema = z.object({
  id: z.string().uuid(),
  comboId: z.string(),
  productId: z.string(),
  quantity: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu mục trong combo
export interface PublicComboItem extends z.infer<
  typeof publicComboItemSchema
> {}

// Schema của nhà cung cấp
export const publicSupplierSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  contact: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu nhà cung cấp
export interface PublicSupplier extends z.infer<typeof publicSupplierSchema> {}

// Schema của nguyên liệu
export const publicIngredientSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  baseUnit: z.string(),
  minStock: z.number(),
  forecastDataId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu nguyên liệu
export interface PublicIngredient extends z.infer<
  typeof publicIngredientSchema
> {}

// Schema của đơn vị chuyển đổi nguyên liệu
export const publicUnitConversionSchema = z.object({
  id: z.string().uuid(),
  ingredientId: z.string(),
  fromUnit: z.string(),
  toUnit: z.string(),
  factor: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu đơn vị chuyển đổi nguyên liệu
export interface PublicUnitConversion extends z.infer<
  typeof publicUnitConversionSchema
> {}

// Schema của lô hàng tồn kho
export const publicInventoryBatchSchema = z.object({
  id: z.string().uuid(),
  ingredientId: z.string(),
  quantity: z.number(),
  expiryDate: z.date(),
  importDate: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu lô hàng tồn kho
export interface PublicInventoryBatch extends z.infer<
  typeof publicInventoryBatchSchema
> {}

// Schema của công thức món
export const publicRecipeSchema = z.object({
  id: z.string().uuid(),
  ingredientId: z.string(),
  amount: z.number(),
  productId: z.string().nullable(),
  variantId: z.string().nullable(),
  optionItemId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu công thức món
export interface PublicRecipe extends z.infer<typeof publicRecipeSchema> {}

// Schema của đơn nhập hàng
export const publicImportInvoice = z.object({
  id: z.string().uuid(),
  code: z.string(),
  supplierId: z.string(),
  totalCost: z.number(),
  importDate: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu đơn nhập hàng
export interface PublicImportInvoice extends z.infer<
  typeof publicImportInvoice
> {}

// Schema của chi tiết đơn nhập hàng
export const publicImportInvoiceDetail = z.object({
  id: z.string().uuid(),
  invoiceId: z.string(),
  ingredientId: z.string(),
  quantity: z.number(),
  unit: z.string(),
  unitPrice: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu chi tiết đơn nhập hàng
export interface PublicImportInvoiceDetail extends z.infer<
  typeof publicImportInvoiceDetail
> {}

// Schema của đề xuất mua hàng
export const publicPurchaseProposalSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  creatorId: z.string().nullable(),
  status: z.string(),
  note: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu đề xuất mua hàng
export interface PublicPurchaseProposal extends z.infer<
  typeof publicPurchaseProposalSchema
> {}

// Schema của chi tiết đề xuất mua hàng
export const publicPurchaseProposalDetailSchema = z.object({
  id: z.string().uuid(),
  proposalId: z.string(),
  ingredientId: z.string(),
  quantity: z.number(),
  unit: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu chi tiết đề xuất mua hàng
export interface PublicPurchaseProposalDetail extends z.infer<
  typeof publicPurchaseProposalDetailSchema
> {}

// Schema của Kiểm kê tồn kho
export const publicStockChecSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  userId: z.string(),
  note: z.string().nullable(),
  checkDate: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu Kiểm kê tồn kho
export interface PublicStockCheck extends z.infer<
  typeof publicStockChecSchema
> {}

// Schema của chi tiết kiểm kê tồn kho
export const publicStockCheckDetailSchema = z.object({
  id: z.string().uuid(),
  checkId: z.string(),
  ingredientId: z.string(),
  systemQty: z.number(),
  actualQty: z.number(),
  reason: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu chi tiết kiểm kê tồn kho
export interface PublicStockCheckDetail extends z.infer<
  typeof publicStockCheckDetailSchema
> {}

// Schema của khu vực phục vụ
export const publicZoneSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu khu vực phục vụ
export interface PublicZone extends z.infer<typeof publicZoneSchema> {}

// Schema của bàn
export const publicTableSchema = z.object({
  id: z.string().uuid(),
  zoneId: z.string(),
  name: z.string(),
  qrCode: z.string(),
  capacity: z.number(),
  isActive: z.boolean(),
  status: z.enum(TableStatus),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu bàn
export interface PublicTable extends z.infer<typeof publicTableSchema> {}

// Schema của đặt bàn
export const publicReservationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().nullable(),
  tableId: z.string(),
  customerName: z.string(),
  phone: z.string(),
  time: z.date(),
  guestCount: z.number(),
  note: z.string().nullable(),
  status: z.enum(ReservationStatus),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu đặt bàn
export interface PublicReservation extends z.infer<
  typeof publicReservationSchema
> {}

// Schema của giỏ hàng
export const publicCartSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().nullable(),
  totalItem: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu giỏ hàng
export interface PublicCart extends z.infer<typeof publicCartSchema> {}

// Schema của mục giỏ hàng
export const publicCartItemSchema = z.object({
  id: z.string().uuid(),
  cartId: z.string(),
  productId: z.string().nullable(),
  variantId: z.string().nullable(),
  quantity: z.number(),
  note: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu mục giỏ hàng
export interface PublicCartItem extends z.infer<typeof publicCartItemSchema> {}

// Schema của tuỳ chọn mục giỏ hàng
export const publicCartItemOptionSchema = z.object({
  id: z.string().uuid(),
  cartItemId: z.string(),
  optionItemId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu tuỳ chọn mục giỏ hàng
export interface PublicCartItemOption extends z.infer<
  typeof publicCartItemOptionSchema
> {}

// Schema của khuyến mãi
export const publicVoucherSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  type: z.enum(VoucherType),
  value: z.number(),
  minOrderVal: z.number(),
  usageLimit: z.number(),
  isActive: z.boolean(),
  startDate: z.date(),
  endDate: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu khuyến mãi
export interface PublicVoucher extends z.infer<typeof publicVoucherSchema> {}

// Schema của đơn hàng
export const publicOrderSchema = z.object({
  id: z.string().uuid(),
  code: z.string(),
  userId: z.string().nullable(),
  totalAmount: z.number(),
  stauts: z.enum(OrderStatus),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu đơn hàng
export interface PublicOrder extends z.infer<typeof publicOrderSchema> {}

// Schema của khuyến mãi áp dụng cho đơn hàng
export const publicOrderVoucherSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string(),
  voucherId: z.string(),
  discountApplied: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu khuyến mãi áp dụng cho đơn hàng
export interface PublicOrderVoucher extends z.infer<
  typeof publicOrderVoucherSchema
> {}

// Schema của bàn áp dụng cho đơn hàng
export const publicOrderTableSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string(),
  tableId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu bàn áp dụng cho đơn hàng
export interface PublicOrderTable extends z.infer<
  typeof publicOrderTableSchema
> {}

// Schema của mục đơn hàng
export const publicOrderItemSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string(),
  productId: z.string().nullable(),
  variantId: z.string().nullable(),
  productName: z.string(),
  price: z.number(),
  quantity: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu mục đơn hàng
export interface PublicOrderItem extends z.infer<
  typeof publicOrderItemSchema
> {}

// Schema của tuỳ chọn mục đơn hàng
export const publicOrderItemOptionSchema = z.object({
  id: z.string().uuid(),
  orderItemId: z.string(),
  optionItemId: z.string(),
  optionName: z.string(),
  price: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu tuỳ chọn mục đơn hàng
export interface PublicOrderItemOption extends z.infer<
  typeof publicOrderItemOptionSchema
> {}

// Schema của giao dịch thanh toán
export const publicPaymentTransactionSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string(),
  externalTransactionId: z.string(),
  amount: z.number(),
  method: z.enum(PaymentMethod),
  gatewayResponse: z
    .any()
    .transform((val) => val as Prisma.InputJsonValue)
    .optional(),
  status: z.enum(PaymentStatus),
  paidAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu giao dịch thanh toán
export interface PublicPaymentTransaction extends z.infer<
  typeof publicPaymentTransactionSchema
> {}

// Schema của hoá đơn điện tử
export const publicInvoiceSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string(),
  taxCode: z.string(),
  issuedAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Kiểu dữ liệu hoá đơn điện tử
export interface PublicInvoice extends z.infer<typeof publicInvoiceSchema> {}

// Schema của phân trang
export const pagingDTOSchema = z.object({
  page: z.coerce
    .number()
    .min(1, { message: 'Page must be at least 1' })
    .default(1),
  limit: z.coerce
    .number()
    .min(1, { message: 'Limit must be at least 1' })
    .max(100)
    .default(20),
  sort: z.string().optional(),
  order: z.string().optional(),
});

// Kiểu dữ liệu phân trang
export interface PagingDTO extends z.infer<typeof pagingDTOSchema> {}

// Kiểu dữ liệu phân trang
export type Paginated<E> = {
  data: E[];
  paging: PagingDTO;
  total: number;
};

// Lời nhắn Pub/Sub
export class PubSubMessage {
  public readonly ID: string;
  public readonly SenderID?: string;
  public readonly Topic: string;
  public readonly Payload: Record<string, any>;
  public readonly CreatedAt: Date;
  constructor(
    senderID: string | undefined,
    topic: string,
    payload: Record<string, any>,
  ) {
    this.ID = v7();
    this.SenderID = senderID;
    this.Topic = topic;
    this.Payload = payload;
    this.CreatedAt = new Date();
  }
}

// Ghi chú: Dành cho kiến trúc hướng sự kiến
// Tất cả sự kiện nên kế thừa lớp này
export abstract class AppEvent<Payload> {
  private _id: string;
  private _occurredAt: Date;
  private _senderId?: string;

  constructor(
    private readonly _eventName: string,
    private readonly _payload: Payload,
    dtoProps?: {
      id?: string;
      occurredAt?: Date;
      senderId?: string;
    },
  ) {
    this._id = dtoProps?.id || v7();
    this._occurredAt = dtoProps?.occurredAt || new Date();
    this._senderId = dtoProps?.senderId;
  }

  // Lấy tên sự kiện
  get eventName(): string {
    return this._eventName;
  }

  // Lấy ID sự kiện
  get id(): string {
    return this._id;
  }

  // Lấy thời gian xảy ra sự kiện
  get occurredAt(): Date {
    return this._occurredAt;
  }

  // Lấy ID người gửi
  get senderId(): string | undefined {
    return this._senderId;
  }

  // Lấy dữ liệu tải trọng
  get payload(): Payload {
    return this._payload;
  }

  // Chuyển đổi sự kiện thành đối tượng bình thường
  plainObject() {
    return {
      id: this._id,
      occurredAt: this._occurredAt,
      senderId: this._senderId,
      eventName: this._eventName,
      payload: this._payload,
    };
  }
}
