/*
  Warnings:

  - You are about to drop the `FundCompanyExit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FundCompanySector` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FundCompanyExit" DROP CONSTRAINT "FundCompanyExit_fund_company_id_fkey";

-- DropForeignKey
ALTER TABLE "FundCompanySector" DROP CONSTRAINT "FundCompanySector_fund_company_id_fkey";

-- DropTable
DROP TABLE "FundCompanyExit";

-- DropTable
DROP TABLE "FundCompanySector";

-- CreateTable
CREATE TABLE "fund_company_sectors" (
    "id" SERIAL NOT NULL,
    "fund_company_id" INTEGER NOT NULL,
    "sector" TEXT NOT NULL,

    CONSTRAINT "fund_company_sectors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fund_company_exits" (
    "id" SERIAL NOT NULL,
    "fund_company_id" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "exit_type" "ExitStrategy" NOT NULL,
    "buyer" TEXT NOT NULL,
    "exit_amount" INTEGER NOT NULL,
    "proceeds" INTEGER NOT NULL,
    "multiple_capital" INTEGER NOT NULL,
    "irr" INTEGER NOT NULL,
    "market_cap" INTEGER,
    "share_price" INTEGER,
    "transaction_details" TEXT,
    "earn_put_details" TEXT,
    "non_compete_details" TEXT,
    "vc_proceeds" INTEGER NOT NULL,
    "co_investor_proceeds" INTEGER NOT NULL,
    "founder_proceeds" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "fund_company_exits_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "fund_company_sectors" ADD CONSTRAINT "fund_company_sectors_fund_company_id_fkey" FOREIGN KEY ("fund_company_id") REFERENCES "fund_companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fund_company_exits" ADD CONSTRAINT "fund_company_exits_fund_company_id_fkey" FOREIGN KEY ("fund_company_id") REFERENCES "fund_companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
