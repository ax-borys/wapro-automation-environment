ALTER TABLE `products` ADD `stock` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
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
	`created_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_receipts`(`id`, `order_id`, `number`, `fiscal_number`, `recipient_first_name`, `recipient_last_name`, `payment_method`, `total_paid`, `packages_made`, `client_tag`, `created_at`) SELECT `id`, `order_id`, `number`, `fiscal_number`, `recipient_first_name`, `recipient_last_name`, `payment_method`, `total_paid`, `packages_made`, `client_tag`, `created_at` FROM `receipts`;--> statement-breakpoint
DROP TABLE `receipts`;--> statement-breakpoint
ALTER TABLE `__new_receipts` RENAME TO `receipts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;