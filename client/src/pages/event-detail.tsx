import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { 
  Calendar, 
  Users, 
  Trophy, 
  Clock, 
  MapPin, 
  Star, 
  Share2, 
  BookOpen, 
  Target,
  Award,
  ExternalLink,
  FileText,
  UserPlus
} from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import Leaderboard from "@/components/leaderboard";

export default function EventDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isRegistering, setIsRegistering] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamMembers, setTeamMembers] = useState([{ name: "", email: "" }]);

  const { data: event, isLoading } = useQuery({
    queryKey: ["/api/events", id],
    enabled: !!id,
  });

  const { data: userRegistration } = useQuery({
    queryKey: ["/api/events", id, "registration", user?.id],
    queryFn: async () => {
      if (!user?.id || !id) return null;
      const registrations = await fetch(`/api/users/${user.id}/registrations`, {
        credentials: "include",
      });
      if (!registrations.ok) return null;
      const data = await registrations.json();
      return data.find((reg: any) => reg.eventId === id);
    },
    enabled: !!user?.id && !!id,
  });

  const registerMutation = useMutation({
    mutationFn: async (registrationData: any) => {
      await apiRequest("POST", `/api/events/${id}/register`, registrationData);
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful!",
        description: "You've been registered for this hackathon.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events", id] });
      queryClient.invalidateQueries({ queryKey: ["/api/events", id, "registration", user?.id] });
      setIsRegistering(false);
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
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRegister = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to register for events.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    const registrationData: any = {};
    
    if (event?.allowTeams && teamName) {
      registrationData.teamName = teamName;
      registrationData.teamMembers = teamMembers.filter(member => member.name && member.email);
    }

    registerMutation.mutate(registrationData);
  };

  const addTeamMember = () => {
    if (teamMembers.length < (event?.maxTeamSize || 4)) {
      setTeamMembers([...teamMembers, { name: "", email: "" }]);
    }
  };

  const removeTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index));
  };

  const updateTeamMember = (index: number, field: string, value: string) => {
    const updated = [...teamMembers];
    updated[index] = { ...updated[index], [field]: value };
    setTeamMembers(updated);
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

  const isRegistrationOpen = () => {
    if (!event) return false;
    const now = new Date();
    const registrationDeadline = new Date(event.registrationDeadline);
    return event.status === 'upcoming' && now <= registrationDeadline;
  };

  const canRegister = () => {
    return isRegistrationOpen() && !userRegistration && 
           (!event.maxParticipants || event.currentParticipants < event.maxParticipants);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-hack-light">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-hack-light">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
            <p className="text-gray-600 mb-6">The event you're looking for doesn't exist or has been removed.</p>
            <Link href="/events">
              <Button>Browse Events</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hack-light">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="relative mb-8">
          <div className="h-64 bg-gradient-to-r from-hack-purple to-hack-indigo rounded-2xl overflow-hidden">
            {event.bannerImageUrl ? (
              <img 
                src={event.bannerImageUrl} 
                alt={event.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-hack-purple to-hack-indigo" />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
              <div className="p-8 text-white">
                <div className="flex items-center space-x-4 mb-4">
                  <Badge className={getStatusColor(event.status)}>
                    {event.status?.toUpperCase()}
                  </Badge>
                  {event.category && (
                    <Badge variant="outline" className="bg-white bg-opacity-20 text-white border-white">
                      {event.category}
                    </Badge>
                  )}
                  {event.difficulty && (
                    <Badge variant="outline" className="bg-white bg-opacity-20 text-white border-white">
                      {event.difficulty}
                    </Badge>
                  )}
                </div>
                <h1 className="text-4xl font-bold mb-2" data-testid="text-event-title">{event.title}</h1>
                <p className="text-xl text-gray-200" data-testid="text-event-organizer">
                  Organized by {event.organizer?.firstName || event.organizer?.email}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
                <TabsTrigger value="details" data-testid="tab-details">Details</TabsTrigger>
                <TabsTrigger value="resources" data-testid="tab-resources">Resources</TabsTrigger>
                <TabsTrigger value="leaderboard" data-testid="tab-leaderboard">Leaderboard</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <BookOpen className="w-5 h-5 text-hack-purple" />
                      <span>Event Overview</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed mb-6" data-testid="text-event-description">
                      {event.description}
                    </p>
                    
                    {event.requirements && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-hack-dark mb-3 flex items-center">
                          <Target className="w-5 h-5 text-hack-purple mr-2" />
                          Requirements
                        </h3>
                        <p className="text-gray-700" data-testid="text-event-requirements">{event.requirements}</p>
                      </div>
                    )}

                    {event.tags && event.tags.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-hack-dark mb-3">Technologies</h3>
                        <div className="flex flex-wrap gap-2">
                          {event.tags.map((tag: string, index: number) => (
                            <Badge key={index} variant="secondary" data-testid={`tag-${index}`}>
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-hack-purple" />
                      <span>Event Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {event.rules && (
                      <div>
                        <h3 className="text-lg font-semibold text-hack-dark mb-3">Rules & Guidelines</h3>
                        <div className="prose max-w-none text-gray-700" data-testid="text-event-rules">
                          {event.rules.split('\n').map((line: string, index: number) => (
                            <p key={index}>{line}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {event.judgesCriteria && (
                      <div>
                        <h3 className="text-lg font-semibold text-hack-dark mb-3">Judging Criteria</h3>
                        <div className="prose max-w-none text-gray-700" data-testid="text-event-criteria">
                          {event.judgesCriteria.split('\n').map((line: string, index: number) => (
                            <p key={index}>{line}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    {event.prizePool && (
                      <div>
                        <h3 className="text-lg font-semibold text-hack-dark mb-3 flex items-center">
                          <Trophy className="w-5 h-5 text-hack-amber mr-2" />
                          Prize Pool
                        </h3>
                        <p className="text-2xl font-bold text-hack-amber" data-testid="text-event-prize">
                          {event.prizePool}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="resources" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <ExternalLink className="w-5 h-5 text-hack-purple" />
                      <span>Resources & Links</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {event.resources && event.resources.length > 0 ? (
                      <div className="space-y-4">
                        {event.resources.map((resource: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <h4 className="font-semibold text-hack-dark">{resource.title}</h4>
                              <p className="text-sm text-gray-600">{resource.type}</p>
                            </div>
                            <a 
                              href={resource.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-hack-purple hover:text-purple-600"
                              data-testid={`link-resource-${index}`}
                            >
                              <ExternalLink className="w-5 h-5" />
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <ExternalLink className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No resources available yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="leaderboard" className="mt-6">
                <Leaderboard eventId={id!} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-hack-dark">
                  {userRegistration ? "You're Registered!" : "Join This Hackathon"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Event Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-hack-purple" data-testid="text-participant-count">
                        {event.currentParticipants || 0}
                      </div>
                      <div className="text-sm text-gray-600">Participants</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-hack-emerald">
                        {event.maxParticipants ? event.maxParticipants - (event.currentParticipants || 0) : '∞'}
                      </div>
                      <div className="text-sm text-gray-600">Spots Left</div>
                    </div>
                  </div>

                  {/* Registration Button */}
                  {userRegistration ? (
                    <div className="space-y-3">
                      <div className="p-4 bg-hack-emerald bg-opacity-10 border border-hack-emerald rounded-lg">
                        <div className="flex items-center space-x-2 text-hack-emerald">
                          <UserPlus className="w-5 h-5" />
                          <span className="font-semibold">Successfully Registered</span>
                        </div>
                        {userRegistration.teamName && (
                          <p className="text-sm text-gray-600 mt-1">
                            Team: {userRegistration.teamName}
                          </p>
                        )}
                      </div>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/dashboard">View My Events</Link>
                      </Button>
                    </div>
                  ) : canRegister() ? (
                    <Dialog open={isRegistering} onOpenChange={setIsRegistering}>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-hack-purple hover:bg-purple-600" data-testid="button-register">
                          Register Now
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Register for {event.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          {event.allowTeams && (
                            <>
                              <div>
                                <Label htmlFor="teamName">Team Name (Optional)</Label>
                                <Input
                                  id="teamName"
                                  value={teamName}
                                  onChange={(e) => setTeamName(e.target.value)}
                                  placeholder="Enter team name"
                                  data-testid="input-team-name"
                                />
                              </div>

                              <div>
                                <Label>Team Members (Optional)</Label>
                                {teamMembers.map((member, index) => (
                                  <div key={index} className="flex space-x-2 mt-2">
                                    <Input
                                      placeholder="Name"
                                      value={member.name}
                                      onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                                      data-testid={`input-member-name-${index}`}
                                    />
                                    <Input
                                      placeholder="Email"
                                      type="email"
                                      value={member.email}
                                      onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                                      data-testid={`input-member-email-${index}`}
                                    />
                                    {index > 0 && (
                                      <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeTeamMember(index)}
                                        data-testid={`button-remove-member-${index}`}
                                      >
                                        Remove
                                      </Button>
                                    )}
                                  </div>
                                ))}
                                {teamMembers.length < (event.maxTeamSize || 4) && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addTeamMember}
                                    className="mt-2"
                                    data-testid="button-add-member"
                                  >
                                    Add Team Member
                                  </Button>
                                )}
                              </div>
                            </>
                          )}

                          <div className="flex space-x-2">
                            <Button
                              onClick={handleRegister}
                              disabled={registerMutation.isPending}
                              className="flex-1 bg-hack-purple hover:bg-purple-600"
                              data-testid="button-confirm-register"
                            >
                              {registerMutation.isPending ? "Registering..." : "Confirm Registration"}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setIsRegistering(false)}
                              data-testid="button-cancel-register"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <div className="space-y-2">
                      <Button disabled className="w-full" data-testid="button-registration-closed">
                        {!isRegistrationOpen() ? "Registration Closed" : "Event Full"}
                      </Button>
                      {!isAuthenticated && (
                        <p className="text-sm text-center text-gray-600">
                          <Button 
                            variant="link" 
                            className="p-0 h-auto font-normal text-hack-purple"
                            onClick={() => window.location.href = "/api/login"}
                            data-testid="button-login-to-register"
                          >
                            Sign in
                          </Button>
                          {" "}to register for events
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Event Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-hack-dark">Event Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-hack-purple" />
                  <div>
                    <div className="font-semibold text-hack-dark">Start Date</div>
                    <div className="text-sm text-gray-600" data-testid="text-start-date">
                      {new Date(event.startDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-hack-amber" />
                  <div>
                    <div className="font-semibold text-hack-dark">End Date</div>
                    <div className="text-sm text-gray-600" data-testid="text-end-date">
                      {new Date(event.endDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Trophy className="w-5 h-5 text-hack-red" />
                  <div>
                    <div className="font-semibold text-hack-dark">Registration Deadline</div>
                    <div className="text-sm text-gray-600" data-testid="text-registration-deadline">
                      {new Date(event.registrationDeadline).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                {event.allowTeams && (
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-hack-emerald" />
                    <div>
                      <div className="font-semibold text-hack-dark">Team Size</div>
                      <div className="text-sm text-gray-600" data-testid="text-team-size">
                        Up to {event.maxTeamSize || 4} members
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Share */}
            <Card>
              <CardContent className="pt-6">
                <Button variant="outline" className="w-full" data-testid="button-share">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Event
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
