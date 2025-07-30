
// Weekly View Component with Timeline
import React from 'react';
import { ChevronLeft, ChevronRight, Edit, Trash2, Clock, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Event } from './Calendar';

interface WeeklyViewProps {
  events: Event[];
  currentWeek: Date;
  onWeekChange: (date: Date) => void;
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (eventId: string) => void;
}

const WeeklyView: React.FC<WeeklyViewProps> = ({
  events,
  currentWeek,
  onWeekChange,
  onEditEvent,
  onDeleteEvent
}) => {
  const formatTime12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const hour24 = parseInt(hours, 10);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getWeekDays = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    // Get Monday of the current week
    const dayOfWeek = startOfWeek.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Handle Sunday as last day of week
    startOfWeek.setDate(date.getDate() + diff);
    
    // Only get weekdays (Monday to Friday)
    for (let i = 0; i < 5; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDays = getWeekDays(currentWeek);
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    onWeekChange(newDate);
  };

  const getEventsForDay = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const getMorningEvents = (dayEvents: Event[]) => {
    return dayEvents.filter(event => {
      const [hour] = event.startTime.split(':').map(Number);
      return hour < 12;
    });
  };

  const getAfternoonEvents = (dayEvents: Event[]) => {
    return dayEvents.filter(event => {
      const [hour] = event.startTime.split(':').map(Number);
      return hour >= 12;
    });
  };

  const getEventTypeColor = (type: Event['type']) => {
    switch (type) {
      case 'hearing': return 'bg-blue-500 border-blue-400';
      default: return 'bg-gray-500 border-gray-400';
    }
  };

  const getStatusOpacity = (status: Event['status']) => {
    switch (status) {
      case 'new': return 'opacity-100';
      case 'rescheduled': return 'opacity-75';
      case 'cancelled': return 'opacity-50 line-through';
      default: return 'opacity-100';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Week Navigation */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateWeek('prev')}
           className="text-muted-foreground hover:text-accent-foreground hover:bg-accent"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h2 className="text-xl font-semibold text-gray-900">
          {weekDays[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </h2>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateWeek('next')}
          className="text-muted-foreground hover:text-accent-foreground hover:bg-accent"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekly Timeline */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid grid-cols-5 gap-4">
          {weekDays.map((day, dayIndex) => {
            const dayEvents = getEventsForDay(day);
            const morningEvents = getMorningEvents(dayEvents);
            const afternoonEvents = getAfternoonEvents(dayEvents);
            
            return (
              <div key={day.toISOString()} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Day Header */}
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 uppercase font-medium">{dayNames[dayIndex]}</div>
                    <div className={`text-lg font-semibold mt-1 ${
                      day.toDateString() === new Date().toDateString() 
                        ? 'text-blue-600' 
                        : 'text-gray-900'
                    }`}>
                      {day.getDate()}
                    </div>
                  </div>
                </div>

                <div className="p-3 space-y-4">
                  {/* Morning Hearings */}
                  <Collapsible defaultOpen={morningEvents.length > 0}>
                     <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-md hover:bg-accent transition-colors">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-amber-500" />
                        <span className="text-sm font-medium text-gray-700">Morning</span>
                        {morningEvents.length > 0 && (
                          <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                            {morningEvents.length}
                          </span>
                        )}
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2">
                      {morningEvents.length === 0 ? (
                        <div className="text-xs text-gray-400 px-2 py-3">No morning hearings</div>
                      ) : (
                        <div className="space-y-2">
                          {morningEvents.map(event => (
                            <div
                              key={event.id}
                              className={`p-3 rounded-md ${getEventTypeColor(event.type)} 
                                group cursor-pointer hover:shadow-md transition-all duration-200 
                                ${getStatusOpacity(event.status)}`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-white text-sm truncate">{event.title}</div>
                                  <div className="text-white text-xs mt-1 opacity-90">
                                    {formatTime12Hour(event.startTime)} - {formatTime12Hour(event.endTime)}
                                  </div>
                                  <div className="text-white text-xs opacity-75 capitalize mt-1">
                                    {event.status}
                                  </div>
                                </div>
                                
                                {/* Actions */}
                                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEditEvent(event);
                                    }}
                                    className="h-6 w-6 p-0 hover:bg-white/20 text-white"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteEvent(event.id);
                                    }}
                                    className="h-6 w-6 p-0 hover:bg-red-500/20 text-white"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Afternoon Hearings */}
                  <Collapsible defaultOpen={afternoonEvents.length > 0}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-md hover:bg-accent transition-colors">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">Afternoon</span>
                        {afternoonEvents.length > 0 && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {afternoonEvents.length}
                          </span>
                        )}
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2">
                      {afternoonEvents.length === 0 ? (
                        <div className="text-xs text-gray-400 px-2 py-3">No afternoon hearings</div>
                      ) : (
                        <div className="space-y-2">
                          {afternoonEvents.map(event => (
                            <div
                              key={event.id}
                              className={`p-3 rounded-md ${getEventTypeColor(event.type)} 
                                group cursor-pointer hover:shadow-md transition-all duration-200 
                                ${getStatusOpacity(event.status)}`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-white text-sm truncate">{event.title}</div>
                                  <div className="text-white text-xs mt-1 opacity-90">
                                    {formatTime12Hour(event.startTime)} - {formatTime12Hour(event.endTime)}
                                  </div>
                                  <div className="text-white text-xs opacity-75 capitalize mt-1">
                                    {event.status}
                                  </div>
                                </div>
                                
                                {/* Actions */}
                                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEditEvent(event);
                                    }}
                                    className="h-6 w-6 p-0 hover:bg-white/20 text-white"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteEvent(event.id);
                                    }}
                                    className="h-6 w-6 p-0 hover:bg-red-500/20 text-white"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeeklyView;
