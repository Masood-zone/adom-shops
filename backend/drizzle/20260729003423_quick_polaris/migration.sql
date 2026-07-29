CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`name` varchar(100) NOT NULL,
	`description` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `categories_name_unique` UNIQUE INDEX(`name`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`category_id` int NOT NULL,
	`sku` varchar(50) NOT NULL,
	`name` varchar(150) NOT NULL,
	`description` text,
	`unit_price` decimal(10,2) NOT NULL,
	`quantity_in_stock` int NOT NULL DEFAULT 0,
	`reorder_level` int NOT NULL DEFAULT 5,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_sku_unique` UNIQUE INDEX(`sku`)
);
--> statement-breakpoint
CREATE INDEX `products_category_id_index` ON `products` (`category_id`);--> statement-breakpoint
CREATE INDEX `products_name_index` ON `products` (`name`);--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_category_id_categories_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;