-- CreateTable
CREATE TABLE "ratings" (
    "id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(36),
    "star" INTEGER NOT NULL DEFAULT 5,
    "comment" TEXT,
    "product_id" VARCHAR(36),
    "created_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ratingProductIdx" ON "ratings"("product_id");
