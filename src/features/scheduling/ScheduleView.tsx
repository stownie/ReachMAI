import React, { useState, useMemo } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import moment from 'moment';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import type { Meeting, Section, UserProfile } from '../../types';
import { generateMeetingInstances } from '../../lib/scheduling';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, Grid } from 'lucide-react';
import { cn } from '../../lib/utils';

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

interface ScheduleViewProps {
  meetings: Meeting[];
  sections: Section[];
  currentProfile: UserProfile;
  onMeetingClick?: (meeting: Meeting, instance: { start: Date; end: Date }) => void;
  onSlotClick?: (slotInfo: { start: Date; end: Date }) => void;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: {
    meeting: Meeting;
    section: Section;
    type: 'class' | 'office-hours' | 'event';
  };
}

const ScheduleView: React.FC<ScheduleViewProps> = ({
  meetings,
  sections,
  currentProfile,
  onMeetingClick,
  onSlotClick,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>(Views.WEEK);

  // Filter meetings based on user profile
  const filteredMeetings = useMemo(() => {
    return meetings.filter(meeting => {
      const section = sections.find(s => s.id === meeting.sectionId);
      if (!section) return false;

      switch (currentProfile.type) {
        case 'teacher':
          return meeting.teacherIds.includes(currentProfile.id);
        case 'student':
          return section.enrollments.some(e => 
            e.studentId === currentProfile.id && e.status === 'enrolled'
          );
        case 'parent':
          // For parents, show meetings for their students
          const parentProfile = currentProfile as any; // Type assertion for parent
          return section.enrollments.some(e => 
            parentProfile.studentIds?.includes(e.studentId) && e.status === 'enrolled'
          );
        default:
          return true; // Admins see all
      }
    });
  }, [meetings, sections, currentProfile]);

  // Generate calendar events from meetings
  const calendarEvents: CalendarEvent[] = useMemo(() => {
    const events: CalendarEvent[] = [];
    
    // Get date range based on current view
    let startDate: Date, endDate: Date;
    
    switch (currentView) {
      case Views.MONTH:
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(currentDate);
        break;
      case Views.WEEK:
        startDate = startOfWeek(currentDate);
        endDate = endOfWeek(currentDate);
        break;
      default:
        startDate = new Date(currentDate);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(currentDate);
        endDate.setHours(23, 59, 59, 999);
    }

    filteredMeetings.forEach(meeting => {
      const section = sections.find(s => s.id === meeting.sectionId);
      if (!section) return;

      const instances = generateMeetingInstances(meeting, startDate, endDate);
      
      instances.forEach(instance => {
        events.push({
          id: `${meeting.id}-${instance.start.getTime()}`,
          title: section.name,
          start: instance.start,
          end: instance.end,
          resource: {
            meeting,
            section,
            type: 'class',
          },
        });
      });
    });

    return events;
  }, [filteredMeetings, sections, currentDate, currentView]);

  const eventStyleGetter = (event: CalendarEvent) => {
    const { type } = event.resource;
    
    const styles = {
      class: {
        backgroundColor: '#3b82f6',
        borderColor: '#2563eb',
        color: 'white',
      },
      'office-hours': {
        backgroundColor: '#10b981',
        borderColor: '#059669', 
        color: 'white',
      },
      event: {
        backgroundColor: '#f59e0b',
        borderColor: '#d97706',
        color: 'white',
      },
    };

    return {
      style: styles[type] || styles.class,
    };
  };

  const handleNavigate = (date: Date) => {
    setCurrentDate(date);
  };

  const handleViewChange = (view: View) => {
    setCurrentView(view);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    onMeetingClick?.(event.resource.meeting, {
      start: event.start,
      end: event.end,
    });
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    onSlotClick?.(slotInfo);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Custom Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleNavigate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleNavigate(new Date())}
              className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => handleNavigate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => handleViewChange(Views.MONTH)}
            className={cn(
              "px-3 py-1 text-sm rounded-md transition-colors flex items-center space-x-1",
              currentView === Views.MONTH
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <Grid className="h-4 w-4" />
            <span>Month</span>
          </button>
          <button
            onClick={() => handleViewChange(Views.WEEK)}
            className={cn(
              "px-3 py-1 text-sm rounded-md transition-colors flex items-center space-x-1",
              currentView === Views.WEEK
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <CalendarIcon className="h-4 w-4" />
            <span>Week</span>
          </button>
          <button
            onClick={() => handleViewChange(Views.AGENDA)}
            className={cn(
              "px-3 py-1 text-sm rounded-md transition-colors flex items-center space-x-1",
              currentView === Views.AGENDA  
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            )}
          >
            <List className="h-4 w-4" />
            <span>List</span>
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="p-4" style={{ height: '600px' }}>
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          titleAccessor="title"
          view={currentView}
          onView={handleViewChange}
          date={currentDate}
          onNavigate={handleNavigate}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          eventPropGetter={eventStyleGetter}
          step={15}
          timeslots={4}
          toolbar={false} // We're using custom toolbar
          formats={{
            timeGutterFormat: 'h:mm A',
            eventTimeRangeFormat: ({ start, end }) => 
              `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`,
            agendaTimeFormat: 'h:mm A',
            agendaDateFormat: 'MMM dd',
          }}
          components={{
            event: ({ event }) => (
              <div className="text-xs">
                <div className="font-medium">{event.title}</div>
                {event.resource.section && (
                  <div className="opacity-75">
                    Room {event.resource.meeting.roomId || 'TBD'}
                  </div>
                )}
              </div>
            ),
          }}
        />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span className="text-sm text-gray-600">Classes</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-sm text-gray-600">Office Hours</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span className="text-sm text-gray-600">Events</span>
        </div>
      </div>
    </div>
  );
};

export default ScheduleView;