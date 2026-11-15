-- CreateEnum
CREATE TYPE "SellerLevel" AS ENUM ('NEW', 'LEVEL_1', 'LEVEL_2', 'TOP_RATED');

-- CreateEnum
CREATE TYPE "GigStatus" AS ENUM ('ACTIVE', 'DRAFT', 'PAUSED');

-- CreateEnum
CREATE TYPE "PackageTier" AS ENUM ('BASIC', 'STANDARD', 'PREMIUM');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'DELIVERED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "fullname" TEXT NOT NULL,
    "imgUrl" TEXT,
    "isSeller" BOOLEAN NOT NULL DEFAULT false,
    "level" "SellerLevel" NOT NULL DEFAULT 'NEW',
    "about" TEXT,
    "country" TEXT,
    "languages" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "parentId" UUID,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gig" (
    "id" UUID NOT NULL,
    "ownerId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "images" TEXT[],
    "tags" TEXT[],
    "status" "GigStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Gig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Package" (
    "id" UUID NOT NULL,
    "gigId" UUID NOT NULL,
    "tier" "PackageTier" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "daysToMake" INTEGER NOT NULL,
    "revisions" INTEGER NOT NULL DEFAULT 0,
    "features" TEXT[],

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" UUID NOT NULL,
    "buyerId" UUID NOT NULL,
    "sellerId" UUID NOT NULL,
    "gigId" UUID NOT NULL,
    "packageId" UUID NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "serviceFee" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "dueAt" TIMESTAMP(3) NOT NULL,
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "gigId" UUID NOT NULL,
    "reviewerId" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Gig_ownerId_idx" ON "Gig"("ownerId");

-- CreateIndex
CREATE INDEX "Gig_categoryId_idx" ON "Gig"("categoryId");

-- CreateIndex
CREATE INDEX "Gig_status_idx" ON "Gig"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Package_gigId_tier_key" ON "Package"("gigId", "tier");

-- CreateIndex
CREATE INDEX "Order_buyerId_idx" ON "Order"("buyerId");

-- CreateIndex
CREATE INDEX "Order_sellerId_idx" ON "Order"("sellerId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Review_orderId_key" ON "Review"("orderId");

-- CreateIndex
CREATE INDEX "Review_gigId_idx" ON "Review"("gigId");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gig" ADD CONSTRAINT "Gig_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gig" ADD CONSTRAINT "Gig_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_gigId_fkey" FOREIGN KEY ("gigId") REFERENCES "Gig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_gigId_fkey" FOREIGN KEY ("gigId") REFERENCES "Gig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_gigId_fkey" FOREIGN KEY ("gigId") REFERENCES "Gig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
