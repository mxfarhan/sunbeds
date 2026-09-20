'use client';

import PropertyDetailsPage from '@/components/pagesComponent/property/PropertyDetailsPage';
import ResortBookingPage from '@/components/pagesComponent/resort/ResortBookingPage';
import { PropertiesApiResponse } from '@/hooks/queries/usePropertyDetails';
import { ResortDetailsApiResponse } from '@/hooks/queries/useResortDetails';
import { useSelector } from 'react-redux';
import { bookingModeSelector } from '@/redux/reducers/settingsSlice';

interface PropertySlugPageProps {
  propertyResData?: PropertiesApiResponse | null;
  resortResData?: ResortDetailsApiResponse | null;
  preferResort?: boolean;
}

const PropertySlugPage = ({ propertyResData, resortResData, preferResort }: PropertySlugPageProps) => {
  const bookingMode = useSelector(bookingModeSelector);
  const useResort = preferResort || bookingMode === 'sunbed';

  if (useResort && resortResData?.data) {
    return <ResortBookingPage resortResData={resortResData} />;
  }

  if (propertyResData) {
    return <PropertyDetailsPage propertyResData={propertyResData} />;
  }

  if (resortResData?.data) {
    return <ResortBookingPage resortResData={resortResData} />;
  }

  return <PropertyDetailsPage propertyResData={propertyResData} />;
};

export default PropertySlugPage;
