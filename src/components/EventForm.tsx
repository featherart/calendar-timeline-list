
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Event } from './Calendar';

interface EventFormProps {
  onSave: (event: Omit<Event, 'id'>) => void;
  onCancel: () => void;
  initialEvent?: Event | null;
}

const EventForm: React.FC<EventFormProps> = ({
  onSave,
  onCancel,
  initialEvent
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    notes: '',
    caseNumber: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    status: 'new' as Event['status']
  });

  useEffect(() => {
    if (initialEvent) {
      // Extract case number from title if it exists
      const titleParts = initialEvent.title.split(': ');
      const caseNumber = titleParts.length > 1 ? titleParts[0] : '';
      const title = titleParts.length > 1 ? titleParts[1] : initialEvent.title;

      setFormData({
        title,
        description: initialEvent.description,
        notes: initialEvent.notes,
        caseNumber: initialEvent.caseNumber || caseNumber,
        date: initialEvent.date.toISOString().split('T')[0],
        startTime: initialEvent.startTime,
        endTime: initialEvent.endTime,
        status: initialEvent.status
      });
    }
  }, [initialEvent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.caseNumber.trim()) return;

    onSave({
      title: `${formData.caseNumber}: ${formData.title.trim()}`,
      description: formData.description.trim(),
      notes: formData.notes.trim(),
      caseNumber: formData.caseNumber.trim(),
      date: new Date(formData.date),
      startTime: formData.startTime,
      endTime: formData.endTime,
      type: 'hearing',
      status: formData.status
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="caseNumber" className="text-gray-700">Case Number *</Label>
          <Input
            id="caseNumber"
            value={formData.caseNumber}
            onChange={(e) => handleChange('caseNumber', e.target.value)}
            placeholder="e.g., 2024-001"
            className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 
              focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-gray-700">Hearing Status</Label>
          <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
            <SelectTrigger className="bg-white border-gray-300 text-gray-900 
              focus:border-blue-500 focus:ring-blue-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200">
              <SelectItem value="new" className="text-foreground hover:bg-accent">
                New
              </SelectItem>
              <SelectItem value="rescheduled" className="text-foreground hover:bg-accent">
                Rescheduled
              </SelectItem>
              <SelectItem value="cancelled" className="text-foreground hover:bg-accent">
                Cancelled
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title" className="text-gray-700">Hearing Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Enter hearing title"
          className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 
            focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-gray-700">Case Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Enter case description"
          className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 
            focus:border-blue-500 focus:ring-blue-500 min-h-[80px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes" className="text-gray-700">Hearing Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Enter hearing notes"
          className="bg-white border-gray-300 text-gray-900 placeholder-gray-500 
            focus:border-blue-500 focus:ring-blue-500 min-h-[80px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date" className="text-gray-700">Date *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => handleChange('date', e.target.value)}
            className="bg-white border-gray-300 text-gray-900 
              focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="startTime" className="text-gray-700">Start Time *</Label>
          <Input
            id="startTime"
            type="time"
            value={formData.startTime}
            onChange={(e) => handleChange('startTime', e.target.value)}
            className="bg-white border-gray-300 text-gray-900 
              focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="endTime" className="text-gray-700">End Time *</Label>
        <Input
          id="endTime"
          type="time"
          value={formData.endTime}
          onChange={(e) => handleChange('endTime', e.target.value)}
          className="bg-white border-gray-300 text-gray-900 
            focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="text-muted-foreground hover:text-accent-foreground hover:bg-accent"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {initialEvent ? 'Update Hearing' : 'Create Hearing'}
        </Button>
      </div>
    </form>
  );
};

export default EventForm;
