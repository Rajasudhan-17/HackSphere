import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import type { User, Event, EventRegistration } from "@shared/schema";
import { Calendar, Users, Trophy, Plus, ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export default function Home() {
  const { user } = useAuth() as { user: User | null };
  
  const { data: userRegistrations } = useQuery<(EventRegistration & { event: Event })[]>({
    queryKey: ["/api/users", user?.id, "registrations"],
    enabled: !!user?.id,
  });

  const { data: upcomingEvents } = useQuery<Event[]>({
    queryKey: ["/api/events?status=upcoming"],
  });

  const { data: stats } = useQuery<{ totalEvents: number; totalParticipants: number; activeEvents: number; completedEvents: number }>({
    queryKey: ["/api/stats"],
  });

  return (
    <div className="min-h-screen bg-hack-light">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-hack-dark mb-2">
            Welcome back, {user?.firstName || user?.email?.split('@')[0] || 'Hacker'}! 👋
          </h1>
          <p className="text-lg text-gray-600">
            Ready to innovate? Here's what's happening in your world.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-hack-purple rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-hack-purple">
                    {userRegistrations?.length || 0}
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
                  <Trophy className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-hack-emerald">
                    {stats?.activeEvents || 0}
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
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-hack-amber">
                    {stats?.totalParticipants || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Hackers</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-hack-indigo rounded-lg flex items-center justify-center">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-hack-indigo">
                    {stats?.totalEvents || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Events</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Registrations */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-bold text-hack-dark">My Registered Events</CardTitle>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {userRegistrations && userRegistrations.length > 0 ? (
                  <div className="space-y-4">
                    {userRegistrations.slice(0, 3).map((registration: any) => (
                      <div key={registration.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold text-hack-dark">{registration.event.title}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(registration.event.startDate).toLocaleDateString()} - {new Date(registration.event.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={registration.event.status === 'live' ? 'default' : 'secondary'}>
                            {registration.event.status}
                          </Badge>
                          <Link href={`/events/${registration.event.id}`}>
                            <Button size="sm" variant="outline">View</Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Events Yet</h3>
                    <p className="text-gray-600 mb-4">Start your journey by joining an exciting hackathon!</p>
                    <Link href="/events">
                      <Button className="bg-hack-purple hover:bg-purple-600">
                        Explore Events
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-hack-dark">Trending Events</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingEvents && upcomingEvents.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingEvents.slice(0, 3).map((event: any) => (
                      <div key={event.id} className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold text-hack-dark mb-1 line-clamp-1">{event.title}</h3>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {event.shortDescription || event.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Users className="w-3 h-3" />
                            <span>{event.currentParticipants || 0}</span>
                          </div>
                          <Link href={`/events/${event.id}`}>
                            <Button size="sm" variant="ghost" className="text-hack-purple hover:text-purple-600">
                              Join
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trophy className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-600 text-sm">No upcoming events available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 p-6 bg-gradient-to-r from-hack-purple to-hack-indigo rounded-2xl text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Ready for Your Next Challenge?</h2>
              <p className="text-purple-100">
                Discover new hackathons and push your limits with innovative projects.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-4">
              <Link href="/events">
                <Button className="bg-white text-hack-purple hover:bg-gray-50">
                  Browse Events
                </Button>
              </Link>
              {(user?.role === 'admin' || user?.role === 'organizer') && (
                <Link href="/organizer">
                  <Button variant="outline" className="border-white text-white hover:bg-white hover:text-hack-purple">
                    Host Event
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
