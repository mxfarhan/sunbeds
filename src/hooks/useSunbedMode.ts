'use client';

import { useSelector } from 'react-redux';
import { bookingModeSelector, businessModeSelector } from '@/redux/reducers/settingsSlice';
import { BasicDetails } from '@/hooks/queries/useSettings';

export const useSunbedMode = (): boolean => {
  const bookingMode = useSelector(bookingModeSelector);
  const businessMode = useSelector(businessModeSelector) as BasicDetails | undefined;
  return bookingMode === 'sunbed' || businessMode?.property_type === 'Resort';
};
