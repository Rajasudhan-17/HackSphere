import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Code, Users, Trophy, Search, Calendar, ArrowRight, Star, Award, Target } from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useQuery } from "@tanstack/react-query";
import type { Event } from "@shared/schema";

export default function Landing() {
  const { data: stats } = useQuery<{ totalEvents: number; totalParticipants: number; activeEvents: number; completedEvents: number }>({
    queryKey: ["/api/stats"],
    retry: false,
  });

  const { data: featuredEvents } = useQuery<Event[]>({
    queryKey: ["/api/events?status=live"],
    retry: false,
  });

  return (
    <div className="min-h-screen bg-hack-light">
      <Navbar />
      
      {/* Hero Section */}
      <section className="gradient-bg text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="asymmetric-padding">
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Where Innovation
                <span className="block text-hack-amber">Meets Competition</span>
              </h1>
              <p className="text-xl text-purple-100 mb-8 max-w-lg">
                Join the premier platform for hackathons, coding competitions, and tech innovation events. 
                Connect with brilliant minds and build the future.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/events">
                  <Button size="lg" className="bg-white text-hack-purple hover:bg-gray-50 font-semibold">
                    Explore Events
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white hover:text-hack-purple font-semibold"
                  onClick={() => window.location.href = "/api/login"}
                >
                  Host an Event
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Team collaboration during hackathon" 
                className="organic-border w-full h-96 object-cover shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-hack-emerald text-white p-6 rounded-2xl shadow-xl">
                <div className="text-3xl font-bold">{stats?.activeEvents || 150}+</div>
                <div className="text-emerald-100">Active Events</div>
              </div>
              <div className="absolute -top-6 -right-6 bg-hack-amber text-white p-6 rounded-2xl shadow-xl">
                <div className="text-3xl font-bold">{stats?.totalParticipants ? `${Math.floor(stats.totalParticipants / 1000)}K` : '25K'}+</div>
                <div className="text-yellow-100">Participants</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-hack-dark mb-4">Featured Hackathons</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join these trending competitions and showcase your skills to the world
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredEvents?.slice(0, 3).map((event: any) => (
              <Card key={event.id} className="card-hover bg-white shadow-lg border border-gray-100">
                <img 
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250" 
                  alt="Hackathon coding event" 
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="bg-hack-emerald text-white">
                      {event.status?.toUpperCase() || 'LIVE'}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {new Date(event.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-hack-dark mb-2 line-clamp-1">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {event.shortDescription || event.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-hack-purple" />
                      <span className="text-sm text-gray-600">
                        {event.currentParticipants || 0} registered
                      </span>
                    </div>
                    <Link href={`/events/${event.id}`}>
                      <Button size="sm" className="bg-hack-purple hover:bg-purple-600">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )) || (
              // Show placeholder cards if no events
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="card-hover bg-white shadow-lg border border-gray-100">
                  <img 
                    src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250" 
                    alt="Hackathon placeholder" 
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className="bg-gray-400 text-white">UPCOMING</Badge>
                      <span className="text-sm text-gray-500">Coming Soon</span>
                    </div>
                    <h3 className="text-xl font-bold text-hack-dark mb-2">
                      Exciting Hackathons Coming Soon
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Stay tuned for amazing competitions and challenges.
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-hack-purple" />
                        <span className="text-sm text-gray-600">Registration opens soon</span>
                      </div>
                      <Button size="sm" className="bg-hack-purple hover:bg-purple-600">
                        Coming Soon
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="text-center">
            <Link href="/events">
              <Button size="lg" className="bg-hack-indigo hover:bg-indigo-600">
                View All Events
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-hack-dark mb-6">
                Empowering Innovation
                <span className="block text-hack-purple">Across the Globe</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                HackSphere has become the trusted platform for organizers and participants worldwide, 
                fostering creativity and breakthrough innovations.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <Card className="p-6">
                  <div className="text-3xl font-bold text-hack-purple mb-2">
                    {stats?.totalEvents || 500}+
                  </div>
                  <div className="text-gray-600">Events Hosted</div>
                </Card>
                <Card className="p-6">
                  <div className="text-3xl font-bold text-hack-emerald mb-2">
                    {stats?.totalParticipants ? `${Math.floor(stats.totalParticipants / 1000)}K` : '50K'}+
                  </div>
                  <div className="text-gray-600">Participants</div>
                </Card>
                <Card className="p-6">
                  <div className="text-3xl font-bold text-hack-amber mb-2">$2M+</div>
                  <div className="text-gray-600">Prizes Awarded</div>
                </Card>
                <Card className="p-6">
                  <div className="text-3xl font-bold text-hack-red mb-2">45+</div>
                  <div className="text-gray-600">Countries</div>
                </Card>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1553028826-f4804a6dba3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=500" 
                alt="Modern innovation workspace" 
                className="w-full h-96 object-cover rounded-3xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent rounded-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-hack-dark mb-4">How HackSphere Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Getting started is simple. Follow these steps to join or host your next hackathon.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-hack-purple rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Users className="text-white w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-hack-dark mb-4">1. Create Account</h3>
              <p className="text-gray-600">
                Sign up with your email or social accounts. Choose your role as participant or organizer.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-hack-emerald rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Search className="text-white w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-hack-dark mb-4">2. Discover Events</h3>
              <p className="text-gray-600">
                Browse through hundreds of hackathons, filter by technology, difficulty, and prizes.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-hack-amber rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Trophy className="text-white w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-hack-dark mb-4">3. Compete & Win</h3>
              <p className="text-gray-600">
                Join teams, build amazing projects, and compete for prizes and recognition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 gradient-bg text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Build the Future?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of innovators on HackSphere. Whether you're here to compete or organize, 
            your next breakthrough is just one event away.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-hack-purple hover:bg-gray-50 font-semibold text-lg"
              onClick={() => window.location.href = "/api/login"}
            >
              Join as Participant
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white hover:text-hack-purple font-semibold text-lg"
              onClick={() => window.location.href = "/api/login"}
            >
              Become an Organizer
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
