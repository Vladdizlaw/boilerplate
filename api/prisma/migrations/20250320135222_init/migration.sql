-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "FundStatus" AS ENUM ('active', 'fundraising', 'closed');

-- CreateEnum
CREATE TYPE "FundCompanyStatus" AS ENUM ('invested', 'exited');

-- CreateEnum
CREATE TYPE "InvestmentRound" AS ENUM ('pre_seed', 'seed', 'series_a', 'series_b', 'series_c', 'series_d', 'series_e', 'growth');

-- CreateEnum
CREATE TYPE "LeadInvestorRole" AS ENUM ('board_seat', 'observer_role');

-- CreateEnum
CREATE TYPE "ExitStrategy" AS ENUM ('ipo', 'acquisition', 'merger');

-- CreateEnum
CREATE TYPE "CapitalCallSchedule" AS ENUM ('monthly', 'quarterly', 'bi_annually', 'annually');

-- CreateEnum
CREATE TYPE "KYCStatus" AS ENUM ('verified', 'unverified');

-- CreateEnum
CREATE TYPE "Communication" AS ENUM ('email', 'phone');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "provider" TEXT,
    "provider_id" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_confirmations" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "email" BOOLEAN NOT NULL DEFAULT false,
    "phone" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_confirmations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_agreements" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "terms_and_conditions" BOOLEAN NOT NULL,
    "updates_and_promotions" BOOLEAN,

    CONSTRAINT "user_agreements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "phone" TEXT,
    "company_name" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" SERIAL NOT NULL,
    "original_file_name" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "resource_id" INTEGER,
    "resource" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "funds" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "size" INTEGER,
    "status" "FundStatus" NOT NULL DEFAULT 'fundraising',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "funds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fund_companies" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "fund_id" INTEGER NOT NULL,
    "legal_name" TEXT NOT NULL,
    "trading_name" TEXT,
    "representative_name" TEXT NOT NULL,
    "representative_email" TEXT NOT NULL,
    "website_link" TEXT NOT NULL,
    "description" TEXT,
    "significant_milestones" TEXT,
    "founded_date" TIMESTAMP(3),
    "status" "FundCompanyStatus" NOT NULL,
    "headquarter" TEXT,
    "investment_date" TIMESTAMP(3),
    "investment_amount" INTEGER,
    "investment_round" "InvestmentRound" NOT NULL,
    "equity_stack" INTEGER,
    "total_capital_raised" INTEGER,
    "investment_valuation" INTEGER,
    "annual_revenue" INTEGER,
    "revenue_date" TIMESTAMP(3),
    "revenue_growth_rate" INTEGER NOT NULL,
    "monthly_burn_rate" INTEGER NOT NULL,
    "runway" TEXT,
    "profitability_status" TEXT,
    "ebitda" INTEGER NOT NULL,
    "customer_acquisition_cost" INTEGER NOT NULL,
    "lifetime_value" INTEGER NOT NULL,
    "gross_margin" INTEGER NOT NULL,
    "arp" INTEGER NOT NULL,
    "churn_rate" TEXT,
    "monthly_active_users" INTEGER NOT NULL,
    "average_revenue_per_user" INTEGER NOT NULL,
    "conversion_rate" INTEGER NOT NULL,
    "expected_exit_time" TEXT,
    "strategic_goals" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "fund_companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sectors" (
    "name" TEXT NOT NULL,

    CONSTRAINT "sectors_pkey" PRIMARY KEY ("name")
);

-- CreateTable
CREATE TABLE "FundCompanySector" (
    "id" SERIAL NOT NULL,
    "fund_company_id" INTEGER NOT NULL,
    "sector" TEXT NOT NULL,

    CONSTRAINT "FundCompanySector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fund_company_teams" (
    "id" SERIAL NOT NULL,
    "fund_company_id" INTEGER NOT NULL,
    "fullname" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "fund_company_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fund_company_lead_investors" (
    "id" SERIAL NOT NULL,
    "fund_company_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "investment_amount" INTEGER NOT NULL,
    "equity_stack" INTEGER NOT NULL,
    "role" "LeadInvestorRole" NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "fund_company_lead_investors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fund_company_co_investors" (
    "id" SERIAL NOT NULL,
    "fund_company_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "investment_amount" INTEGER NOT NULL,
    "equity_stack" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "fund_company_co_investors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "limited_partners" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "investment_preferences" TEXT NOT NULL,
    "capital_call_schedule" "CapitalCallSchedule" NOT NULL,
    "initial_commitment" TIMESTAMP(3) NOT NULL,
    "expected_exit_horizon" TEXT,
    "legal_entity_type" TEXT NOT NULL,
    "tax_residency" TEXT NOT NULL,
    "total_commitment" INTEGER NOT NULL,
    "kyc_status" "KYCStatus" NOT NULL,
    "communication_preferences" "Communication" NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "limited_partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fund_commitments" (
    "id" SERIAL NOT NULL,
    "lp_id" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,
    "fund_id" INTEGER NOT NULL,

    CONSTRAINT "fund_commitments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundCompanyExit" (
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

    CONSTRAINT "FundCompanyExit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_confirmations_user_id_key" ON "user_confirmations"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_agreements_user_id_key" ON "user_agreements"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- AddForeignKey
ALTER TABLE "user_confirmations" ADD CONSTRAINT "user_confirmations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_agreements" ADD CONSTRAINT "user_agreements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funds" ADD CONSTRAINT "funds_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fund_companies" ADD CONSTRAINT "fund_companies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fund_companies" ADD CONSTRAINT "fund_companies_fund_id_fkey" FOREIGN KEY ("fund_id") REFERENCES "funds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundCompanySector" ADD CONSTRAINT "FundCompanySector_fund_company_id_fkey" FOREIGN KEY ("fund_company_id") REFERENCES "fund_companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fund_company_teams" ADD CONSTRAINT "fund_company_teams_fund_company_id_fkey" FOREIGN KEY ("fund_company_id") REFERENCES "fund_companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fund_company_lead_investors" ADD CONSTRAINT "fund_company_lead_investors_fund_company_id_fkey" FOREIGN KEY ("fund_company_id") REFERENCES "fund_companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fund_company_co_investors" ADD CONSTRAINT "fund_company_co_investors_fund_company_id_fkey" FOREIGN KEY ("fund_company_id") REFERENCES "fund_companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "limited_partners" ADD CONSTRAINT "limited_partners_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fund_commitments" ADD CONSTRAINT "fund_commitments_lp_id_fkey" FOREIGN KEY ("lp_id") REFERENCES "limited_partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fund_commitments" ADD CONSTRAINT "fund_commitments_fund_id_fkey" FOREIGN KEY ("fund_id") REFERENCES "funds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundCompanyExit" ADD CONSTRAINT "FundCompanyExit_fund_company_id_fkey" FOREIGN KEY ("fund_company_id") REFERENCES "fund_companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
