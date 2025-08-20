import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import type { User as UserType } from "@shared/schema";
import { Code, Search, Menu, User, Settings, LogOut, LayoutDashboard, Calendar, Users } from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated } = useAuth() as { user: UserType | null; isAuthenticated: boolean; };
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  const navLinks = [
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/leaderboard", label: "Leaderboard", icon: Users },
  ];

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
              <div className="w-8 h-8 bg-gradient-to-r from-hack-purple to-hack-indigo rounded-lg flex items-center justify-center">
                <Code className="text-white w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-hack-dark">HackSphere</span>
            </Link>
            
            <div className="hidden md:flex space-x-6">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href}>
                  <Button
                    variant="ghost"
                    className={`flex items-center space-x-2 ${
                      isActive(href) 
                        ? "text-hack-purple bg-hack-purple bg-opacity-10" 
                        : "text-gray-700 hover:text-hack-purple"
                    }`}
                    data-testid={`nav-${label.toLowerCase()}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </div>

          {/* Search and User Actions */}
          <div className="flex items-center space-x-4">
            {/* Search - Hidden on mobile */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search events..."
                className="w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-hack-purple focus:border-transparent"
                data-testid="input-search-navbar"
              />
            </div>

            {/* Auth Section */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="button-user-menu">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profileImageUrl || ""} alt={user.firstName || "User"} />
                      <AvatarFallback className="bg-hack-purple text-white">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profileImageUrl || ""} alt={user.firstName || "User"} />
                      <AvatarFallback className="bg-hack-purple text-white">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium text-sm">{user.firstName || user.email}</p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="w-full" data-testid="link-dashboard">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {(user.role === 'admin' || user.role === 'organizer') && (
                    <DropdownMenuItem asChild>
                      <Link href="/organizer" className="w-full" data-testid="link-organizer">
                        <Settings className="mr-2 h-4 w-4" />
                        Organizer Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="w-full" data-testid="link-admin">
                        <Users className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => window.location.href = "/api/logout"}
                    data-testid="button-logout"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  onClick={() => window.location.href = "/api/login"}
                  data-testid="button-sign-in"
                >
                  Sign In
                </Button>
                <Button 
                  className="bg-hack-purple hover:bg-purple-600 text-white"
                  onClick={() => window.location.href = "/api/login"}
                  data-testid="button-get-started"
                >
                  Get Started
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden" data-testid="button-mobile-menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col space-y-4 mt-8">
                  {/* Mobile Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search events..."
                      className="pl-10"
                      data-testid="input-search-mobile"
                    />
                  </div>

                  {/* Mobile Navigation */}
                  <div className="flex flex-col space-y-2">
                    {navLinks.map(({ href, label, icon: Icon }) => (
                      <Link key={href} href={href}>
                        <Button
                          variant="ghost"
                          className={`w-full justify-start ${
                            isActive(href) 
                              ? "text-hack-purple bg-hack-purple bg-opacity-10" 
                              : "text-gray-700"
                          }`}
                          data-testid={`mobile-nav-${label.toLowerCase()}`}
                        >
                          <Icon className="mr-2 h-4 w-4" />
                          {label}
                        </Button>
                      </Link>
                    ))}
                  </div>

                  {/* Mobile Auth */}
                  {!isAuthenticated && (
                    <div className="pt-4 border-t">
                      <div className="flex flex-col space-y-2">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => window.location.href = "/api/login"}
                          data-testid="button-mobile-sign-in"
                        >
                          Sign In
                        </Button>
                        <Button 
                          className="w-full bg-hack-purple hover:bg-purple-600"
                          onClick={() => window.location.href = "/api/login"}
                          data-testid="button-mobile-get-started"
                        >
                          Get Started
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
