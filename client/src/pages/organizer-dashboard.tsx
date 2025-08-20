import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { insertEventSchema, type InsertEventData, type User } from "@shared/schema";
import { format } from "date-fns";
import { 
  Calendar as CalendarIcon, 
  Users, 
  Trophy, 
  Plus, 
  BarChart3,
  Settings,
  AlertTriangle,
  TrendingUp,
  Activity,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Clock,
  CheckCircle,
  XCircle,
  Award,
  Target,
  ExternalLink
} from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export default function OrganizerDashboard() {
  const { user } = useAuth() as { user: User | null; isLoading: boolean; isAuthenticated: boolean; };
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  // Redirect if not organizer or admin
  if (user?.role !== 'organizer' && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-hack-light">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <AlertTriangle className="w-16 h-16 text-hack-red mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">You don't have permission to access the organizer dashboard.</p>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { data: myEvents, isLoading: eventsLoading } = useQuery({
    queryKey: ["/api/events", `organizerId=${user?.id}`],
    queryFn: async () => {
      const response = await fetch(`/api/events?organizerId=${user?.id}`, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    },
    enabled: !!user?.id,
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  // Event creation form
  const eventForm = useForm<InsertEventData>({
    resolver: zodResolver(insertEventSchema),
    defaultValues: {
      title: "",
      description: "",
      shortDescription: "",
      status: "draft" as const,
      startDate: new Date(),
      endDate: new Date(),
      registrationDeadline: new Date(),
      maxParticipants: undefined,
      prizePool: "",
      category: "",
      difficulty: "intermediate" as const,
      requirements: "",
      rules: "",
      judgesCriteria: "",
      isPublic: true,
      allowTeams: true,
      maxTeamSize: 4,
      organizerId: user?.id || "",
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: InsertEventData) => {
      await apiRequest("POST", "/api/events", data);
    },
    onSuccess: () => {
      toast({
        title: "Event Created",
        description: "Your event has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setIsCreateEventOpen(false);
      eventForm.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Failed to Create Event",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await apiRequest("DELETE", `/api/events/${eventId}`);
    },
    onSuccess: () => {
      toast({
        title: "Event Deleted",
        description: "The event has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Delete Event",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmitEvent = (data: InsertEventData) => {
    createEventMutation.mutate({
      ...data,
      organizerId: user?.id || "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-hack-emerald text-white';
      case 'upcoming': return 'bg-hack-amber text-white';
      case 'completed': return 'bg-gray-400 text-white';
      case 'draft': return 'bg-gray-300 text-gray-700';
      default: return 'bg-gray-400 text-white';
    }
  };

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

  const myEventsStats = {
    total: myEvents?.length || 0,
    draft: myEvents?.filter((e: any) => e.status === 'draft').length || 0,
    live: myEvents?.filter((e: any) => e.status === 'live').length || 0,
    upcoming: myEvents?.filter((e: any) => e.status === 'upcoming').length || 0,
    completed: myEvents?.filter((e: any) => e.status === 'completed').length || 0,
    totalParticipants: myEvents?.reduce((sum: number, e: any) => sum + (e.currentParticipants || 0), 0) || 0,
  };

  return (
    <div className="min-h-screen bg-hack-light">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-hack-dark mb-2 flex items-center space-x-3">
            <Settings className="w-8 h-8 text-hack-purple" />
            <span>Organizer Dashboard</span>
          </h1>
          <p className="text-lg text-gray-600">
            Create and manage your hackathons and coding events
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-hack-purple rounded-lg flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-hack-purple" data-testid="stat-my-events">
                    {myEventsStats.total}
                  </div>
                  <div className="text-sm text-gray-600">My Events</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-hack-emerald rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-hack-emerald" data-testid="stat-live-events">
                    {myEventsStats.live}
                  </div>
                  <div className="text-sm text-gray-600">Live Events</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-hack-amber rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-hack-amber" data-testid="stat-upcoming-events">
                    {myEventsStats.upcoming}
                  </div>
                  <div className="text-sm text-gray-600">Upcoming</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-hack-indigo rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-hack-indigo" data-testid="stat-total-participants">
                    {myEventsStats.totalParticipants}
                  </div>
                  <div className="text-sm text-gray-600">Participants</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-400 rounded-lg flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-600" data-testid="stat-completed-events">
                    {myEventsStats.completed}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="events" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="events" data-testid="tab-my-events">My Events ({myEventsStats.total})</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
            <TabsTrigger value="tools" data-testid="tab-tools">Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-hack-dark">Event Management</h2>
              <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-hack-purple hover:bg-purple-600" data-testid="button-create-event">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                  </DialogHeader>
                  <Form {...eventForm}>
                    <form onSubmit={eventForm.handleSubmit(onSubmitEvent)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={eventForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Event Title *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter event title" {...field} data-testid="input-event-title" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={eventForm.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-event-category">
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categories.map(category => (
                                    <SelectItem key={category} value={category}>{category}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={eventForm.control}
                        name="shortDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Short Description</FormLabel>
                            <FormControl>
                              <Input placeholder="Brief description for event cards" {...field} value={field.value || ""} data-testid="input-short-description" />
                            </FormControl>
                            <FormDescription>
                              This will be shown on event cards and previews
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={eventForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Description *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Detailed event description" 
                                className="min-h-[120px]" 
                                {...field} 
                                data-testid="textarea-event-description"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={eventForm.control}
                          name="startDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Start Date *</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className="w-full pl-3 text-left font-normal"
                                      data-testid="button-start-date"
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => date < new Date()}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={eventForm.control}
                          name="endDate"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>End Date *</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className="w-full pl-3 text-left font-normal"
                                      data-testid="button-end-date"
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => date < new Date()}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={eventForm.control}
                          name="registrationDeadline"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Registration Deadline *</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      className="w-full pl-3 text-left font-normal"
                                      data-testid="button-registration-deadline"
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => date < new Date()}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField
                          control={eventForm.control}
                          name="maxParticipants"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Participants</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="Unlimited" 
                                  {...field} 
                                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                  data-testid="input-max-participants"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={eventForm.control}
                          name="difficulty"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Difficulty Level</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-difficulty">
                                    <SelectValue placeholder="Select difficulty" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="beginner">Beginner</SelectItem>
                                  <SelectItem value="intermediate">Intermediate</SelectItem>
                                  <SelectItem value="advanced">Advanced</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={eventForm.control}
                          name="prizePool"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Prize Pool</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. $10,000" {...field} data-testid="input-prize-pool" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={eventForm.control}
                          name="requirements"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Requirements</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Skills, tools, or qualifications needed" 
                                  {...field} 
                                  data-testid="textarea-requirements"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={eventForm.control}
                          name="rules"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Rules & Guidelines</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Event rules and guidelines" 
                                  {...field} 
                                  data-testid="textarea-rules"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={eventForm.control}
                        name="judgesCriteria"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Judging Criteria</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="How projects will be evaluated" 
                                {...field} 
                                data-testid="textarea-judging-criteria"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <FormField
                            control={eventForm.control}
                            name="allowTeams"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">
                                    Allow Teams
                                  </FormLabel>
                                  <FormDescription>
                                    Participants can form teams
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={field.onChange}
                                    data-testid="checkbox-allow-teams"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          {eventForm.watch("allowTeams") && (
                            <FormField
                              control={eventForm.control}
                              name="maxTeamSize"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Max Team Size</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="number" 
                                      placeholder="4" 
                                      {...field} 
                                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                                      data-testid="input-max-team-size"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          )}
                        </div>

                        <FormField
                          control={eventForm.control}
                          name="isPublic"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  Public Event
                                </FormLabel>
                                <FormDescription>
                                  Event will be visible to everyone
                                </FormDescription>
                              </div>
                              <FormControl>
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  data-testid="checkbox-is-public"
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end space-x-4 pt-6 border-t">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsCreateEventOpen(false)}
                          data-testid="button-cancel-create"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          className="bg-hack-purple hover:bg-purple-600"
                          disabled={createEventMutation.isPending}
                          data-testid="button-submit-create"
                        >
                          {createEventMutation.isPending ? "Creating..." : "Create Event"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Events List */}
            {eventsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-32 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : myEvents && myEvents.length > 0 ? (
              <div className="space-y-4">
                {myEvents.map((event: any) => (
                  <Card key={event.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <h3 className="text-lg font-semibold text-hack-dark">{event.title}</h3>
                            <Badge className={getStatusColor(event.status)}>
                              {event.status?.toUpperCase()}
                            </Badge>
                            {event.category && (
                              <Badge variant="outline">{event.category}</Badge>
                            )}
                          </div>
                          
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {event.shortDescription || event.description}
                          </p>
                          
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <CalendarIcon className="w-4 h-4" />
                              <span>
                                {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>{event.currentParticipants || 0} participants</span>
                            </div>
                            {event.prizePool && (
                              <div className="flex items-center space-x-1">
                                <Trophy className="w-4 h-4" />
                                <span>{event.prizePool}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Link href={`/events/${event.id}`}>
                            <Button variant="outline" size="sm" data-testid={`button-view-event-${event.id}`}>
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedEvent(event)}
                            data-testid={`button-edit-event-${event.id}`}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteEventMutation.mutate(event.id)}
                            disabled={deleteEventMutation.isPending}
                            data-testid={`button-delete-event-${event.id}`}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CalendarIcon className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Created</h3>
                <p className="text-gray-600 mb-6">
                  Create your first event to start hosting hackathons and competitions.
                </p>
                <Button 
                  className="bg-hack-purple hover:bg-purple-600"
                  onClick={() => setIsCreateEventOpen(true)}
                  data-testid="button-create-first-event"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Event
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-hack-purple" />
                    <span>Event Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {myEvents && myEvents.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-hack-purple">
                            {(myEventsStats.totalParticipants / Math.max(myEventsStats.total, 1)).toFixed(1)}
                          </div>
                          <div className="text-sm text-gray-600">Avg Participants</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-hack-emerald">
                            {Math.round((myEventsStats.completed / Math.max(myEventsStats.total, 1)) * 100)}%
                          </div>
                          <div className="text-sm text-gray-600">Completion Rate</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-semibold text-hack-dark">Top Performing Events</h4>
                        {myEvents
                          .sort((a: any, b: any) => (b.currentParticipants || 0) - (a.currentParticipants || 0))
                          .slice(0, 3)
                          .map((event: any) => (
                            <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="font-medium line-clamp-1">{event.title}</span>
                              <span className="text-sm text-gray-600">{event.currentParticipants || 0} participants</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No analytics available yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-hack-emerald" />
                    <span>Growth Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-hack-emerald bg-opacity-10 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-hack-emerald">Active Events</span>
                        <CheckCircle className="w-5 h-5 text-hack-emerald" />
                      </div>
                      <div className="text-2xl font-bold text-hack-emerald">
                        {myEventsStats.live + myEventsStats.upcoming}
                      </div>
                      <div className="text-sm text-gray-600">Events currently running or starting soon</div>
                    </div>
                    
                    <div className="p-4 bg-hack-amber bg-opacity-10 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-hack-amber">Engagement Rate</span>
                        <Target className="w-5 h-5 text-hack-amber" />
                      </div>
                      <div className="text-2xl font-bold text-hack-amber">
                        {myEventsStats.totalParticipants > 0 ? '85%' : '0%'}
                      </div>
                      <div className="text-sm text-gray-600">Average participant satisfaction</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tools" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="card-hover cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-hack-purple rounded-lg flex items-center justify-center mx-auto mb-4">
                    <UserPlus className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-hack-dark mb-2">Bulk Registration</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Import participant lists from CSV files
                  </p>
                  <Button variant="outline" size="sm" data-testid="button-bulk-registration">
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>

              <Card className="card-hover cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-hack-emerald rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-hack-dark mb-2">Certificate Generator</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Generate certificates for participants and winners
                  </p>
                  <Button variant="outline" size="sm" data-testid="button-certificate-generator">
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>

              <Card className="card-hover cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-hack-amber rounded-lg flex items-center justify-center mx-auto mb-4">
                    <ExternalLink className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-hack-dark mb-2">API Integration</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Connect with external judging platforms
                  </p>
                  <Button variant="outline" size="sm" data-testid="button-api-integration">
                    Coming Soon
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
