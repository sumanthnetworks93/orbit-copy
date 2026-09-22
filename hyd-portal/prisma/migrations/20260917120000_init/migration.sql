-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SEEKER', 'RECRUITER', 'ADMIN');
CREATE TYPE "CompanyType" AS ENUM ('IT', 'ITES', 'PHARMA', 'BPO', 'RETAIL', 'GIG', 'HOSPITAL', 'STARTUP');
CREATE TYPE "SalaryPeriod" AS ENUM ('LPA', 'MONTHLY');
CREATE TYPE "Shift" AS ENUM ('DAY', 'NIGHT', 'ROTATIONAL');
CREATE TYPE "JobStatus" AS ENUM ('OPEN', 'PAUSED', 'REMOVED');
CREATE TYPE "ApplicationStatus" AS ENUM ('APPLIED', 'SHORTLISTED', 'REJECTED', 'INTERVIEW', 'HIRED');
CREATE TYPE "ReportStatus" AS ENUM ('OPEN', 'DISMISSED', 'ACTIONED');
CREATE TYPE "MetroLine" AS ENUM ('BLUE', 'RED', 'GREEN');

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'SEEKER',
    "name" TEXT,
    "locale" TEXT NOT NULL DEFAULT 'en',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyId" TEXT,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SeekerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "locality" TEXT NOT NULL DEFAULT 'HITEC City',
    "experienceYears" INTEGER NOT NULL DEFAULT 0,
    "headline" TEXT,
    "skills" TEXT NOT NULL DEFAULT '',
    "resumeKey" TEXT,
    "resumeName" TEXT,
    "resumeMime" TEXT,
    CONSTRAINT "SeekerProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CompanyType" NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "gstin" TEXT,
    "about" TEXT NOT NULL DEFAULT '',
    "locality" TEXT NOT NULL,
    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "recruiterId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleTe" TEXT NOT NULL,
    "titleHi" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "descriptionTe" TEXT NOT NULL,
    "descriptionHi" TEXT NOT NULL,
    "locality" TEXT NOT NULL,
    "metroStation" TEXT NOT NULL,
    "metroLine" "MetroLine" NOT NULL,
    "commuteMin" INTEGER NOT NULL,
    "salaryMin" DECIMAL(10,2) NOT NULL,
    "salaryMax" DECIMAL(10,2) NOT NULL,
    "salaryPeriod" "SalaryPeriod" NOT NULL,
    "experienceMin" INTEGER NOT NULL DEFAULT 0,
    "experienceMax" INTEGER NOT NULL DEFAULT 2,
    "shift" "Shift" NOT NULL DEFAULT 'DAY',
    "workFromHome" BOOLEAN NOT NULL DEFAULT false,
    "cabFacility" BOOLEAN NOT NULL DEFAULT false,
    "trainingProvided" BOOLEAN NOT NULL DEFAULT false,
    "noExperience" BOOLEAN NOT NULL DEFAULT false,
    "immediateJoiner" BOOLEAN NOT NULL DEFAULT false,
    "companyType" "CompanyType" NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'OPEN',
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "searchText" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WalkIn" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "documents" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    CONSTRAINT "WalkIn_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "seekerId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'APPLIED',
    "note" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SavedJob" (
    "id" TEXT NOT NULL,
    "seekerId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedJob_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JobReport" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JobReport_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "JobAlert" (
    "id" TEXT NOT NULL,
    "seekerId" TEXT NOT NULL,
    "query" TEXT NOT NULL DEFAULT '',
    "locality" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "JobAlert_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OtpChallenge" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OtpChallenge_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RateLimit" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "windowEnd" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
CREATE UNIQUE INDEX "SeekerProfile_userId_key" ON "SeekerProfile"("userId");
CREATE UNIQUE INDEX "WalkIn_jobId_key" ON "WalkIn"("jobId");
CREATE UNIQUE INDEX "Application_seekerId_jobId_key" ON "Application"("seekerId", "jobId");
CREATE UNIQUE INDEX "SavedJob_seekerId_jobId_key" ON "SavedJob"("seekerId", "jobId");
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");
CREATE UNIQUE INDEX "RateLimit_key_key" ON "RateLimit"("key");

CREATE INDEX "Job_locality_status_idx" ON "Job"("locality", "status");
CREATE INDEX "Job_companyType_status_idx" ON "Job"("companyType", "status");
CREATE INDEX "Job_postedAt_idx" ON "Job"("postedAt");
CREATE INDEX "OtpChallenge_phone_createdAt_idx" ON "OtpChallenge"("phone", "createdAt");

ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "SeekerProfile" ADD CONSTRAINT "SeekerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Job" ADD CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Job" ADD CONSTRAINT "Job_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "WalkIn" ADD CONSTRAINT "WalkIn_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Application" ADD CONSTRAINT "Application_seekerId_fkey" FOREIGN KEY ("seekerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_seekerId_fkey" FOREIGN KEY ("seekerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "JobReport" ADD CONSTRAINT "JobReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JobReport" ADD CONSTRAINT "JobReport_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "JobAlert" ADD CONSTRAINT "JobAlert_seekerId_fkey" FOREIGN KEY ("seekerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Job" ADD COLUMN "searchVec" tsvector GENERATED ALWAYS AS (
  to_tsvector('simple', coalesce("title",'') || ' ' || coalesce("description",'') || ' ' || coalesce("locality",'') || ' ' || coalesce("searchText",''))
) STORED;
CREATE INDEX "Job_searchVec_gin" ON "Job" USING GIN ("searchVec");
