import {
  users,
  events,
  eventRegistrations,
  leaderboard,
  type User,
  type UpsertUser,
  type Event,
  type InsertEvent,
  type EventRegistration,
  type InsertEventRegistration,
  type LeaderboardEntry,
  type InsertLeaderboardEntry,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, ilike, gte, lte, count, sql } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Event operations
  getEvents(filters?: {
    status?: string;
    category?: string;
    search?: string;
    organizerId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Event[]>;
  getEvent(id: string): Promise<Event | undefined>;
  getEventWithDetails(id: string): Promise<(Event & { organizer: User; registrations: EventRegistration[] }) | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: string): Promise<void>;
  
  // Registration operations
  getEventRegistrations(eventId: string): Promise<(EventRegistration & { user: User })[]>;
  getUserRegistrations(userId: string): Promise<(EventRegistration & { event: Event })[]>;
  getRegistration(eventId: string, userId: string): Promise<EventRegistration | undefined>;
  createRegistration(registration: InsertEventRegistration): Promise<EventRegistration>;
  updateRegistration(id: string, registration: Partial<InsertEventRegistration>): Promise<EventRegistration>;
  deleteRegistration(id: string): Promise<void>;
  
  // Leaderboard operations
  getEventLeaderboard(eventId: string): Promise<(LeaderboardEntry & { registration: EventRegistration & { user: User } })[]>;
  createLeaderboardEntry(entry: InsertLeaderboardEntry): Promise<LeaderboardEntry>;
  updateLeaderboardEntry(id: string, entry: Partial<InsertLeaderboardEntry>): Promise<LeaderboardEntry>;
  
  // Stats operations
  getStats(): Promise<{
    totalEvents: number;
    totalParticipants: number;
    activeEvents: number;
    completedEvents: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Event operations
  async getEvents(filters?: {
    status?: string;
    category?: string;
    search?: string;
    organizerId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Event[]> {
    let query = db.select().from(events);
    
    const conditions = [];
    
    if (filters?.status) {
      conditions.push(eq(events.status, filters.status as any));
    }
    
    if (filters?.category) {
      conditions.push(eq(events.category, filters.category));
    }
    
    if (filters?.search) {
      conditions.push(
        or(
          ilike(events.title, `%${filters.search}%`),
          ilike(events.description, `%${filters.search}%`)
        )
      );
    }
    
    if (filters?.organizerId) {
      conditions.push(eq(events.organizerId, filters.organizerId));
    }
    
    if (filters?.startDate) {
      conditions.push(gte(events.startDate, filters.startDate));
    }
    
    if (filters?.endDate) {
      conditions.push(lte(events.endDate, filters.endDate));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query.orderBy(desc(events.createdAt));
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async getEventWithDetails(id: string): Promise<(Event & { organizer: User; registrations: EventRegistration[] }) | undefined> {
    const [eventResult] = await db
      .select()
      .from(events)
      .leftJoin(users, eq(events.organizerId, users.id))
      .where(eq(events.id, id));

    if (!eventResult || !eventResult.events) return undefined;

    const registrations = await db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.eventId, id));

    return {
      ...eventResult.events,
      organizer: eventResult.users!,
      registrations,
    };
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event> {
    const [updatedEvent] = await db
      .update(events)
      .set({ ...event, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return updatedEvent;
  }

  async deleteEvent(id: string): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  // Registration operations
  async getEventRegistrations(eventId: string): Promise<(EventRegistration & { user: User })[]> {
    const registrations = await db
      .select()
      .from(eventRegistrations)
      .leftJoin(users, eq(eventRegistrations.userId, users.id))
      .where(eq(eventRegistrations.eventId, eventId));

    return registrations.map(reg => ({
      ...reg.event_registrations!,
      user: reg.users!,
    }));
  }

  async getUserRegistrations(userId: string): Promise<(EventRegistration & { event: Event })[]> {
    const registrations = await db
      .select()
      .from(eventRegistrations)
      .leftJoin(events, eq(eventRegistrations.eventId, events.id))
      .where(eq(eventRegistrations.userId, userId));

    return registrations.map(reg => ({
      ...reg.event_registrations!,
      event: reg.events!,
    }));
  }

  async getRegistration(eventId: string, userId: string): Promise<EventRegistration | undefined> {
    const [registration] = await db
      .select()
      .from(eventRegistrations)
      .where(
        and(
          eq(eventRegistrations.eventId, eventId),
          eq(eventRegistrations.userId, userId)
        )
      );
    return registration;
  }

  async createRegistration(registration: InsertEventRegistration): Promise<EventRegistration> {
    const [newRegistration] = await db
      .insert(eventRegistrations)
      .values(registration)
      .returning();

    // Update event participant count
    await db
      .update(events)
      .set({ 
        currentParticipants: sql`${events.currentParticipants} + 1` 
      })
      .where(eq(events.id, registration.eventId));

    return newRegistration;
  }

  async updateRegistration(id: string, registration: Partial<InsertEventRegistration>): Promise<EventRegistration> {
    const [updatedRegistration] = await db
      .update(eventRegistrations)
      .set(registration)
      .where(eq(eventRegistrations.id, id))
      .returning();
    return updatedRegistration;
  }

  async deleteRegistration(id: string): Promise<void> {
    const [registration] = await db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.id, id));

    await db.delete(eventRegistrations).where(eq(eventRegistrations.id, id));

    if (registration) {
      // Update event participant count
      await db
        .update(events)
        .set({ 
          currentParticipants: sql`${events.currentParticipants} - 1` 
        })
        .where(eq(events.id, registration.eventId));
    }
  }

  // Leaderboard operations
  async getEventLeaderboard(eventId: string): Promise<(LeaderboardEntry & { registration: EventRegistration & { user: User } })[]> {
    const leaderboardEntries = await db
      .select()
      .from(leaderboard)
      .leftJoin(eventRegistrations, eq(leaderboard.registrationId, eventRegistrations.id))
      .leftJoin(users, eq(eventRegistrations.userId, users.id))
      .where(eq(leaderboard.eventId, eventId))
      .orderBy(asc(leaderboard.position));

    return leaderboardEntries.map(entry => ({
      ...entry.leaderboard!,
      registration: {
        ...entry.event_registrations!,
        user: entry.users!,
      },
    }));
  }

  async createLeaderboardEntry(entry: InsertLeaderboardEntry): Promise<LeaderboardEntry> {
    const [newEntry] = await db.insert(leaderboard).values(entry).returning();
    return newEntry;
  }

  async updateLeaderboardEntry(id: string, entry: Partial<InsertLeaderboardEntry>): Promise<LeaderboardEntry> {
    const [updatedEntry] = await db
      .update(leaderboard)
      .set(entry)
      .where(eq(leaderboard.id, id))
      .returning();
    return updatedEntry;
  }

  // Stats operations
  async getStats(): Promise<{
    totalEvents: number;
    totalParticipants: number;
    activeEvents: number;
    completedEvents: number;
  }> {
    const [totalEventsResult] = await db.select({ count: count() }).from(events);
    const [totalParticipantsResult] = await db.select({ count: count() }).from(eventRegistrations);
    const [activeEventsResult] = await db
      .select({ count: count() })
      .from(events)
      .where(eq(events.status, "live"));
    const [completedEventsResult] = await db
      .select({ count: count() })
      .from(events)
      .where(eq(events.status, "completed"));

    return {
      totalEvents: totalEventsResult.count,
      totalParticipants: totalParticipantsResult.count,
      activeEvents: activeEventsResult.count,
      completedEvents: completedEventsResult.count,
    };
  }
}

export const storage = new DatabaseStorage();
