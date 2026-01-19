ALTER TABLE "history_prices" DROP CONSTRAINT "history_prices_product_alert_id_product_alerts_id_fk";
--> statement-breakpoint
ALTER TABLE "product_alerts" DROP CONSTRAINT "product_alerts_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "history_prices" ADD CONSTRAINT "history_prices_product_alert_id_product_alerts_id_fk" FOREIGN KEY ("product_alert_id") REFERENCES "public"."product_alerts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_alerts" ADD CONSTRAINT "product_alerts_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;