import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Search, Filter, X } from "lucide-react";
import { format } from "date-fns";

interface SearchFiltersProps {
  onFiltersChange: (filters: {
    search: string;
    status: string;
    category: string;
    difficulty: string;
    startDate?: Date;
    endDate?: Date;
  }) => void;
  currentFilters: {
    search: string;
    status: string;
    category: string;
    difficulty: string;
    startDate?: Date;
    endDate?: Date;
  };
}

export default function SearchFilters({ onFiltersChange, currentFilters }: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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

  const difficulties = ["beginner", "intermediate", "advanced"];
  const statuses = ["upcoming", "live", "completed"];

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({
      ...currentFilters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      status: "all",
      category: "all",
      difficulty: "all",
      startDate: undefined,
      endDate: undefined,
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (currentFilters.search) count++;
    if (currentFilters.status && currentFilters.status !== "all") count++;
    if (currentFilters.category && currentFilters.category !== "all") count++;
    if (currentFilters.difficulty && currentFilters.difficulty !== "all") count++;
    if (currentFilters.startDate) count++;
    if (currentFilters.endDate) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-hack-dark flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {activeFilterCount > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearFilters}
                data-testid="button-clear-all-filters"
              >
                <X className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              data-testid="button-toggle-filters"
            >
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search - Always Visible */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search events..."
            value={currentFilters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-10"
            data-testid="input-search-filters"
          />
        </div>

        {/* Quick Filters - Always Visible */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={currentFilters.status === "live" ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter("status", currentFilters.status === "live" ? "all" : "live"))
            className={currentFilters.status === "live" ? "bg-hack-emerald hover:bg-emerald-600" : ""}
            data-testid="button-quick-filter-live"
          >
            🔴 Live
          </Button>
          <Button
            variant={currentFilters.status === "upcoming" ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter("status", currentFilters.status === "upcoming" ? "all" : "upcoming"))
            className={currentFilters.status === "upcoming" ? "bg-hack-amber hover:bg-amber-600" : ""}
            data-testid="button-quick-filter-upcoming"
          >
            ⏰ Upcoming
          </Button>
          <Button
            variant={currentFilters.category === "AI/ML" ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter("category", currentFilters.category === "AI/ML" ? "all" : "AI/ML"))
            className={currentFilters.category === "AI/ML" ? "bg-hack-purple hover:bg-purple-600" : ""}
            data-testid="button-quick-filter-ai"
          >
            🤖 AI/ML
          </Button>
          <Button
            variant={currentFilters.category === "Blockchain" ? "default" : "outline"}
            size="sm"
            onClick={() => updateFilter("category", currentFilters.category === "Blockchain" ? "all" : "Blockchain"))
            className={currentFilters.category === "Blockchain" ? "bg-hack-indigo hover:bg-indigo-600" : ""}
            data-testid="button-quick-filter-blockchain"
          >
            ⛓️ Blockchain
          </Button>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <Label htmlFor="status-filter" className="text-sm font-medium text-gray-700">Status</Label>
                <Select value={currentFilters.status} onValueChange={(value) => updateFilter("status", value)}>
                  <SelectTrigger data-testid="select-status-filter-expanded">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {statuses.map(status => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div>
                <Label htmlFor="category-filter" className="text-sm font-medium text-gray-700">Category</Label>
                <Select value={currentFilters.category} onValueChange={(value) => updateFilter("category", value)}>
                  <SelectTrigger data-testid="select-category-filter-expanded">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Difficulty Filter */}
              <div>
                <Label htmlFor="difficulty-filter" className="text-sm font-medium text-gray-700">Difficulty</Label>
                <Select value={currentFilters.difficulty} onValueChange={(value) => updateFilter("difficulty", value)}>
                  <SelectTrigger data-testid="select-difficulty-filter">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {difficulties.map(difficulty => (
                      <SelectItem key={difficulty} value={difficulty}>
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range - Start Date */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      data-testid="button-start-date-filter"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {currentFilters.startDate ? format(currentFilters.startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={currentFilters.startDate}
                      onSelect={(date) => updateFilter("startDate", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* End Date - Full Width */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      data-testid="button-end-date-filter"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {currentFilters.endDate ? format(currentFilters.endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={currentFilters.endDate}
                      onSelect={(date) => updateFilter("endDate", date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="pt-4 border-t">
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Active Filters:</Label>
            <div className="flex flex-wrap gap-2">
              {currentFilters.search && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Search: {currentFilters.search}</span>
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter("search", "")}
                  />
                </Badge>
              )}
              {currentFilters.status && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Status: {currentFilters.status}</span>
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter("status", "")}
                  />
                </Badge>
              )}
              {currentFilters.category && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Category: {currentFilters.category}</span>
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter("category", "")}
                  />
                </Badge>
              )}
              {currentFilters.difficulty && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>Level: {currentFilters.difficulty}</span>
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter("difficulty", "")}
                  />
                </Badge>
              )}
              {currentFilters.startDate && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>From: {format(currentFilters.startDate, "PP")}</span>
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter("startDate", undefined)}
                  />
                </Badge>
              )}
              {currentFilters.endDate && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <span>To: {format(currentFilters.endDate, "PP")}</span>
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilter("endDate", undefined)}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
