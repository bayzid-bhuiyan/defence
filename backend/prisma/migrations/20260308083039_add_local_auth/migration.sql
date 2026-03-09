/*
  Warnings:

  - A unique constraint covering the columns `[facebookId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `facebookId` VARCHAR(191) NULL,
    ADD COLUMN `password` VARCHAR(191) NULL,
    ADD COLUMN `resetCode` VARCHAR(191) NULL,
    ADD COLUMN `resetCodeExpiry` DATETIME(3) NULL,
    MODIFY `googleId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_facebookId_key` ON `User`(`facebookId`);
