import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Supabase-aligned hybrid receptionist schema.
 * These tables mirror the expected Supabase Postgres models so local MySQL
 * and generated types stay in sync with production.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  /**
   * Legacy openId support for existing auth flows. Retained for backward compatibility.
   */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const agencies = mysqlTable("agencies", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  ownerUserId: varchar("owner_user_id", { length: 36 }).notNull(),
  logoUrl: text("logo_url"),
  brandColor: varchar("brand_color", { length: 16 }),
  systemStatus: mysqlEnum("system_status", ["active", "paused"]).default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Agency = typeof agencies.$inferSelect;
export type InsertAgency = typeof agencies.$inferInsert;

export const clinics = mysqlTable("clinics", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  ghlLocationId: varchar("ghl_location_id", { length: 128 }),
  phoneNumber: varchar("phone_number", { length: 32 }),
  agencyId: varchar("agency_id", { length: 36 }),
  systemStatus: mysqlEnum("system_status", ["active", "paused"]).default("active").notNull(),
  forwardingNumber: varchar("forwarding_number", { length: 32 }),
  voice: varchar("voice", { length: 64 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Clinic = typeof clinics.$inferSelect;
export type InsertClinic = typeof clinics.$inferInsert;

export const profiles = mysqlTable("profiles", {
  id: varchar("id", { length: 36 }).primaryKey(),
  role: mysqlEnum("role", ["agency_admin", "managed_clinic", "independent_clinic"]).notNull(),
  agencyId: varchar("agency_id", { length: 36 }),
  clinicId: varchar("clinic_id", { length: 36 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type ProfileRow = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

export const calls = mysqlTable("calls", {
  id: varchar("id", { length: 36 }).primaryKey(),
  clinicId: varchar("clinic_id", { length: 36 }).notNull(),
  caller: varchar("caller", { length: 64 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  durationSeconds: int("duration_seconds"),
  status: mysqlEnum("status", ["answered", "missed", "voicemail", "routed"]).notNull(),
  summary: text("summary"),
  transcript: text("transcript"),
  recordingUrl: text("recording_url"),
  sentimentScore: decimal("sentiment_score", { precision: 4, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type CallRow = typeof calls.$inferSelect;
export type InsertCall = typeof calls.$inferInsert;

export const subscriptions = mysqlTable("subscriptions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  ownerType: mysqlEnum("owner_type", ["agency", "clinic"]).notNull(),
  ownerId: varchar("owner_id", { length: 36 }).notNull(),
  paddleSubscriptionId: varchar("paddle_subscription_id", { length: 128 }),
  status: mysqlEnum("status", ["active", "canceled", "trialing", "past_due"]).default("trialing").notNull(),
  plan: varchar("plan", { length: 128 }).default("usage_only"),
  billingEmail: varchar("billing_email", { length: 320 }),
  currentPeriodEnd: timestamp("current_period_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type SubscriptionRow = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// TODO: add relations when MySQL/Postgres parity is finalized.
