import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Medal, Award, Crown, Star, ExternalLink, User } from "lucide-react";

interface LeaderboardProps {
  eventId: string;
}

export default function Leaderboard({ eventId }: LeaderboardProps) {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ["/api/events", eventId, "leaderboard"],
    enabled: !!eventId,
  });

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-lg font-bold text-gray-600">#{position}</span>;
    }
  };

  const getRankColor = (position: number) => {
    switch (position) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600 text-white";
      default:
        return "bg-gray-50 text-gray-700";
    }
  };

  const getUserInitials = (user: any) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  const getUserName = (user: any) => {
    if (user?.firstName) {
      return `${user.firstName} ${user.lastName || ''}`.trim();
    }
    return user?.email?.split('@')[0] || 'Anonymous';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-hack-amber" />
            <span>Leaderboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!leaderboard || leaderboard.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-hack-amber" />
            <span>Leaderboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Yet</h3>
            <p className="text-gray-600">
              The leaderboard will be updated once the event is completed and results are published.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-hack-amber" />
          <span>Leaderboard</span>
          <Badge variant="secondary" data-testid="leaderboard-count">
            {leaderboard.length} participants
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="mb-8 grid grid-cols-3 gap-4">
            {/* 2nd Place */}
            <div className="flex flex-col items-center order-1">
              <div className="relative">
                <div className="w-16 h-20 bg-gradient-to-t from-gray-300 to-gray-500 rounded-t-lg flex items-end justify-center pb-2 mb-2">
                  <span className="text-white font-bold text-sm">2nd</span>
                </div>
                <Avatar className="w-12 h-12 border-4 border-gray-400 absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <AvatarImage src={leaderboard[1]?.registration?.user?.profileImageUrl} />
                  <AvatarFallback className="bg-gray-400 text-white text-sm">
                    {getUserInitials(leaderboard[1]?.registration?.user)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="text-center mt-2">
                <div className="font-semibold text-sm" data-testid="podium-second-name">
                  {getUserName(leaderboard[1]?.registration?.user)}
                </div>
                {leaderboard[1]?.score !== undefined && (
                  <div className="text-xs text-gray-600">{leaderboard[1].score} pts</div>
                )}
              </div>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center order-2">
              <div className="relative">
                <div className="w-16 h-24 bg-gradient-to-t from-yellow-400 to-yellow-600 rounded-t-lg flex items-end justify-center pb-2 mb-2">
                  <span className="text-white font-bold">1st</span>
                </div>
                <Avatar className="w-14 h-14 border-4 border-yellow-500 absolute -top-7 left-1/2 transform -translate-x-1/2">
                  <AvatarImage src={leaderboard[0]?.registration?.user?.profileImageUrl} />
                  <AvatarFallback className="bg-yellow-500 text-white">
                    {getUserInitials(leaderboard[0]?.registration?.user)}
                  </AvatarFallback>
                </Avatar>
                <Crown className="w-6 h-6 text-yellow-500 absolute -top-12 left-1/2 transform -translate-x-1/2" />
              </div>
              <div className="text-center mt-2">
                <div className="font-semibold" data-testid="podium-first-name">
                  {getUserName(leaderboard[0]?.registration?.user)}
                </div>
                {leaderboard[0]?.score !== undefined && (
                  <div className="text-sm text-gray-600">{leaderboard[0].score} pts</div>
                )}
                {leaderboard[0]?.prize && (
                  <Badge className="mt-1 bg-yellow-100 text-yellow-800 text-xs">
                    {leaderboard[0].prize}
                  </Badge>
                )}
              </div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center order-3">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-t from-amber-400 to-amber-600 rounded-t-lg flex items-end justify-center pb-2 mb-2">
                  <span className="text-white font-bold text-sm">3rd</span>
                </div>
                <Avatar className="w-10 h-10 border-4 border-amber-500 absolute -top-5 left-1/2 transform -translate-x-1/2">
                  <AvatarImage src={leaderboard[2]?.registration?.user?.profileImageUrl} />
                  <AvatarFallback className="bg-amber-500 text-white text-xs">
                    {getUserInitials(leaderboard[2]?.registration?.user)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="text-center mt-2">
                <div className="font-semibold text-sm" data-testid="podium-third-name">
                  {getUserName(leaderboard[2]?.registration?.user)}
                </div>
                {leaderboard[2]?.score !== undefined && (
                  <div className="text-xs text-gray-600">{leaderboard[2].score} pts</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="space-y-2">
          {leaderboard.map((entry: any, index: number) => (
            <div
              key={entry.id}
              className={`flex items-center justify-between p-4 rounded-lg transition-all hover:shadow-md ${getRankColor(entry.position)}`}
              data-testid={`leaderboard-entry-${index}`}
            >
              <div className="flex items-center space-x-4">
                {/* Rank */}
                <div className="flex items-center justify-center w-8 h-8">
                  {getRankIcon(entry.position)}
                </div>

                {/* User Info */}
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={entry.registration?.user?.profileImageUrl} />
                    <AvatarFallback className="bg-hack-purple text-white">
                      {getUserInitials(entry.registration?.user)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">
                      {getUserName(entry.registration?.user)}
                    </div>
                    {entry.registration?.teamName && (
                      <div className="text-sm opacity-75">
                        Team: {entry.registration.teamName}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {/* Score */}
                {entry.score !== undefined && entry.score !== null && (
                  <div className="text-center">
                    <div className="font-bold text-lg">{entry.score}</div>
                    <div className="text-xs opacity-75">points</div>
                  </div>
                )}

                {/* Prize */}
                {entry.prize && (
                  <Badge 
                    className={`${
                      entry.position <= 3 
                        ? "bg-yellow-100 text-yellow-800" 
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {entry.prize}
                  </Badge>
                )}

                {/* Submission Link */}
                {entry.registration?.submissionUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(entry.registration.submissionUrl, '_blank')}
                    data-testid={`submission-link-${index}`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Judge Feedback Section for Top Entries */}
        {leaderboard.slice(0, 3).some((entry: any) => entry.judgeFeedback) && (
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold text-hack-dark flex items-center space-x-2">
              <Star className="w-5 h-5 text-hack-amber" />
              <span>Judge Feedback</span>
            </h3>
            {leaderboard.slice(0, 3).map((entry: any) => (
              entry.judgeFeedback && (
                <Card key={entry.id} className="bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center justify-center w-6 h-6">
                        {getRankIcon(entry.position)}
                      </div>
                      <span className="font-semibold">
                        {getUserName(entry.registration?.user)}
                      </span>
                    </div>
                    <p className="text-gray-700 italic">"{entry.judgeFeedback}"</p>
                  </CardContent>
                </Card>
              )
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
