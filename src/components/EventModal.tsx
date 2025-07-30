
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EventForm from './EventForm';
import { Event } from './Calendar';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<Event, 'id'>) => void;
  event?: Event | null;
}

const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  onSave,
  event
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white border border-gray-200 text-gray-900 max-w-md shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            {event ? 'Edit Hearing' : 'Add New Hearing'}
          </DialogTitle>
        </DialogHeader>
        <EventForm
          onSave={onSave}
          onCancel={onClose}
          initialEvent={event}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EventModal;
