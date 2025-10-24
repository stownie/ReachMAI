// Type declarations for react-big-calendar
declare module 'react-big-calendar' {
  import { ComponentType } from 'react';

  export interface Event {
    id?: string;
    title: string;
    start: Date;
    end: Date;
    resource?: any;
    allDay?: boolean;
  }

  export interface CalendarProps {
    localizer: any;
    events: Event[];
    startAccessor?: string | ((event: Event) => Date);
    endAccessor?: string | ((event: Event) => Date);
    titleAccessor?: string | ((event: Event) => string);
    resourceAccessor?: string | ((event: Event) => any);
    view?: string;
    views?: any;
    onView?: (view: string) => void;
    date?: Date;
    onNavigate?: (date: Date) => void;
    toolbar?: boolean;
    formats?: any;
    components?: any;
    min?: Date;
    max?: Date;
    scrollToTime?: Date;
    step?: number;
    timeslots?: number;
    popup?: boolean;
    popupOffset?: { x: number; y: number };
    onSelectEvent?: (event: Event) => void;
    onSelectSlot?: (slotInfo: any) => void;
    selectable?: boolean;
    className?: string;
    style?: React.CSSProperties;
    eventPropGetter?: (event: Event) => { className?: string; style?: React.CSSProperties; };
  }

  export const Calendar: ComponentType<CalendarProps>;
  export const Views: {
    MONTH: string;
    WEEK: string;
    WORK_WEEK: string;
    DAY: string;
    AGENDA: string;
  };
  export type View = string;
  export function momentLocalizer(moment: any): any;
  export default Calendar;
}