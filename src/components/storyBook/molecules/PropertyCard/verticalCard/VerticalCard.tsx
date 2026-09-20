'use client';
import React from 'react';
import { PiLightningFill } from 'react-icons/pi';
import { useTranslation } from '@/hooks/useTranslation';

import Badge from '../../../atoms/Badge';
import Divider from '../../../atoms/Divider';
import PropertyInfo from '../../../atoms/PropertyInfo';
import PropertyPrice from '../../../atoms/PropertyPrice';
import PropertyRating from '../../../atoms/PropertyRating';
import WishlistBtn from '../../../atoms/WishlistBtn';

import ImagePreview from '@/components/storyBook/atoms/ImagePreview';
import { VerticalCardProps } from './VerticalCard.type';

const VerticalCard: React.FC<VerticalCardProps> = ({
    property,
    onWishlistClick,
    onClick,
    className = '',
}) => {
    const { t } = useTranslation();

    return (
        <div
            className={`flex flex-col bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full border ${className}`}
            onClick={onClick}
        >
            {/* Image */}
            <div className="relative w-full sm:w-[300px] h-[195px] sm:h-[266px] flex-shrink-0 z-[1]">
                <ImagePreview src={property?.image} alt={property?.name} objectFit='cover' />

                {/* Wishlist button */}
                {/* <WishlistBtn isWishlisted={false} onClick={onWishlistClick} /> */}

                {/* Featured badge */}
                {/* {true && (
                    <Badge
                        label={t('featured')}
                        variant="info"
                        className="absolute top-4 left-4 bg-white text-black! [&>span]:primaryColor!"
                        iconLeft={<PiLightningFill className="md:text-lg" />}
                    />
                )} */}
            </div>

            {/* Details */}
            <div className="flex-1 px-3 pb-3 pt-2 flex flex-col justify-between">
                <div className="space-y-2">
                    {(property?.reviews_count || 0) > 0 && (
                        <PropertyRating rating={property?.rating || 0} reviews={property?.reviews_count} />
                    )}
                    <PropertyInfo name={property?.name} location={`${property?.street_address},${property?.city}`} />
                </div>

                <div className="mt-4">
                    <Divider />
                    <PropertyPrice
                        price={property?.converted_starting_price ?? property?.starting_price}
                        currency={property?.converted_currency_symbol ?? property?.currency_symbol}
                        simple
                    />
                </div>
            </div>
        </div>
    );
};

export default VerticalCard;
