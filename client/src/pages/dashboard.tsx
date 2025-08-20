import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, Trophy, Users, Clock, ExternalLink, Award, Target } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: userRegistrations, isLoading } = useQuery({
    queryKey: ["/api/users", user?.id, "registrations"],
    enabled: !!user?.id,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-hack-emerald text-white';
      case 'upcoming': return 'bg-hack-amber text-white';
      case 'completed': return 'bg-gray-400 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const activeEvents = userRegistrations?.filter((reg: any) => 
    reg.event.status === 'live' || reg.event.status === 'upcoming'
  ) || [];

  const completedEvents = userRegistrations?.filter((reg: any) => 
    reg.event.status === 'completed'
  ) || [];

  const pastEvents = userRegistrations?.filter((reg: any) => 
    reg.event.status === 'completed'
  ) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-hack-light">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hack-light">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-hack-dark mb-2" data-testid="text-dashboard-title">
            My Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Track your hackathon journey and achievements
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-hack-purple rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-hack-purple" data-testid="text-total-events">
                    {userRegistrations?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Events</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-hack-emerald rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-hack-emerald" data-testid="text-active-events">
                    {activeEvents.length}
                  </div>
                  <div className="text-sm text-gray-600">Active Events</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-hack-amber rounded-lg flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-hack-amber" data-testid="text-completed-events">
                    {completedEvents.length}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-hack-indigo rounded-lg flex items-center justify-center">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-hack-indigo">0</div>
                  <div className="text-sm text-gray-600">Achievements</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Events Tabs */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active" data-testid="tab-active">Active Events ({activeEvents.length})</TabsTrigger>
            <TabsTrigger value="completed" data-testid="tab-completed">Completed ({completedEvents.length})</TabsTrigger>
            <TabsTrigger value="all" data-testid="tab-all">All Events ({userRegistrations?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {activeEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeEvents.map((registration: any) => (
                  <Card key={registration.id} className="card-hover">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold text-hack-dark mb-2 line-clamp-1">
                            {registration.event.title}
                          </CardTitle>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(registration.event.status)}>
                              {registration.event.status?.toUpperCase()}
                            </Badge>
                            {registration.teamName && (
                              <Badge variant="outline">
                                Team: {registration.teamName}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {registration.event.shortDescription || registration.event.description}
                      </p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(registration.event.startDate).toLocaleDateString()} - {new Date(registration.event.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Users className="w-4 h-4" />
                          <span>{registration.event.currentParticipants || 0} participants</span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Link href={`/events/${registration.event.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full" data-testid={`button-view-event-${registration.event.id}`}>
                            View Event
                          </Button>
                        </Link>
                        {registration.event.status === 'live' && (
                          <Button size="sm" className="bg-hack-emerald hover:bg-emerald-600" data-testid={`button-participate-${registration.event.id}`}>
                            Participate
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Events</h3>
                <p className="text-gray-600 mb-6">
                  You don't have any ongoing or upcoming events. Join a hackathon to get started!
                </p>
                <Link href="/events">
                  <Button className="bg-hack-purple hover:bg-purple-600" data-testid="button-explore-events">
                    Explore Events
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {completedEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {completedEvents.map((registration: any) => (
                  <Card key={registration.id} className="card-hover">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold text-hack-dark mb-2 line-clamp-1">
                            {registration.event.title}
                          </CardTitle>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(registration.event.status)}>
                              COMPLETED
                            </Badge>
                            {registration.teamName && (
                              <Badge variant="outline">
                                Team: {registration.teamName}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {registration.event.shortDescription || registration.event.description}
                      </p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Completed on {new Date(registration.event.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        {registration.submissionUrl && (
                          <div className="flex items-center space-x-2 text-sm text-hack-emerald">
                            <Target className="w-4 h-4" />
                            <span>Submission made</span>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <Link href={`/events/${registration.event.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full" data-testid={`button-view-results-${registration.event.id}`}>
                            View Results
                          </Button>
                        </Link>
                        {registration.submissionUrl && (
                          <a href={registration.submissionUrl} target="_blank" rel="noopener noreferrer">
                            <Button size="sm" variant="ghost" data-testid={`button-view-submission-${registration.event.id}`}>
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Completed Events</h3>
                <p className="text-gray-600 mb-6">
                  Complete your first hackathon to see your achievements here.
                </p>
                <Link href="/events">
                  <Button className="bg-hack-purple hover:bg-purple-600" data-testid="button-join-hackathon">
                    Join a Hackathon
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="mt-6">
            {userRegistrations && userRegistrations.length > 0 ? (
              <div className="space-y-4">
                {userRegistrations.map((registration: any) => (
                  <Card key={registration.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-2">
                            <h3 className="text-lg font-semibold text-hack-dark">{registration.event.title}</h3>
                            <Badge className={getStatusColor(registration.event.status)}>
                              {registration.event.status?.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Registered on {new Date(registration.registeredAt).toLocaleDateString()}</span>
                            </div>
                            {registration.teamName && (
                              <div className="flex items-center space-x-1">
                                <Users className="w-4 h-4" />
                                <span>Team: {registration.teamName}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Link href={`/events/${registration.event.id}`}>
                          <Button variant="outline" size="sm" data-testid={`button-view-${registration.event.id}`}>
                            View Event
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Yet</h3>
                <p className="text-gray-600 mb-6">
                  Start your hackathon journey by joining an exciting event!
                </p>
                <Link href="/events">
                  <Button className="bg-hack-purple hover:bg-purple-600" data-testid="button-get-started">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
