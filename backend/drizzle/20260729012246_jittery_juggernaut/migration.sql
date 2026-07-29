CREATE TABLE `stock_movements` (
	`id` int AUTO_INCREMENT PRIMARY KEY,
	`product_id` int NOT NULL,
	`type` enum('OPENING_STOCK','RESTOCK','ADJUSTMENT_IN','ADJUSTMENT_OUT','SALE','SALE_VOID') NOT NULL,
	`quantity` int NOT NULL,
	`previous_stock` int NOT NULL,
	`new_stock` int NOT NULL,
	`reason` varchar(255),
	`reference_number` varchar(100),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stock_movements_product_id_products_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)
);
--> statement-breakpoint
CREATE INDEX `stock_movements_product_id_idx` ON `stock_movements` (`product_id`);--> statement-breakpoint
CREATE INDEX `stock_movements_type_idx` ON `stock_movements` (`type`);--> statement-breakpoint
CREATE INDEX `stock_movements_created_at_idx` ON `stock_movements` (`created_at`);