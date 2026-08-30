CREATE TABLE `items` (
	`offer_id` integer NOT NULL,
	`product_id` integer NOT NULL,
	`quantity` integer NOT NULL,
	CONSTRAINT `items_pk` PRIMARY KEY(`offer_id`, `product_id`),
	CONSTRAINT `fk_items_offer_id_offers_id_fk` FOREIGN KEY (`offer_id`) REFERENCES `offers`(`id`),
	CONSTRAINT `fk_items_product_id_products_id_fk` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)
);
--> statement-breakpoint
CREATE TABLE `offers` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`external_id` text NOT NULL UNIQUE,
	`source` text NOT NULL,
	`title` text NOT NULL,
	`image_source` text NOT NULL,
	`approved` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `positions` (
	`receipt_id` integer NOT NULL,
	`offer_id` integer NOT NULL,
	`title` text NOT NULL,
	`quantity` integer NOT NULL,
	`price` integer NOT NULL,
	`client_tag` text,
	CONSTRAINT `positions_pk` PRIMARY KEY(`receipt_id`, `offer_id`),
	CONSTRAINT `fk_positions_receipt_id_receipts_id_fk` FOREIGN KEY (`receipt_id`) REFERENCES `receipts`(`id`),
	CONSTRAINT `fk_positions_offer_id_products_id_fk` FOREIGN KEY (`offer_id`) REFERENCES `products`(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`external_id` text NOT NULL UNIQUE,
	`name` text NOT NULL,
	`image_source` text,
	`tax` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `receipts` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`order_id` integer NOT NULL,
	`number` text NOT NULL UNIQUE,
	`fiscal_number` integer,
	`recipient_first_name` text NOT NULL,
	`recipient_last_name` text NOT NULL,
	`payment_method` text NOT NULL,
	`total_paid` integer NOT NULL,
	`packages_made` integer NOT NULL,
	`client_tag` text,
	`created_at` integer DEFAULT 1788113891928 NOT NULL
);
