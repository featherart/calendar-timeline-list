import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon, List } from "lucide-react";
import WeeklyView from './WeeklyView';
import ListView from './ListView';
import EventModal from './EventModal';

export interface Hearing {
  id: string;
  title: string;
  notes: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: 'new' | 'rescheduled' | 'cancelled';
}

export interface Case {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  tags: string[];
  hearings: Hearing[];
}

// For compatibility with existing components, we'll flatten cases into events
export interface Event {
  id: string;
  title: string;
  description: string;
  notes: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: 'hearing';
  status: 'new' | 'rescheduled' | 'cancelled';
  caseNumber: string;
  parentId?: string;
  children?: Event[];
}

const Calendar = () => {
  const [view, setView] = useState<'weekly' | 'list'>('weekly');
  const [cases, setCases] = useState<Case[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());

  // Sample cases with hearings that have statuses and tags
  useEffect(() => {
    const sampleCases: Case[] = [
      {
        id: '1',
        caseNumber: '2024-001',
        title: 'Smith vs. Johnson Contract Dispute',
        description: 'Contract dispute regarding construction services',
        tags: ['contract', 'construction', 'dispute', 'commercial'],
        hearings: [
          {
            id: '1-h1',
            title: 'Initial Hearing',
            notes: 'Bring all preliminary documents and evidence',
            date: new Date(),
            startTime: '09:00',
            endTime: '10:30',
            status: 'new'
          },
          {
            id: '1-h2',
            title: 'Evidence Review Hearing',
            notes: 'Schedule moved due to judge availability',
            date: new Date(),
            startTime: '11:00',
            endTime: '12:30',
            status: 'rescheduled'
          },
          {
            id: '1-h3',
            title: 'Closing Arguments',
            notes: 'Prepare final statement summary',
            date: new Date(),
            startTime: '14:00',
            endTime: '16:00',
            status: 'new'
          }
        ]
      },
      {
        id: '2',
        caseNumber: '2024-002',
        title: 'Williams Personal Injury Case',
        description: 'Personal injury claim from vehicle accident',
        tags: ['personal-injury', 'accident', 'insurance', 'medical'],
        hearings: [
          {
            id: '2-h1',
            title: 'Settlement Conference',
            notes: 'Cancelled due to plaintiff unavailability',
            date: new Date(Date.now() + 86400000),
            startTime: '10:00',
            endTime: '15:00',
            status: 'cancelled'
          },
          {
            id: '2-h2',
            title: 'Mediation Hearing',
            notes: 'Court-ordered mediation attempt',
            date: new Date(Date.now() + 172800000),
            startTime: '09:00',
            endTime: '12:00',
            status: 'new'
          }
        ]
      }
    ];

    setCases(sampleCases);

    // Convert cases to events for compatibility with existing components
    const flattenedEvents: Event[] = [];
    sampleCases.forEach(caseItem => {
      // Add hearings as events (no separate statuses, as hearings have their own status)
      caseItem.hearings.forEach(hearing => {
        flattenedEvents.push({
          id: hearing.id,
          title: `${caseItem.caseNumber}: ${hearing.title}`,
          description: caseItem.description,
          notes: hearing.notes,
          date: hearing.date,
          startTime: hearing.startTime,
          endTime: hearing.endTime,
          type: 'hearing',
          status: hearing.status,
          caseNumber: caseItem.caseNumber,
          parentId: caseItem.id
        });
      });
    });

    setEvents(flattenedEvents);
  }, []);

  const handleAddEvent = (eventData: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      ...eventData,
      id: Date.now().toString()
    };
    setEvents(prev => [...prev, newEvent]);
    setIsModalOpen(false);
  };

  const handleEditEvent = (eventData: Omit<Event, 'id'>) => {
    if (editingEvent) {
      setEvents(prev => prev.map(event => 
        event.id === editingEvent.id 
          ? { ...eventData, id: editingEvent.id }
          : event
      ));
      setEditingEvent(null);
      setIsModalOpen(false);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  };

  const openEditModal = (event: Event) => {
    setEditingEvent(event);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
  };

  return (
    <div className="h-screen bg-white text-gray-900 overflow-hidden">
      {/* Header with edexis.com styling */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Edexis.com logo style */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <CalendarIcon className="h-4 w-4 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Case Calendar
                </h1>
              </div>
              
              <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1 border border-gray-200">
                <Button
                  variant={view === 'weekly' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView('weekly')}
                  className={`${view === 'weekly' 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' 
                    : 'text-muted-foreground hover:text-accent-foreground hover:bg-accent'
                  } transition-all duration-200`}
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Week
                </Button>
                <Button
                  variant={view === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView('list')}
                  className={`${view === 'list' 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' 
                    : 'text-muted-foreground hover:text-accent-foreground hover:bg-accent'
                  } transition-all duration-200`}
                >
                  <List className="h-4 w-4 mr-2" />
                  List
                </Button>
              </div>
            </div>
            <Button 
              onClick={openAddModal}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm border-0 transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Hearing
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden bg-gray-50">
        {view === 'weekly' ? (
          <WeeklyView 
            events={events}
            currentWeek={currentWeek}
            onWeekChange={setCurrentWeek}
            onEditEvent={openEditModal}
            onDeleteEvent={handleDeleteEvent}
          />
        ) : (
          <ListView 
            events={events}
            cases={cases}
            onEditEvent={openEditModal}
            onDeleteEvent={handleDeleteEvent}
          />
        )}
      </div>

      {/* Event Modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={editingEvent ? handleEditEvent : handleAddEvent}
        event={editingEvent}
      />
    </div>
  );
};

export default Calendar;
