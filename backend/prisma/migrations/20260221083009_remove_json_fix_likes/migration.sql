-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `googleId` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `avatar` VARCHAR(191) NULL,
    `isAdmin` BOOLEAN NOT NULL DEFAULT false,
    `isBlocked` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_googleId_key`(`googleId`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Inventory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `category` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `customIdFormat` JSON NULL,
    `custom_string1_state` BOOLEAN NOT NULL DEFAULT false,
    `custom_string1_name` VARCHAR(191) NULL,
    `custom_string2_state` BOOLEAN NOT NULL DEFAULT false,
    `custom_string2_name` VARCHAR(191) NULL,
    `custom_string3_state` BOOLEAN NOT NULL DEFAULT false,
    `custom_string3_name` VARCHAR(191) NULL,
    `custom_text1_state` BOOLEAN NOT NULL DEFAULT false,
    `custom_text1_name` VARCHAR(191) NULL,
    `custom_text2_state` BOOLEAN NOT NULL DEFAULT false,
    `custom_text2_name` VARCHAR(191) NULL,
    `custom_text3_state` BOOLEAN NOT NULL DEFAULT false,
    `custom_text3_name` VARCHAR(191) NULL,
    `custom_int1_state` BOOLEAN NOT NULL DEFAULT false,
    `custom_int1_name` VARCHAR(191) NULL,
    `custom_int2_state` BOOLEAN NOT NULL DEFAULT false,
    `custom_int2_name` VARCHAR(191) NULL,
    `custom_int3_state` BOOLEAN NOT NULL DEFAULT false,
    `custom_int3_name` VARCHAR(191) NULL,
    `custom_link1_state` BOOLEAN NOT NULL DEFAULT false,
    `custom_link1_name` VARCHAR(191) NULL,
    `custom_link2_state` BOOLEAN NOT NULL DEFAULT false,
    `custom_link2_name` VARCHAR(191) NULL,
    `custom_link3_state` BOOLEAN NOT NULL DEFAULT false,
    `custom_link3_name` VARCHAR(191) NULL,
    `custom_bool1_state` BOOLEAN NOT NULL DEFAULT false,
    `custom_bool1_name` VARCHAR(191) NULL,
    `custom_bool2_state` BOOLEAN NOT NULL DEFAULT false,
    `custom_bool2_name` VARCHAR(191) NULL,
    `custom_bool3_state` BOOLEAN NOT NULL DEFAULT false,
    `custom_bool3_name` VARCHAR(191) NULL,
    `custom_date1_state` BOOLEAN NOT NULL DEFAULT false,
    `custom_date1_name` VARCHAR(191) NULL,
    `custom_date2_state` BOOLEAN NOT NULL DEFAULT false,
    `custom_date2_name` VARCHAR(191) NULL,
    `custom_date3_state` BOOLEAN NOT NULL DEFAULT false,
    `custom_date3_name` VARCHAR(191) NULL,
    `authorId` INTEGER NOT NULL,

    FULLTEXT INDEX `Inventory_title_description_idx`(`title`, `description`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Item` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `customId` VARCHAR(191) NULL,
    `version` INTEGER NOT NULL DEFAULT 1,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `custom_string1_value` VARCHAR(191) NULL,
    `custom_string2_value` VARCHAR(191) NULL,
    `custom_string3_value` VARCHAR(191) NULL,
    `custom_text1_value` TEXT NULL,
    `custom_text2_value` TEXT NULL,
    `custom_text3_value` TEXT NULL,
    `custom_int1_value` INTEGER NULL,
    `custom_int2_value` INTEGER NULL,
    `custom_int3_value` INTEGER NULL,
    `custom_link1_value` VARCHAR(191) NULL,
    `custom_link2_value` VARCHAR(191) NULL,
    `custom_link3_value` VARCHAR(191) NULL,
    `custom_bool1_value` BOOLEAN NULL,
    `custom_bool2_value` BOOLEAN NULL,
    `custom_bool3_value` BOOLEAN NULL,
    `custom_date1_value` DATETIME(3) NULL,
    `custom_date2_value` DATETIME(3) NULL,
    `custom_date3_value` DATETIME(3) NULL,
    `inventoryId` INTEGER NOT NULL,

    UNIQUE INDEX `Item_inventoryId_customId_key`(`inventoryId`, `customId`),
    FULLTEXT INDEX `Item_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tag` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Tag_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Comment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `content` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `authorId` INTEGER NOT NULL,
    `inventoryId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Like` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` INTEGER NOT NULL,
    `itemId` INTEGER NOT NULL,

    UNIQUE INDEX `Like_userId_itemId_key`(`userId`, `itemId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_UserAccess` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_UserAccess_AB_unique`(`A`, `B`),
    INDEX `_UserAccess_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_InventoryToTag` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_InventoryToTag_AB_unique`(`A`, `B`),
    INDEX `_InventoryToTag_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_ItemToTag` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ItemToTag_AB_unique`(`A`, `B`),
    INDEX `_ItemToTag_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Inventory` ADD CONSTRAINT `Inventory_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_inventoryId_fkey` FOREIGN KEY (`inventoryId`) REFERENCES `Inventory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_inventoryId_fkey` FOREIGN KEY (`inventoryId`) REFERENCES `Inventory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Like` ADD CONSTRAINT `Like_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Like` ADD CONSTRAINT `Like_itemId_fkey` FOREIGN KEY (`itemId`) REFERENCES `Item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UserAccess` ADD CONSTRAINT `_UserAccess_A_fkey` FOREIGN KEY (`A`) REFERENCES `Inventory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_UserAccess` ADD CONSTRAINT `_UserAccess_B_fkey` FOREIGN KEY (`B`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_InventoryToTag` ADD CONSTRAINT `_InventoryToTag_A_fkey` FOREIGN KEY (`A`) REFERENCES `Inventory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_InventoryToTag` ADD CONSTRAINT `_InventoryToTag_B_fkey` FOREIGN KEY (`B`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ItemToTag` ADD CONSTRAINT `_ItemToTag_A_fkey` FOREIGN KEY (`A`) REFERENCES `Item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ItemToTag` ADD CONSTRAINT `_ItemToTag_B_fkey` FOREIGN KEY (`B`) REFERENCES `Tag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
