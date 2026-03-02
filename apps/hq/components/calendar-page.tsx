"use client";

import * as React from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon, 
  Loader2, 
  Search, 
  MoreVertical,
  Settings,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils";
import { useCalendarEvents, useCreateCalendarEvent } from "@/hooks/use-calendar-events";
import { AddContentDrawer } from "@/components/calendar/AddContentDrawer";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [search, setSearch] = React.useState("");
  const [activeTab, setActiveTab] = React.useState<"calendar" | "streaks">("calendar");
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  
  const { events, loading, error, refetch } = useCalendarEvents();
  const { createCalendarEvent } = useCreateCalendarEvent();

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const getEventsForDate = (date: Date) => {
    const dStr = date.toISOString().split("T")[0];
    return events
      .filter(e => e.title.toLowerCase().includes(search.toLowerCase()))
      .filter(e => e.scheduledAt.startsWith(dStr));
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      d.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      return d;
    });
  };

  const handleAddContent = async (selectedItems: any[], scheduledAt: string) => {
    const newEvents = selectedItems.map(item => ({
      title: item.title,
      eventType: item.muxPlaybackId ? "live" : "video",
      scheduledAt: scheduledAt,
      status: "scheduled"
    }));

    await createCalendarEvent(newEvents);
    refetch();
  };

  const renderCalendar = () => {
    const days = [];
    const totalDays = daysInMonth(currentDate);
    const startOffset = firstDayOfMonth(currentDate);

    // Header
    const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    // Empty cells for offset
    for (let i = 0; i < startOffset; i++) {
      days.push(<div key={`empty-${i}`} className="h-40 border-r border-b bg-muted/5" />);
    }

    // Actual days
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday = new Date().toDateString() === date.toDateString();
      const dayEvents = getEventsForDate(date);

      days.push(
        <div key={day} className="h-40 border-r border-b p-2 hover:bg-muted/10 transition-colors group cursor-pointer overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <span className={cn(
              "text-sm font-medium h-6 w-6 flex items-center justify-center rounded-full",
              isToday && "bg-blue-600 text-white"
            )}>
              {day}
            </span>
          </div>
          <div className="space-y-1">
            {dayEvents.map(event => (
              <div 
                key={event.id}
                className={cn(
                  "text-[10px] px-2 py-1 rounded border shadow-sm truncate font-medium",
                  event.eventType === "live" ? "bg-red-500 text-white border-red-600" : "bg-blue-50 text-blue-700 border-blue-100"
                )}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="border-t border-l rounded-lg overflow-hidden grid grid-cols-7 bg-white shadow-sm border-border/40">
        {weekDays.map(d => (
          <div key={d} className="p-4 text-center border-r border-b text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-gray-50/50">
            {d}
          </div>
        ))}
        {days}
      </div>
    );
  };

  if (activeTab === "streaks") {
    return (
      <div className="space-y-6">
        <div className="flex border-b gap-6">
          <button onClick={() => setActiveTab("calendar")} className="pb-4 text-sm text-muted-foreground hover:text-foreground">Calendar</button>
          <button onClick={() => setActiveTab("streaks")} className="pb-4 text-sm font-bold border-b-2 border-primary">Streaks & Badges <Badge className="ml-1 bg-blue-100 text-blue-700 hover:bg-blue-100 border-none text-[10px]">BETA</Badge></button>
        </div>
        
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Streaks & Badges</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Settings className="h-4 w-4 mr-2" /> Settings</Button>
            <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700">+ Add badge</Button>
          </div>
        </div>

        <Card className="border-border/60">
           <CardContent className="p-0">
              <table className="w-full text-sm">
                 <thead className="bg-gray-50/50 border-b text-muted-foreground uppercase text-[10px] font-bold">
                    <tr>
                       <th className="px-6 py-3 text-left">Badge</th>
                       <th className="px-6 py-3 text-left">Awarded after</th>
                       <th className="px-6 py-3 text-left">Awarded to</th>
                       <th className="px-6 py-3 text-left">Status</th>
                       <th className="px-6 py-3"></th>
                    </tr>
                 </thead>
                 <tbody className="divide-y">
                    {[
                      { name: "streak starter", days: "3 days", u: 0, s: "DRAFT", icon: "🎯", color: "text-blue-500 bg-blue-50" },
                      { name: "week warrior", days: "7 days", u: 0, s: "DRAFT", icon: "⚡", color: "text-purple-500 bg-purple-50" },
                      { name: "consistency champ", days: "15 days", u: 0, s: "DRAFT", icon: "🏆", color: "text-yellow-500 bg-yellow-50" },
                      { name: "monthly marvel", days: "30 days", u: 0, s: "DRAFT", icon: "⭐", color: "text-green-500 bg-green-50" },
                      { name: "superior streaker", days: "60 days", u: 0, s: "DRAFT", icon: "🔥", color: "text-orange-500 bg-orange-50" },
                    ].map(b => (
                      <tr key={b.name} className="hover:bg-muted/30">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center text-lg", b.color)}>{b.icon}</div>
                              <span className="capitalize font-medium">{b.name}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{b.days}</td>
                        <td className="px-6 py-4 text-muted-foreground">{b.u} users</td>
                        <td className="px-6 py-4">
                           <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-none text-[10px] font-bold">{b.s}</Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </td>
                      </tr>
                    ))}
                 </tbody>
              </table>
           </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex border-b gap-6">
        <button onClick={() => setActiveTab("calendar")} className="pb-4 text-sm font-bold border-b-2 border-primary">Calendar</button>
        <button onClick={() => setActiveTab("streaks")} className="pb-4 text-sm text-muted-foreground hover:text-foreground">Streaks & Badges <Badge className="ml-1 bg-blue-100 text-blue-700 hover:bg-blue-100 border-none text-[10px]">BETA</Badge></button>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Calendar</h1>
          <Badge variant="outline" className="text-blue-500 border-blue-200">
            <span className="h-2 w-2 rounded-full bg-blue-500 mr-2" />
            Disabled
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-10 text-xs font-bold"><Settings className="h-4 w-4 mr-2" /> Settings</Button>
          <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700 px-6 h-10 font-bold" onClick={() => setIsDrawerOpen(true)}>+ Add to calendar</Button>
        </div>
      </div>

      <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-border/60 shadow-sm">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search" 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="pl-10 h-10 border-border/60"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
             <Button variant="outline" size="icon" onClick={() => navigateMonth("prev")} className="h-8 w-8"><ChevronLeft className="h-4 w-4" /></Button>
             <Button variant="outline" className="h-8 px-4 text-xs font-bold border-border/60 min-w-[140px]">
               {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
             </Button>
             <Button variant="outline" size="icon" onClick={() => navigateMonth("next")} className="h-8 w-8"><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <Button variant="outline" className="h-8 text-xs font-bold border-border/60" onClick={() => setCurrentDate(new Date())}>Today</Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        renderCalendar()
      )}

      <AddContentDrawer 
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleAddContent}
      />
    </div>
  );
}
