ALTER TABLE `addresses` ADD `client_tag` text;--> statement-breakpoint
ALTER TABLE `customers` ADD `client_tag` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `client_tag` text;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_addresses` (
	`customer_id` integer NOT NULL,
	`order_id` integer,
	`postal_code` text NOT NULL,
	`street` text NOT NULL,
	`apartament` text,
	`country_tag` text NOT NULL,
	`city` text NOT NULL,
	`client_tag` text,
	CONSTRAINT `fk_addresses_customer_id_customers_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_addresses`(`customer_id`, `order_id`, `postal_code`, `street`, `apartament`, `country_tag`, `city`) SELECT `customer_id`, `order_id`, `postal_code`, `street`, `apartament`, `country_tag`, `city` FROM `addresses`;--> statement-breakpoint
DROP TABLE `addresses`;--> statement-breakpoint
ALTER TABLE `__new_addresses` RENAME TO `addresses`;--> statement-breakpoint
PRAGMA foreign_keys=ON;