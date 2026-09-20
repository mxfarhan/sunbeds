'use client';

import Layout from '@/components/layout/Layout';
import { Typography } from '@/components/storyBook/atoms/Typography';
import { useResortDetails, ResortDetailsApiResponse, ResortMedia } from '@/hooks/queries/useResortDetails';
import SunbedBookingPanel from '@/components/sunbed/SunbedBookingPanel';
import ImagePreview from '@/components/storyBook/atoms/ImagePreview';
import RoomImgsSlider from '@/components/storyBook/atoms/RoomImgsSlider/RoomImgsSlider';
import PropertyRating from '@/components/storyBook/atoms/PropertyRating';
import PropertyPrice from '@/components/storyBook/atoms/PropertyPrice';
import ResortFacilitiesSection from '@/components/sunbed/ResortFacilitiesSection';
import { Skeleton } from '@/components/ui/skeleton';
import NoDataFound from '@/components/systemStates/NoDataFound';
import { PiMapPin, PiPath } from 'react-icons/pi';
import { useTranslation } from '@/hooks/useTranslation';
import { useMemo, useState } from 'react';
import LightBox from '@/components/lightBox/LightBox';
import { useRoadDistanceKm } from '@/hooks/useRoadDistanceKm';

interface ResortBookingPageProps {
  resortResData?: ResortDetailsApiResponse | null;
}

const ResortBookingPage = ({ resortResData }: ResortBookingPageProps) => {
  const { t } = useTranslation();
  const slug = resortResData?.data?.slug ?? '';
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const { data: clientData, isLoading, isError } = useResortDetails(slug, !resortResData?.data);
  const resort = resortResData?.data ?? clientData?.data;
  const distanceKm = useRoadDistanceKm(resort?.latitude, resort?.longitude);

  const mediaItems: ResortMedia[] = useMemo(() => {
    if (!resort) return [];
    if (resort.media?.length) return resort.media;
    return (resort.images ?? []).map((url, index) => ({
      id: index,
      url,
      media_type: 'image' as const,
      is_primary: index === 0,
    }));
  }, [resort]);

  const sliderImages = useMemo(
    () => mediaItems.map((item) => ({ src: item.url, media_type: item.media_type })),
    [mediaItems]
  );

  if (isLoading && !resort) {
    return (
      <Layout>
        <div className="container py-10 space-y-6">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </Layout>
    );
  }

  if (isError || !resort) {
    return (
      <Layout>
        <div className="h-screen flexCenter">
          <NoDataFound />
        </div>
      </Layout>
    );
  }

  const facilities = (resort.facilities ?? []).map((item, i) => {
    if (typeof item === 'string') {
      return { id: i + 1, name: item, icon: null as string | null, category: null as string | null };
    }
    return {
      id: item.id ?? i + 1,
      name: item.name,
      icon: item.icon ?? null,
      category: item.category ?? null,
    };
  });

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <Layout>
      <div className="overflow-x-hidden">
        {/* Mobile carousel */}
        {sliderImages.length > 0 && (
          <div className="lg:hidden">
            <RoomImgsSlider
              images={sliderImages}
              imageClassName="h-[280px]! aspect-390/280!"
              roomsDetailsPage
            />
          </div>
        )}

        {/* Desktop media grid */}
        {mediaItems.length > 0 && (
          <div className="hidden lg:block container commonPY">
            <div className="grid grid-cols-2 commonGap">
              <div
                className="cursor-pointer"
                onClick={() => openLightbox(0)}
              >
                <ImagePreview
                  src={mediaItems[0]?.url}
                  alt={resort.name}
                  rounded="2xl"
                  className="aspect-795/663"
                  objectFit="cover"
                />
              </div>
              <div className="grid grid-cols-2 commonGap">
                {mediaItems.slice(1, 5).map((item, idx) => (
                  <div
                    key={item.id}
                    className="cursor-pointer relative"
                    onClick={() => openLightbox(idx + 1)}
                  >
                    <ImagePreview
                      src={item.url}
                      alt={`${resort.name} ${idx + 2}`}
                      rounded="2xl"
                      className="aspect-383/318"
                      objectFit="cover"
                    />
                    {idx === 3 && mediaItems.length > 5 && (
                      <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                        <Typography variant="desc2" weight="semibold" className="text-white!">
                          +{mediaItems.length - 5} {t('photos') || 'photos'}
                        </Typography>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <LightBox
          images={sliderImages.map((img, i) => ({ src: img.src, alt: `${resort.name} ${i + 1}`, media_type: img.media_type }))}
          isOpen={lightboxOpen}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onIndexChange={setLightboxIndex}
        />

        <div className="container py-6 lg:py-12 px-4">
          <div className="grid grid-cols-12 gap-6 lg:gap-10">
            <div className="col-span-12 lg:col-span-7 space-y-6 order-2 lg:order-1">
              <div>
                <PropertyRating rating={resort.rating} reviews={resort.review_count} />
                <Typography variant="h3" weight="semibold" className="textPrimaryColor! mt-2">
                  {resort.name}
                </Typography>
                <div className="flex items-center gap-1.5 mt-2 textSecondaryColor min-w-0">
                  <PiMapPin className="text-lg shrink-0" />
                  <Typography variant="desc2" className="min-w-0 truncate">
                    {[resort.address, resort.city, resort.country].filter(Boolean).join(', ')}
                  </Typography>
                  {distanceKm != null && (
                    <>
                      <span className="shrink-0 opacity-60" aria-hidden>
                        ·
                      </span>
                      <span
                        className="shrink-0 inline-flex items-center gap-0.5 text-sm"
                        title={`${distanceKm} ${t('km') || 'km'}`}
                      >
                        <PiPath className="text-base" />
                        <span className="font-medium whitespace-nowrap">
                          {distanceKm} {t('km') || 'km'}
                        </span>
                      </span>
                    </>
                  )}
                </div>
                {resort.latitude && resort.longitude && (
                  <div className="mt-4 space-y-3">
                    <a
                      href={
                        resort.place_id
                          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              [resort.name, resort.city].filter(Boolean).join(' ')
                            )}&query_place_id=${encodeURIComponent(resort.place_id)}`
                          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              `${resort.latitude},${resort.longitude}`
                            )}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 primaryColor text-sm font-medium hover:underline"
                    >
                      <PiMapPin className="text-base" />
                      {t('openInMaps') || 'Open in Maps'}
                    </a>
                    <div className="overflow-hidden rounded-2xl border aspect-video bg-gray-100">
                      <iframe
                        title={`${resort.name} map`}
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(
                          `${resort.latitude},${resort.longitude}`
                        )}&z=15&output=embed`}
                        className="w-full h-full border-0"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
                <div className="mt-4">
                  <PropertyPrice
                    price={resort.starting_price}
                    currency={resort.currency_symbol}
                    simple
                  />
                </div>
              </div>

              {resort.description && (
                <div className="space-y-2">
                  <Typography variant="h6" weight="semibold" className="textPrimaryColor!">
                    {t('aboutResort') || 'About this resort'}
                  </Typography>
                  <Typography variant="desc2" className="textSecondaryColor! leading-relaxed">
                    {resort.description}
                  </Typography>
                </div>
              )}

              {facilities.length > 0 && (
                <ResortFacilitiesSection facilities={facilities} />
              )}
            </div>

            <div className="col-span-12 lg:col-span-5 lg:sticky lg:top-28 h-fit order-1 lg:order-2">
              <SunbedBookingPanel resort={resort} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResortBookingPage;
