import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ["admin", "organizer", "participant"] }).default("participant"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event status enum
export const eventStatusEnum = pgEnum("event_status", ["draft", "upcoming", "live", "completed", "cancelled"]);

// Events table
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  shortDescription: text("short_description"),
  organizerId: varchar("organizer_id").notNull().references(() => users.id),
  status: eventStatusEnum("status").default("draft"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  registrationDeadline: timestamp("registration_deadline").notNull(),
  maxParticipants: integer("max_participants"),
  currentParticipants: integer("current_participants").default(0),
  prizePool: varchar("prize_pool"),
  category: varchar("category"),
  difficulty: varchar("difficulty", { enum: ["beginner", "intermediate", "advanced"] }),
  requirements: text("requirements"),
  rules: text("rules"),
  judgesCriteria: text("judges_criteria"),
  resources: jsonb("resources").$type<{ title: string; url: string; type: string }[]>().default([]),
  tags: text("tags").array().default([]),
  bannerImageUrl: varchar("banner_image_url"),
  isPublic: boolean("is_public").default(true),
  allowTeams: boolean("allow_teams").default(true),
  maxTeamSize: integer("max_team_size").default(4),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Event registrations table
export const eventRegistrations = pgTable("event_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  teamName: varchar("team_name"),
  teamMembers: jsonb("team_members").$type<{ name: string; email: string; role?: string }[]>().default([]),
  status: varchar("status", { enum: ["pending", "confirmed", "cancelled"] }).default("confirmed"),
  registeredAt: timestamp("registered_at").defaultNow(),
  submissionUrl: varchar("submission_url"),
  submissionDescription: text("submission_description"),
  submittedAt: timestamp("submitted_at"),
});

// Leaderboard table
export const leaderboard = pgTable("leaderboard", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  registrationId: varchar("registration_id").notNull().references(() => eventRegistrations.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  score: integer("score").default(0),
  prize: varchar("prize"),
  judgeFeedback: text("judge_feedback"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  organizedEvents: many(events),
  registrations: many(eventRegistrations),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  organizer: one(users, {
    fields: [events.organizerId],
    references: [users.id],
  }),
  registrations: many(eventRegistrations),
  leaderboardEntries: many(leaderboard),
}));

export const eventRegistrationsRelations = relations(eventRegistrations, ({ one }) => ({
  event: one(events, {
    fields: [eventRegistrations.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventRegistrations.userId],
    references: [users.id],
  }),
  leaderboardEntry: one(leaderboard, {
    fields: [eventRegistrations.id],
    references: [leaderboard.registrationId],
  }),
}));

export const leaderboardRelations = relations(leaderboard, ({ one }) => ({
  event: one(events, {
    fields: [leaderboard.eventId],
    references: [events.id],
  }),
  registration: one(eventRegistrations, {
    fields: [leaderboard.registrationId],
    references: [eventRegistrations.id],
  }),
}));

// Schema types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type InsertEventRegistration = typeof eventRegistrations.$inferInsert;

export type LeaderboardEntry = typeof leaderboard.$inferSelect;
export type InsertLeaderboardEntry = typeof leaderboard.$inferInsert;

// Zod schemas
export const insertEventSchema = createInsertSchema(events, {
  startDate: z.coerce.date(),
  endDate: z.coerce.date(), 
  registrationDeadline: z.coerce.date(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  currentParticipants: true,
});

export const insertRegistrationSchema = createInsertSchema(eventRegistrations).omit({
  id: true,
  registeredAt: true,
  status: true,
});

export const insertLeaderboardSchema = createInsertSchema(leaderboard).omit({
  id: true,
  createdAt: true,
});

export type InsertEventData = z.infer<typeof insertEventSchema>;
export type InsertRegistrationData = z.infer<typeof insertRegistrationSchema>;
export type InsertLeaderboardData = z.infer<typeof insertLeaderboardSchema>;
