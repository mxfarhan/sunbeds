export interface WishlistBtnProps {
    /** Whether the property is wishlisted */
    isWishlisted?: boolean;
    /** Click handler */
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    /** Additional CSS classes */
    className?: string;
}
