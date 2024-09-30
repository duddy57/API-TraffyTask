/*
  Warnings:

  - The primary key for the `Goals` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Goals` table. All the data in the column will be lost.
  - The required column `goalsId` was added to the `Goals` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "GoalCompletion" DROP CONSTRAINT "GoalCompletion_goalId_fkey";

-- AlterTable
ALTER TABLE "Goals" DROP CONSTRAINT "Goals_pkey",
DROP COLUMN "id",
ADD COLUMN     "goalsId" TEXT NOT NULL,
ADD CONSTRAINT "Goals_pkey" PRIMARY KEY ("goalsId");

-- AddForeignKey
ALTER TABLE "GoalCompletion" ADD CONSTRAINT "GoalCompletion_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goals"("goalsId") ON DELETE RESTRICT ON UPDATE CASCADE;
