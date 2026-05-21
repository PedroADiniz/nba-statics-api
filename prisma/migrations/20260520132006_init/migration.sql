-- CreateTable
CREATE TABLE `Team` (
    `id` INTEGER NOT NULL,
    `abbreviation` VARCHAR(10) NOT NULL,
    `city` VARCHAR(50) NOT NULL,
    `conference` VARCHAR(10) NOT NULL,
    `division` VARCHAR(20) NOT NULL,
    `fullName` VARCHAR(60) NOT NULL,
    `name` VARCHAR(40) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `H2HCache` (
    `id` VARCHAR(30) NOT NULL,
    `cacheKey` VARCHAR(100) NOT NULL,
    `payload` LONGTEXT NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `H2HCache_cacheKey_key`(`cacheKey`),
    INDEX `H2HCache_cacheKey_idx`(`cacheKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
