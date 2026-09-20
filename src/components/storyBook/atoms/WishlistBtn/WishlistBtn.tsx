import React from 'react';
import { PiHeart, PiHeartFill } from 'react-icons/pi';
import { WishlistBtnProps } from './WishlistBtn.type';

const WishlistBtn: React.FC<WishlistBtnProps> = ({
    isWishlisted = false,
    onClick,
    className = '',
}) => {
    return (
        <button
            className={`absolute top-4 right-4 w-8 h-8 bg-white rounded-full flexCenter border hover:scale-110 transition-transform duration-200 ${className}`}
            aria-label={isWishlisted ? 'Remove from favorites' : 'Add to favorites'}
            onClick={onClick}
        >
            {isWishlisted
                ? <PiHeartFill className="errorColor text-xl" />
                : <PiHeart className="textSecondaryColor text-xl" />
            }
        </button>
    );
};

export default WishlistBtn;
