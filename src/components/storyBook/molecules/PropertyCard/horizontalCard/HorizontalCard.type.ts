import { PropertyDataType } from '@/types/GlobalTypes';

export interface HorizontalCardProps {
    /** Full property data object */
    property: PropertyDataType;
    /** Wishlist button click handler */
    onWishlistClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    /** Card click handler */
    onClick?: () => void;
    /** Additional CSS classes for the card wrapper */
    className?: string;
}
