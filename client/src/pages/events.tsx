import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Calendar, Users, Trophy, Clock, MapPin } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import EventCard from "@/components/event-card";
import SearchFilters from "@/components/search-filters";

export default function Events() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");

  const { data: events, isLoading } = useQuery({
    queryKey: ["/api/events", searchTerm, statusFilter, categoryFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter) params.append("status", statusFilter);
      if (categoryFilter) params.append("category", categoryFilter);
      
      const response = await fetch(`/api/events?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    },
  });

  const categories = [
    "Web Development",
    "Mobile Development", 
    "AI/ML",
    "Blockchain",
    "IoT",
    "Data Science",
    "Cybersecurity",
    "Game Development",
    "UI/UX Design",
    "DevOps"
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-hack-emerald text-white';
      case 'upcoming': return 'bg-hack-amber text-white';
      case 'completed': return 'bg-gray-400 text-white';
      case 'draft': return 'bg-gray-300 text-gray-700';
      default: return 'bg-gray-400 text-white';
    }
  };

  const sortEvents = (events: any[]) => {
    if (!events) return [];
    
    return [...events].sort((a, b) => {
      switch (sortBy) {
        case 'startDate':
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        case 'participants':
          return (b.currentParticipants || 0) - (a.currentParticipants || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  };

  const sortedEvents = sortEvents(events);

  return (
    <div className="min-h-screen bg-hack-light">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-hack-dark mb-4">Discover Hackathons</h1>
          <p className="text-xl text-gray-600">
            Find the perfect competition to showcase your skills and win amazing prizes
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-events"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="select-status-filter">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger data-testid="select-category-filter">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger data-testid="select-sort-by">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Latest</SelectItem>
                <SelectItem value="startDate">Start Date</SelectItem>
                <SelectItem value="participants">Most Popular</SelectItem>
                <SelectItem value="title">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-t-lg"></div>
                <div className="bg-white p-6 rounded-b-lg">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedEvents && sortedEvents.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {sortedEvents.length} event{sortedEvents.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedEvents.map((event: any) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or check back later for new events.
            </p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
                setCategoryFilter("");
              }}
              variant="outline"
              data-testid="button-clear-filters"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Quick Filters */}
        <div className="mt-12 p-6 bg-white rounded-2xl shadow-sm">
          <h3 className="text-lg font-semibold text-hack-dark mb-4">Quick Filters</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatusFilter("live")}
              className={statusFilter === "live" ? "bg-hack-emerald text-white" : ""}
              data-testid="button-filter-live"
            >
              🔴 Live Now
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStatusFilter("upcoming")}
              className={statusFilter === "upcoming" ? "bg-hack-amber text-white" : ""}
              data-testid="button-filter-upcoming"
            >
              ⏰ Starting Soon
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCategoryFilter("AI/ML")}
              className={categoryFilter === "AI/ML" ? "bg-hack-purple text-white" : ""}
              data-testid="button-filter-ai"
            >
              🤖 AI/ML
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCategoryFilter("Blockchain")}
              className={categoryFilter === "Blockchain" ? "bg-hack-indigo text-white" : ""}
              data-testid="button-filter-blockchain"
            >
              ⛓️ Blockchain
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCategoryFilter("Web Development")}
              className={categoryFilter === "Web Development" ? "bg-hack-blue text-white" : ""}
              data-testid="button-filter-web"
            >
              🌐 Web Dev
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
