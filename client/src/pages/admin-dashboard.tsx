import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Calendar, 
  Trophy, 
  Settings, 
  BarChart3,
  Shield,
  UserCheck,
  AlertTriangle,
  TrendingUp,
  Activity,
  Eye,
  Edit,
  Trash2,
  Plus
} from "lucide-react";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Redirect if not admin
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-hack-light">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <AlertTriangle className="w-16 h-16 text-hack-red mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600 mb-6">You don't have permission to access the admin dashboard.</p>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: events } = useQuery({
    queryKey: ["/api/events"],
  });

  const { data: users } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      // This would need to be implemented in the backend
      const response = await fetch("/api/admin/users", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    },
    retry: false,
  });

  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      await apiRequest("PATCH", `/api/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      toast({
        title: "User Role Updated",
        description: "The user's role has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setSelectedUser(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to Update Role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRoleUpdate = (userId: string, role: string) => {
    updateUserRoleMutation.mutate({ userId, role });
  };

  const recentEvents = events?.slice(0, 5) || [];
  const recentUsers = users?.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-hack-light">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-hack-dark mb-2 flex items-center space-x-3">
            <Shield className="w-8 h-8 text-hack-purple" />
            <span>Admin Dashboard</span>
          </h1>
          <p className="text-lg text-gray-600">
            Manage platform users, events, and monitor system health
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-hack-purple rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-hack-purple" data-testid="stat-total-events">
                    {stats?.totalEvents || 0}
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
                  <Users className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-hack-emerald" data-testid="stat-total-users">
                    {users?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Registered Users</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-hack-amber rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-hack-amber" data-testid="stat-active-events">
                    {stats?.activeEvents || 0}
                  </div>
                  <div className="text-sm text-gray-600">Active Events</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-hack-indigo rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-hack-indigo" data-testid="stat-total-participants">
                    {stats?.totalParticipants || 0}
                  </div>
                  <div className="text-sm text-gray-600">Total Registrations</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
            <TabsTrigger value="events" data-testid="tab-events">Events</TabsTrigger>
            <TabsTrigger value="settings" data-testid="tab-settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Recent Events</span>
                    <Link href="/events">
                      <Button variant="outline" size="sm" data-testid="button-view-all-events">
                        View All
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recentEvents.length > 0 ? (
                    <div className="space-y-4">
                      {recentEvents.map((event: any) => (
                        <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <h3 className="font-semibold text-hack-dark line-clamp-1">{event.title}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={
                                event.status === 'live' ? 'bg-hack-emerald' :
                                event.status === 'upcoming' ? 'bg-hack-amber' :
                                'bg-gray-400'
                              }>
                                {event.status}
                              </Badge>
                              <span className="text-sm text-gray-600">
                                {event.currentParticipants} registered
                              </span>
                            </div>
                          </div>
                          <Link href={`/events/${event.id}`}>
                            <Button variant="ghost" size="sm" data-testid={`button-view-event-${event.id}`}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No events created yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Users */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Users</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentUsers.length > 0 ? (
                    <div className="space-y-4">
                      {recentUsers.map((userData: any) => (
                        <div key={userData.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-hack-purple rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-semibold">
                                {userData.firstName?.[0] || userData.email?.[0] || 'U'}
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold text-hack-dark">
                                {userData.firstName || userData.email?.split('@')[0] || 'Anonymous'}
                              </div>
                              <div className="text-sm text-gray-600">{userData.email}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={
                              userData.role === 'admin' ? 'destructive' :
                              userData.role === 'organizer' ? 'default' :
                              'secondary'
                            }>
                              {userData.role}
                            </Badge>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setSelectedUser(userData)}
                              data-testid={`button-edit-user-${userData.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No users registered yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>User Management</span>
                  <div className="flex items-center space-x-2">
                    <Input 
                      placeholder="Search users..." 
                      className="w-64"
                      data-testid="input-search-users"
                    />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {users && users.length > 0 ? (
                  <div className="space-y-4">
                    {users.map((userData: any) => (
                      <div key={userData.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-hack-purple rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {userData.firstName?.[0] || userData.email?.[0] || 'U'}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-hack-dark">
                              {userData.firstName ? `${userData.firstName} ${userData.lastName || ''}`.trim() : userData.email?.split('@')[0] || 'Anonymous'}
                            </div>
                            <div className="text-sm text-gray-600">{userData.email}</div>
                            <div className="text-xs text-gray-500">
                              Joined {new Date(userData.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge variant={
                            userData.role === 'admin' ? 'destructive' :
                            userData.role === 'organizer' ? 'default' :
                            'secondary'
                          }>
                            {userData.role}
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setSelectedUser(userData)}
                            data-testid={`button-manage-user-${userData.id}`}
                          >
                            Manage
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Users Found</h3>
                    <p className="text-gray-600">Users will appear here as they register.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Event Management</span>
                  <Link href="/organizer">
                    <Button className="bg-hack-purple hover:bg-purple-600" data-testid="button-create-event">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Event
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {events && events.length > 0 ? (
                  <div className="space-y-4">
                    {events.map((event: any) => (
                      <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold text-hack-dark mb-1">{event.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(event.startDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>{event.currentParticipants} participants</span>
                            </div>
                            {event.category && (
                              <Badge variant="outline">{event.category}</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={
                            event.status === 'live' ? 'bg-hack-emerald' :
                            event.status === 'upcoming' ? 'bg-hack-amber' :
                            event.status === 'completed' ? 'bg-gray-400' :
                            'bg-gray-300'
                          }>
                            {event.status}
                          </Badge>
                          <Link href={`/events/${event.id}`}>
                            <Button variant="outline" size="sm" data-testid={`button-view-admin-event-${event.id}`}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Events Created</h3>
                    <p className="text-gray-600 mb-4">Create your first event to get started.</p>
                    <Link href="/organizer">
                      <Button className="bg-hack-purple hover:bg-purple-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Event
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>Platform Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-hack-dark mb-4">General Settings</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="platform-name">Platform Name</Label>
                        <Input 
                          id="platform-name" 
                          defaultValue="HackSphere" 
                          className="mt-1"
                          data-testid="input-platform-name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="max-events">Max Events per Organizer</Label>
                        <Input 
                          id="max-events" 
                          type="number" 
                          defaultValue="10" 
                          className="mt-1"
                          data-testid="input-max-events"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-hack-dark mb-4">User Permissions</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-semibold">Allow Event Creation</div>
                          <div className="text-sm text-gray-600">Users can create events without approval</div>
                        </div>
                        <input type="checkbox" defaultChecked data-testid="checkbox-allow-event-creation" />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-semibold">Require Event Approval</div>
                          <div className="text-sm text-gray-600">Events need admin approval before going live</div>
                        </div>
                        <input type="checkbox" data-testid="checkbox-require-approval" />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button className="bg-hack-purple hover:bg-purple-600" data-testid="button-save-settings">
                      Save Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* User Role Management Dialog */}
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manage User Role</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-hack-purple rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {selectedUser.firstName?.[0] || selectedUser.email?.[0] || 'U'}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold">
                      {selectedUser.firstName ? `${selectedUser.firstName} ${selectedUser.lastName || ''}`.trim() : selectedUser.email?.split('@')[0] || 'Anonymous'}
                    </div>
                    <div className="text-sm text-gray-600">{selectedUser.email}</div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="user-role">User Role</Label>
                  <Select 
                    defaultValue={selectedUser.role} 
                    onValueChange={(value) => handleRoleUpdate(selectedUser.id, value)}
                  >
                    <SelectTrigger data-testid="select-user-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="participant">Participant</SelectItem>
                      <SelectItem value="organizer">Organizer</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    onClick={() => setSelectedUser(null)} 
                    variant="outline"
                    data-testid="button-cancel-role-change"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Footer />
    </div>
  );
}
