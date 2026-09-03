CREATE TABLE `addresses` (
	`customer_id` integer,
	`order_id` integer,
	`postal_code` text NOT NULL,
	`street` text NOT NULL,
	`apartament` text,
	`country_tag` text NOT NULL,
	`city` text NOT NULL,
	CONSTRAINT `fk_addresses_customer_id_customers_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`)
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`first_name` text,
	`last_name` text,
	`company_name` text,
	`email` text,
	`phoneNumber` text,
	`external_id` text UNIQUE
);
--> statement-breakpoint
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
CREATE TABLE `orders` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`customer_id` integer NOT NULL,
	`external_id` text NOT NULL,
	`source` text NOT NULL,
	`status` text NOT NULL,
	`total_to_pay` integer NOT NULL,
	`total_paid` integer NOT NULL,
	`payment_method` text NOT NULL,
	`packages` integer DEFAULT 1 NOT NULL,
	`fulfilled_at` integer,
	`prepared_at` integer,
	`created_at` integer NOT NULL,
	CONSTRAINT `fk_orders_customer_id_customers_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`),
	CONSTRAINT `source_external_id` UNIQUE(`external_id`,`source`)
);
--> statement-breakpoint
CREATE TABLE `positions` (
	`receipt_id` integer,
	`order_id` integer NOT NULL,
	`offer_id` integer NOT NULL,
	`quantity` integer NOT NULL,
	`price` integer NOT NULL,
	`client_tag` text,
	CONSTRAINT `positions_pk` PRIMARY KEY(`receipt_id`, `order_id`, `offer_id`),
	CONSTRAINT `fk_positions_receipt_id_receipts_id_fk` FOREIGN KEY (`receipt_id`) REFERENCES `receipts`(`id`),
	CONSTRAINT `fk_positions_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`),
	CONSTRAINT `fk_positions_offer_id_offers_id_fk` FOREIGN KEY (`offer_id`) REFERENCES `offers`(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`external_id` text NOT NULL UNIQUE,
	`name` text NOT NULL,
	`image_source` text,
	`tax` integer NOT NULL,
	`stock` integer DEFAULT 0 NOT NULL
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
	`created_at` integer NOT NULL,
	CONSTRAINT `fk_receipts_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`)
);
