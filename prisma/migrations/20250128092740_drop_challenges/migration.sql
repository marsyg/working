/*
  Warnings:

  - You are about to drop the `Challenge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_UserChallenges` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_UserChallenges" DROP CONSTRAINT "_UserChallenges_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserChallenges" DROP CONSTRAINT "_UserChallenges_B_fkey";

-- DropTable
DROP TABLE "Challenge";

-- DropTable
DROP TABLE "_UserChallenges";
