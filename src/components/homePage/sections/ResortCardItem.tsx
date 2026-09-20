'use client';

import ImagePreview from '@/components/storyBook/atoms/ImagePreview';
import PropertyInfo from '@/components/storyBook/atoms/PropertyInfo';
import PropertyPrice from '@/components/storyBook/atoms/PropertyPrice';
import PropertyRating from '@/components/storyBook/atoms/PropertyRating';
import Divider from '@/components/storyBook/atoms/Divider';
import { ResortCard } from '@/hooks/queries/useResortsHome';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { currentLangCodeSelector } from '@/redux/reducers/languageSlice';
import { useTranslation } from '@/hooks/useTranslation';
import { resolveMediaUrl } from '@/utils/resolveMediaUrl';
import { PiPath } from 'react-icons/pi';

interface ResortCardItemProps {
  resort: ResortCard;
  className?: string;
}

const ResortCardItem = ({ resort, className = '' }: ResortCardItemProps) => {
  const router = useRouter();
  const langCode = useSelector(currentLangCodeSelector);
  const { t } = useTranslation();

  const handleClick = () => {
    router.push(`/${langCode}/properties/${resort.slug}`);
  };

  const locationText = [resort.city, resort.country].filter(Boolean).join(', ');
  const hasReviews = (resort.review_count || 0) > 0;

  return (
    <div
      className={`flex flex-col bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full border cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <div className="relative w-full h-[195px] sm:h-[236px] flex-shrink-0">
        <ImagePreview src={resolveMediaUrl(resort.image)} alt={resort.name} objectFit="cover" />
      </div>
      <div className="flex-1 px-3 pb-3 pt-2 flex flex-col justify-between">
        <div className="space-y-2">
          {hasReviews && (
            <PropertyRating rating={resort.rating || 0} reviews={resort.review_count} />
          )}
          <div className="flex items-start gap-2">
            <PropertyInfo
              name={resort.name}
              location={locationText}
              className="min-w-0 flex-1"
            />
            {resort.distance_km != null && (
              <div
                className="shrink-0 flex items-center gap-0.5 text-xs textSecondaryColor pt-0.5"
                title={`${resort.distance_km} ${t('km') || 'km'}`}
              >
                <PiPath className="text-sm" />
                <span className="whitespace-nowrap font-medium">
                  {resort.distance_km} {t('km') || 'km'}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="mt-4">
          <Divider />
          <PropertyPrice
            price={resort.starting_price}
            currency={resort.currency_symbol}
            simple
          />
        </div>
      </div>
    </div>
  );
};

export default ResortCardItem;
