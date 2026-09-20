import { EventsItem } from "@/hooks/queries/useEvents";

export interface EventCardProps {
    event: EventsItem;
    /** CTA button click handler */
    onCtaClick?: () => void;
    /** Additional CSS classes for the wrapper */
    className?: string;
}
