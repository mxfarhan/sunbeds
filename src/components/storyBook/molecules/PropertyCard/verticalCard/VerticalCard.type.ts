import { Property } from '@/hooks/queries/useProperties';

export interface VerticalCardProps {
    /** Full property data object */
    property: Property;
    /** Wishlist button click handler */
    onWishlistClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    /** Card click handler */
    onClick?: () => void;
    /** Additional CSS classes for the card wrapper */
    className?: string;
}
