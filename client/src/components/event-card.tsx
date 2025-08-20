import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Trophy, Clock, MapPin } from "lucide-react";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description: string;
    shortDescription?: string;
    status: string;
    startDate: string;
    endDate: string;
    currentParticipants: number;
    maxParticipants?: number;
    category?: string;
    difficulty?: string;
    prizePool?: string;
    bannerImageUrl?: string;
    organizer?: {
      firstName?: string;
      lastName?: string;
      email: string;
    };
  };
}

export default function EventCard({ event }: EventCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-hack-emerald text-white';
      case 'upcoming': return 'bg-hack-amber text-white';
      case 'completed': return 'bg-gray-400 text-white';
      case 'draft': return 'bg-gray-300 text-gray-700';
      default: return 'bg-gray-400 text-white';
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDefaultImage = () => {
    const images = [
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
      "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250",
    ];
    const index = event.id.length % images.length;
    return images[index];
  };

  const isRegistrationOpen = () => {
    const now = new Date();
    const registrationDeadline = new Date(event.registrationDeadline);
    return (event.status === 'upcoming' || event.status === 'live') && now <= registrationDeadline;
  };

  const timeUntilStart = () => {
    const now = new Date();
    const start = new Date(event.startDate);
    const diffTime = start.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} to go`;
    } else if (event.status === 'live') {
      return 'Live now';
    } else {
      return 'Event ended';
    }
  };

  return (
    <Card className="card-hover bg-white shadow-lg border border-gray-100 overflow-hidden">
      {/* Event Image */}
      <div className="relative">
        <img 
          src={event.bannerImageUrl || getDefaultImage()} 
          alt={event.title} 
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 left-4 flex items-center space-x-2">
          <Badge className={getStatusColor(event.status)}>
            {event.status?.toUpperCase()}
          </Badge>
          {event.category && (
            <Badge variant="secondary" className="bg-white bg-opacity-90 text-hack-dark">
              {event.category}
            </Badge>
          )}
        </div>
        {event.difficulty && (
          <div className="absolute top-4 right-4">
            <Badge className={getDifficultyColor(event.difficulty)}>
              {event.difficulty}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-6">
        {/* Event Header */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-hack-dark mb-2 line-clamp-1" data-testid={`event-title-${event.id}`}>
            {event.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2" data-testid={`event-description-${event.id}`}>
            {event.shortDescription || event.description}
          </p>
        </div>

        {/* Event Metadata */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-hack-purple" />
            <span data-testid={`event-date-${event.id}`}>
              {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-hack-amber" />
            <span data-testid={`event-time-${event.id}`}>{timeUntilStart()}</span>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="w-4 h-4 text-hack-emerald" />
            <span data-testid={`event-participants-${event.id}`}>
              {event.currentParticipants || 0} registered
              {event.maxParticipants && ` / ${event.maxParticipants} max`}
            </span>
          </div>

          {event.prizePool && (
            <div className="flex items-center space-x-2 text-sm text-hack-amber font-semibold">
              <Trophy className="w-4 h-4" />
              <span data-testid={`event-prize-${event.id}`}>{event.prizePool}</span>
            </div>
          )}
        </div>

        {/* Organizer Info */}
        {event.organizer && (
          <div className="mb-4 text-xs text-gray-500">
            Organized by {event.organizer.firstName || event.organizer.email}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm">
            {event.maxParticipants && event.currentParticipants >= event.maxParticipants ? (
              <Badge variant="destructive" className="text-xs">Full</Badge>
            ) : isRegistrationOpen() ? (
              <Badge variant="default" className="text-xs bg-hack-emerald">Open</Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">Closed</Badge>
            )}
          </div>
          
          <Link href={`/events/${event.id}`}>
            <Button 
              size="sm" 
              className="bg-hack-purple hover:bg-purple-600 text-white"
              data-testid={`button-view-event-${event.id}`}
            >
              {event.status === 'live' ? 'Join Now' : 'View Details'}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
