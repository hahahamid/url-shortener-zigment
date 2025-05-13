-- CreateTable
CREATE TABLE "Url" (
    "id" SERIAL NOT NULL,
    "hash" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "visits" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Url_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Url_hash_key" ON "Url"("hash");
