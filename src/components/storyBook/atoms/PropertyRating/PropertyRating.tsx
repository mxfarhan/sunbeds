'use client'
import React, { useEffect, useState } from 'react';
import { PiStarFill } from 'react-icons/pi';
import { PropertyRatingProps } from './PropertyRating.type';
import { useSelector } from 'react-redux';
import { businessModeSelector } from '@/redux/reducers/settingsSlice';
import { BasicDetails } from '@/hooks/queries/useSettings';
import Badge from '../Badge';

const PropertyRating: React.FC<PropertyRatingProps> = ({
    rating,
    reviews,
    className = '',
    showHotelBadge = false,
}) => {

    const [mounted, setMounted] = useState(false)
    useEffect(() => { setMounted(true) }, [])

    const businessMode = useSelector(businessModeSelector) as BasicDetails;
    const propertyType = mounted ? businessMode?.property_type : undefined;

    if (!showHotelBadge && !(reviews > 0)) {
        return null;
    }

    return (
        <div className={`flex items-center gap-4 ${className}`}>
            {
                showHotelBadge &&
                <Badge label={propertyType ?? ''} className='rounded-[4px]! p-2!' />
            }

            {
                reviews > 0 &&
                    <div className={`flex items-center gap-1.5 ${className}`}>
                        <PiStarFill className="successColor" />
                        <span className="text-sm font-medium">{rating}</span>
                        <span className="text-sm textSecondaryColor">({reviews})</span>
                    </div>
            }

        </div>
    );
};

export default PropertyRating;
