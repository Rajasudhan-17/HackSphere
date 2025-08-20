import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { insertEventSchema, insertRegistrationSchema, insertLeaderboardSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      if (process.env.DISABLE_AUTH === 'true') {
        return res.json(null);
      }
      if (!req.isAuthenticated() || !req.user?.claims?.sub) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Event routes
  app.get('/api/events', async (req, res) => {
    try {
      const { status, category, search, organizerId, startDate, endDate } = req.query;
      
      const filters: any = {};
      if (status) filters.status = status as string;
      if (category) filters.category = category as string;
      if (search) filters.search = search as string;
      if (organizerId) filters.organizerId = organizerId as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const events = await storage.getEvents(filters);
      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get('/api/events/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const event = await storage.getEventWithDetails(id);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.post('/api/events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || (user.role !== 'admin' && user.role !== 'organizer')) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const eventData = insertEventSchema.parse({
        ...req.body,
        organizerId: userId,
        resources: Array.isArray(req.body.resources) 
          ? req.body.resources as { title: string; url: string; type: string }[]
          : [],
        tags: Array.isArray(req.body.tags) ? req.body.tags as string[] : [],
      });

      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.patch('/api/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      if (!user || (user.role !== 'admin' && event.organizerId !== userId)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const updateData = insertEventSchema.partial().parse({
        ...req.body,
        resources: Array.isArray(req.body.resources) 
          ? req.body.resources as { title: string; url: string; type: string }[]
          : undefined,
        tags: Array.isArray(req.body.tags) ? req.body.tags as string[] : undefined,
      });
      const updatedEvent = await storage.updateEvent(id, updateData);
      res.json(updatedEvent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete('/api/events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      if (!user || (user.role !== 'admin' && event.organizerId !== userId)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      await storage.deleteEvent(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Registration routes
  app.get('/api/events/:eventId/registrations', isAuthenticated, async (req: any, res) => {
    try {
      const { eventId } = req.params;
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      if (!user || (user.role !== 'admin' && event.organizerId !== userId)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const registrations = await storage.getEventRegistrations(eventId);
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching registrations:", error);
      res.status(500).json({ message: "Failed to fetch registrations" });
    }
  });

  app.get('/api/users/:userId/registrations', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const currentUserId = req.user.claims.sub;
      const user = await storage.getUser(currentUserId);

      if (!user || (user.role !== 'admin' && currentUserId !== userId)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const registrations = await storage.getUserRegistrations(userId);
      res.json(registrations);
    } catch (error) {
      console.error("Error fetching user registrations:", error);
      res.status(500).json({ message: "Failed to fetch user registrations" });
    }
  });

  app.post('/api/events/:eventId/register', isAuthenticated, async (req: any, res) => {
    try {
      const { eventId } = req.params;
      const userId = req.user.claims.sub;

      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      if (event.status !== 'upcoming') {
        return res.status(400).json({ message: "Registration is not open for this event" });
      }

      if (new Date() > event.registrationDeadline) {
        return res.status(400).json({ message: "Registration deadline has passed" });
      }

      if (event.maxParticipants && event.currentParticipants && event.currentParticipants >= event.maxParticipants) {
        return res.status(400).json({ message: "Event is full" });
      }

      const existingRegistration = await storage.getRegistration(eventId, userId);
      if (existingRegistration) {
        return res.status(400).json({ message: "Already registered for this event" });
      }

      const registrationData = insertRegistrationSchema.parse({
        eventId,
        userId,
        teamName: req.body.teamName || null,
        teamMembers: Array.isArray(req.body.teamMembers) 
          ? req.body.teamMembers as { name: string; email: string; role?: string }[]
          : [],
      });

      const registration = await storage.createRegistration(registrationData);
      res.status(201).json(registration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid registration data", errors: error.errors });
      }
      console.error("Error creating registration:", error);
      res.status(500).json({ message: "Failed to register for event" });
    }
  });

  app.delete('/api/registrations/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      // Get registration to check ownership
      const registrations = await storage.getUserRegistrations(userId);
      const registration = registrations.find(r => r.id === id);

      if (!registration && user?.role !== 'admin') {
        return res.status(404).json({ message: "Registration not found" });
      }

      await storage.deleteRegistration(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error canceling registration:", error);
      res.status(500).json({ message: "Failed to cancel registration" });
    }
  });

  // Leaderboard routes
  app.get('/api/events/:eventId/leaderboard', async (req, res) => {
    try {
      const { eventId } = req.params;
      const leaderboard = await storage.getEventLeaderboard(eventId);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  app.post('/api/events/:eventId/leaderboard', isAuthenticated, async (req: any, res) => {
    try {
      const { eventId } = req.params;
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      if (!user || (user.role !== 'admin' && event.organizerId !== userId)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const entryData = insertLeaderboardSchema.parse({
        eventId,
        ...req.body,
      });

      const entry = await storage.createLeaderboardEntry(entryData);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid leaderboard data", errors: error.errors });
      }
      console.error("Error creating leaderboard entry:", error);
      res.status(500).json({ message: "Failed to create leaderboard entry" });
    }
  });

  // Stats route
  app.get('/api/stats', async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Admin routes
  app.patch('/api/users/:userId/role', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      const currentUserId = req.user.claims.sub;
      const currentUser = await storage.getUser(currentUserId);

      if (!currentUser || currentUser.role !== 'admin') {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      if (!['admin', 'organizer', 'participant'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const updatedUser = await storage.upsertUser({ id: userId, role });
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
