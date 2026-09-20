'use client';

import { useTranslation } from '@/hooks/useTranslation';
import SectionInfo from '@/components/storyBook/molecules/SectionInfo';
import { ResortCard } from '@/hooks/queries/useResortsHome';
import ResortCardItem from './ResortCardItem';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { getDirection } from '@/utils/helpers';
import {
  RESORT_CARD_CAROUSEL_DESKTOP,
  RESORT_CARD_CAROUSEL_MOBILE,
} from './resortCardLayout';

interface TopRatedResortsProps {
  resorts: ResortCard[];
}

const TopRatedResorts = ({ resorts }: TopRatedResortsProps) => {
  const { t } = useTranslation();

  if (!resorts.length) return null;

  return (
    <section className="container mt-2 md:mt-3">
      <SectionInfo title={t('topRatedSunbeds') || t('topRatedStays') || 'Top Rated Sunbeds'} className="mb-5" />

      <Carousel opts={{ align: 'start', loop: false }} className="w-full hidden md:block" dir={getDirection()}>
        <div className="flex justify-end gap-4 mb-4">
          <CarouselPrevious className="relative translate-y-0 left-0 rtl:rotate-180" />
          <CarouselNext className="relative translate-y-0 right-0 rtl:rotate-180" />
        </div>
        <CarouselContent className="-ml-4">
          {resorts.map((resort) => (
            <CarouselItem key={resort.id} className={RESORT_CARD_CAROUSEL_DESKTOP}>
              <ResortCardItem resort={resort} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <Carousel opts={{ align: 'start', loop: false }} className="w-full md:hidden" dir={getDirection()}>
        <CarouselContent className="-ml-2">
          {resorts.map((resort) => (
            <CarouselItem key={resort.id} className={RESORT_CARD_CAROUSEL_MOBILE}>
              <ResortCardItem resort={resort} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
};

export default TopRatedResorts;
