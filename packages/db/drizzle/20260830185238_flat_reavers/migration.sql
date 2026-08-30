ALTER TABLE `positions` ADD `id` integer;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_positions` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`receipt_id` integer NOT NULL,
	`offer_id` integer NOT NULL,
	`title` text NOT NULL,
	`quantity` integer NOT NULL,
	`price` integer NOT NULL,
	`client_tag` text,
	CONSTRAINT `fk_positions_receipt_id_receipts_id_fk` FOREIGN KEY (`receipt_id`) REFERENCES `receipts`(`id`),
	CONSTRAINT `fk_positions_offer_id_products_id_fk` FOREIGN KEY (`offer_id`) REFERENCES `products`(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_positions`(`receipt_id`, `offer_id`, `title`, `quantity`, `price`, `client_tag`) SELECT `receipt_id`, `offer_id`, `title`, `quantity`, `price`, `client_tag` FROM `positions`;--> statement-breakpoint
DROP TABLE `positions`;--> statement-breakpoint
ALTER TABLE `__new_positions` RENAME TO `positions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_receipts` (
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
	`created_at` integer DEFAULT 1788115958259 NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_receipts`(`id`, `order_id`, `number`, `fiscal_number`, `recipient_first_name`, `recipient_last_name`, `payment_method`, `total_paid`, `packages_made`, `client_tag`, `created_at`) SELECT `id`, `order_id`, `number`, `fiscal_number`, `recipient_first_name`, `recipient_last_name`, `payment_method`, `total_paid`, `packages_made`, `client_tag`, `created_at` FROM `receipts`;--> statement-breakpoint
DROP TABLE `receipts`;--> statement-breakpoint
ALTER TABLE `__new_receipts` RENAME TO `receipts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;