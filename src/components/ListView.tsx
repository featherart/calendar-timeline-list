import React, { useState } from 'react';
import { Calendar, Clock, Edit, Trash2, Filter, ChevronDown, ChevronRight, Search, Tag, Plus, X, Palette } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Event, Case } from './Calendar';

interface ListViewProps {
  events: Event[];
  cases: Case[];
  onEditEvent: (event: Event) => void;
  onDeleteEvent: (eventId: string) => void;
}

const ListView: React.FC<ListViewProps> = ({
  events,
  cases,
  onEditEvent,
  onDeleteEvent
}) => {
  const [filter, setFilter] = useState<'all' | 'new' | 'rescheduled' | 'cancelled'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'case' | 'title'>('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCases, setExpandedCases] = useState<Set<string>>(new Set());
  const [expandedHearings, setExpandedHearings] = useState<Set<string>>(new Set());
  const [editingTags, setEditingTags] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [selectedTagColor, setSelectedTagColor] = useState({ base: 'bg-blue-100 text-blue-800', hover: 'hover:bg-blue-200 hover:text-blue-900' });
  const [casesState, setCasesState] = useState<Case[]>(cases);

  // Color palette for tags with hover states
  const tagColors = [
    { base: 'bg-blue-100 text-blue-800', hover: 'hover:bg-blue-200 hover:text-blue-900' },
    { base: 'bg-green-100 text-green-800', hover: 'hover:bg-green-200 hover:text-green-900' },
    { base: 'bg-yellow-100 text-yellow-800', hover: 'hover:bg-yellow-200 hover:text-yellow-900' },
    { base: 'bg-red-100 text-red-800', hover: 'hover:bg-red-200 hover:text-red-900' },
    { base: 'bg-purple-100 text-purple-800', hover: 'hover:bg-purple-200 hover:text-purple-900' },
    { base: 'bg-pink-100 text-pink-800', hover: 'hover:bg-pink-200 hover:text-pink-900' },
    { base: 'bg-indigo-100 text-indigo-800', hover: 'hover:bg-indigo-200 hover:text-indigo-900' },
    { base: 'bg-orange-100 text-orange-800', hover: 'hover:bg-orange-200 hover:text-orange-900' },
    { base: 'bg-teal-100 text-teal-800', hover: 'hover:bg-teal-200 hover:text-teal-900' },
    { base: 'bg-cyan-100 text-cyan-800', hover: 'hover:bg-cyan-200 hover:text-cyan-900' }
  ];

  const getTagColor = (tag: string) => {
    const hash = tag.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colorSet = tagColors[hash % tagColors.length];
    return `${colorSet.base} ${colorSet.hover}`;
  };

  // Filter cases based on search query (search through case title, description, and tags)
  const filteredCases = casesState.filter(caseItem => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      caseItem.title.toLowerCase().includes(query) ||
      caseItem.description.toLowerCase().includes(query) ||
      caseItem.caseNumber.toLowerCase().includes(query) ||
      caseItem.tags.some(tag => tag.toLowerCase().includes(query)) ||
      caseItem.hearings.some(hearing => 
        hearing.title.toLowerCase().includes(query) ||
        hearing.notes.toLowerCase().includes(query)
      )
    );
  });

  // Filter events based on status and search
  const filteredEvents = events
    .filter(event => {
      // Filter by status
      if (filter !== 'all' && event.status !== filter) return false;
      
      // Filter by search query - only include events from filtered cases
      return filteredCases.some(caseItem => caseItem.id === event.parentId);
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        if (a.date.getTime() === b.date.getTime()) {
          return a.startTime.localeCompare(b.startTime);
        }
        return a.date.getTime() - b.date.getTime();
      } else if (sortBy === 'case') {
        return a.caseNumber.localeCompare(b.caseNumber);
      }
      return a.title.localeCompare(b.title);
    });

  // Group events by case (only include filtered cases)
  const groupedByCases = filteredEvents.reduce((acc, event) => {
    const caseKey = event.parentId || 'unknown';
    const caseData = filteredCases.find(c => c.id === caseKey);
    
    if (caseData) {
      if (!acc[caseKey]) {
        acc[caseKey] = {
          caseNumber: event.caseNumber,
          caseData: caseData,
          hearings: []
        };
      }
      acc[caseKey].hearings.push(event);
    }
    return acc;
  }, {} as Record<string, { caseNumber: string; caseData: Case; hearings: Event[] }>);

  const toggleCaseExpansion = (caseId: string) => {
    const newExpanded = new Set(expandedCases);
    if (newExpanded.has(caseId)) {
      newExpanded.delete(caseId);
    } else {
      newExpanded.add(caseId);
    }
    setExpandedCases(newExpanded);
  };

  const toggleHearingExpansion = (hearingId: string) => {
    const newExpanded = new Set(expandedHearings);
    if (newExpanded.has(hearingId)) {
      newExpanded.delete(hearingId);
    } else {
      newExpanded.add(hearingId);
    }
    setExpandedHearings(newExpanded);
  };

  const handleAddTag = (caseId: string) => {
    if (newTag.trim()) {
      setCasesState(prevCases => prevCases.map(c => {
        if (c.id === caseId) {
          // Avoid duplicate tags
          if (!c.tags.includes(newTag.trim())) {
            return {
              ...c,
              tags: [...c.tags, newTag.trim()]
            };
          }
        }
        return c;
      }));
      setNewTag('');
      setEditingTags(null);
      setSelectedTagColor({ base: 'bg-blue-100 text-blue-800', hover: 'hover:bg-blue-200 hover:text-blue-900' }); // Reset to default
    }
  };

  const handleRemoveTag = (caseId: string, tagToRemove: string) => {
    setCasesState(prevCases => prevCases.map(c => {
      if (c.id === caseId) {
        // Remove the tag by filtering it out
        return {
          ...c,
          tags: c.tags.filter(tag => tag !== tagToRemove)
        };
      }
      return c;
    }));
    setNewTag('');
    setEditingTags(null);
  };

  const getStatusColor = (status: Event['status']) => {
    switch (status) {
      case 'new': return 'text-green-700 bg-green-100 border-green-300';
      case 'rescheduled': return 'text-yellow-700 bg-yellow-100 border-yellow-300';
      case 'cancelled': return 'text-red-700 bg-red-100 border-red-300';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    });
  };

  const CaseItem: React.FC<{ caseId: string; caseInfo: { caseNumber: string; caseData: Case; hearings: Event[] } }> = ({ 
    caseId, 
    caseInfo 
  }) => {
    const isExpanded = expandedCases.has(caseId);
    const isEditingTags = editingTags === caseId;
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <Collapsible open={isExpanded} onOpenChange={() => toggleCaseExpansion(caseId)}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent transition-colors">
              <div className="flex items-center space-x-3 flex-1">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-500" />
                )}
                <div className="flex flex-col space-y-2 flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="px-2 py-1 rounded-md text-xs font-medium bg-blue-100 border-blue-300 text-blue-700">
                      {caseInfo.caseNumber}
                    </div>
                    <span className="text-sm text-gray-600">
                      {caseInfo.hearings.length} hearing{caseInfo.hearings.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{caseInfo.caseData.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{caseInfo.caseData.description}</p>
                  </div>
                  {caseInfo.caseData.tags.length > 0 && (
                    <div className="flex items-center space-x-1 flex-wrap gap-1">
                      <Tag className="h-3 w-3 text-gray-400" />
                      {caseInfo.caseData.tags.map((tag, index) => (
                        <div key={index} className="group relative">
                          <Badge 
                            className={`${getTagColor(tag)} cursor-pointer transition-all duration-200 pr-6`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingTags(isEditingTags ? null : caseId);
                            }}
                          >
                            {tag}
                            <button
                              className="absolute right-1 top-1/2 transform -translate-y-1/2 hover:bg-red-200 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveTag(caseId, tag);
                              }}
                            >
                              <X className="h-2 w-2" />
                            </button>
                          </Badge>
                        </div>
                      ))}
                       {isEditingTags && (
                        <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md border" onClick={(e) => e.stopPropagation()}>
                          <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleAddTag(caseId);
                              }
                              if (e.key === 'Escape') {
                                setEditingTags(null);
                                setNewTag('');
                              }
                            }}
                            onBlur={(e) => {
                              // Only close if clicking outside the tag editing area
                              if (!e.relatedTarget || !e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) {
                                setTimeout(() => {
                                  setEditingTags(null);
                                  setNewTag('');
                                }, 150);
                              }
                            }}
                            placeholder="Add tag..."
                            className="h-6 text-xs w-24"
                            autoFocus
                          />
                          <div className="flex items-center space-x-1">
                            <Palette className="h-3 w-3 text-gray-400" />
                            <div className="flex space-x-1">
                              {tagColors.slice(0, 5).map((color, index) => (
                                <button
                                  key={index}
                                   className={`w-4 h-4 rounded-full border-2 ${
                                     selectedTagColor.base === color.base ? 'border-gray-600' : 'border-gray-300'
                                   } ${color.base.split(' ')[0]} hover:scale-110 transition-transform`}
                                  onClick={() => setSelectedTagColor(color)}
                                />
                              ))}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddTag(caseId)}
                            className="h-6 w-6 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      {!isEditingTags && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-accent-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTags(caseId);
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                  {caseInfo.caseData.tags.length === 0 && (
                    <div className="flex items-center space-x-1">
                      <Tag className="h-3 w-3 text-gray-400" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-muted-foreground hover:text-accent-foreground p-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingTags(caseId);
                        }}
                      >
                        Add tags...
                      </Button>
                      {isEditingTags && (
                        <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md border" onClick={(e) => e.stopPropagation()}>
                          <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleAddTag(caseId);
                              }
                              if (e.key === 'Escape') {
                                setEditingTags(null);
                                setNewTag('');
                              }
                            }}
                            onBlur={(e) => {
                              // Only close if clicking outside the tag editing area
                              if (!e.relatedTarget || !e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) {
                                setTimeout(() => {
                                  setEditingTags(null);
                                  setNewTag('');
                                }, 150);
                              }
                            }}
                            placeholder="Add tag..."
                            className="h-6 text-xs w-24"
                            autoFocus
                          />
                          <div className="flex items-center space-x-1">
                            <Palette className="h-3 w-3 text-gray-400" />
                            <div className="flex space-x-1">
                              {tagColors.slice(0, 5).map((color, index) => (
                                <button
                                  key={index}
                                   className={`w-4 h-4 rounded-full border-2 ${
                                     selectedTagColor.base === color.base ? 'border-gray-600' : 'border-gray-300'
                                   } ${color.base.split(' ')[0]} hover:scale-110 transition-transform`}
                                  onClick={() => setSelectedTagColor(color)}
                                />
                              ))}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddTag(caseId)}
                            className="h-6 w-6 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {caseInfo.hearings.map(hearing => (
                  <div key={hearing.id} className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(hearing.status)}`}>
                    {hearing.status.toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div className="border-t border-gray-100">
              {caseInfo.hearings.map((hearing) => (
                <HearingItem 
                  key={hearing.id} 
                  hearing={hearing}
                  isExpanded={expandedHearings.has(hearing.id)}
                  onToggle={() => toggleHearingExpansion(hearing.id)}
                  onEdit={() => onEditEvent(hearing)}
                  onDelete={() => onDeleteEvent(hearing.id)}
                />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  };

  const HearingItem: React.FC<{
    hearing: Event;
    isExpanded: boolean;
    onToggle: () => void;
    onEdit: () => void;
    onDelete: () => void;
  }> = ({ hearing, isExpanded, onToggle, onEdit, onDelete }) => (
    <div className="border-b border-gray-100 last:border-b-0">
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 pl-12 cursor-pointer hover:bg-accent transition-colors group">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3 text-gray-400" />
                ) : (
                  <ChevronRight className="h-3 w-3 text-gray-400" />
                )}
                <div className="px-2 py-1 rounded-md text-xs font-medium border bg-blue-50 text-blue-600 border-blue-200">
                  <span className="mr-1">👥</span>
                  HEARING
                </div>
                <div className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(hearing.status)}`}>
                  {hearing.status.toUpperCase()}
                </div>
              </div>
              
              <h4 className="text-md font-medium text-gray-900 mb-2">
                {hearing.title.replace(`${hearing.caseNumber}: `, '')}
              </h4>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(hearing.date)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{hearing.startTime} - {hearing.endTime}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="text-muted-foreground hover:text-accent-foreground hover:bg-accent"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-gray-500 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-4 pb-4 pl-16">
            {hearing.description && (
              <div className="mb-3">
                <p className="text-sm text-gray-600">{hearing.description}</p>
              </div>
            )}
            
            {hearing.notes && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <strong>Notes:</strong> {hearing.notes}
                </p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Search and Filters */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search cases by title, description, tags, or hearing details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          {/* Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Filter by status:</span>
                <div className="flex space-x-1">
                  {['all', 'new', 'rescheduled', 'cancelled'].map((status) => (
                    <Button
                      key={status}
                      variant={filter === status ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setFilter(status as any)}
                      className={`text-xs ${
                        filter === status
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'text-muted-foreground hover:text-accent-foreground hover:bg-accent'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              {['date', 'case', 'title'].map((sort) => (
                <Button
                  key={sort}
                  variant={sortBy === sort ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSortBy(sort as any)}
                  className={`text-xs ${
                    sortBy === sort
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'text-muted-foreground hover:text-accent-foreground hover:bg-accent'
                  }`}
                >
                  {sort.charAt(0).toUpperCase() + sort.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cases List */}
      <div className="flex-1 overflow-auto p-6">
        {Object.keys(groupedByCases).length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No cases found</h3>
            <p className="text-gray-500">
              {searchQuery ? 
                'No cases match your search criteria. Try different keywords.' :
                filter === 'all' 
                  ? 'Add your first hearing to get started' 
                  : `No ${filter} hearings found. Try changing the filter.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedByCases).map(([caseId, caseInfo]) => (
              <CaseItem key={caseId} caseId={caseId} caseInfo={caseInfo} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListView;
