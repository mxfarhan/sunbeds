'use client'
import SearchBar from "@/components/commonComponents/SearchBar";
import SunbedSearchBar from "@/components/commonComponents/SunbedSearchBar";
import Layout from "@/components/layout/Layout";
import { Typography } from "@/components/storyBook/atoms/Typography";
import SidebarFilter from "@/components/storyBook/organisms/SidebarFilter";
import { useTranslation } from "@/hooks/useTranslation";
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { SelectOpt } from "@/components/storyBook/atoms/SelectOpt"
import { Button } from "@/components/storyBook/atoms/Button";
import { PiXCircleFill } from "react-icons/pi";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { SidebarFilterTypes } from "@/types/GlobalTypes";
import SearchCard from "@/components/storyBook/organisms/searchCard";
import Pagination from "@/components/storyBook/atoms/Pagination";
import SidebarFilterSheet from "@/components/modalsAndSheets/SidebarFilterShee";
import { MobileBreadcrum } from "../../storyBook/molecules/mobileBreadcrum";
import { Room, useRooms, RoomsResponseData } from "@/hooks/queries/useRooms";
import { PaginationType } from "@/types/GlobalTypes";
import SearchCardSkeleton from "../../skeletons/SearchCardSkeleton";
import NoDataFound from "../../systemStates/NoDataFound";
import { Property, useProperties, PropertiesResponseData } from "@/hooks/queries/useProperties";
import { useResortsList } from "@/hooks/queries/useResortsList";
import ResortCardItem from "@/components/homePage/sections/ResortCardItem";
import { RESORT_CARD_GRID } from "@/components/homePage/sections/resortCardLayout";
import { useSelector } from "react-redux";
import { businessModeSelector, bookingModeSelector } from "@/redux/reducers/settingsSlice";
import { BasicDetails } from "@/hooks/queries/useSettings";
import { Facility } from "@/hooks/queries/useHomepageContent";
import { bookingDetailsSelector } from "@/redux/reducers/bookingDetailsSlice";
import { formateDateForApi } from "@/utils/helpers";
import { isFromSearchSelector } from "@/redux/reducers/helpersReducer";
import {
  readStoredNearbyLocation,
  useMarketCountry,
} from "@/hooks/useMarketCountry";
import { Skeleton } from "@/components/ui/skeleton";

const SearchPage = () => {

  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isInitialized = useRef(false);
  const isUpdatingFromURL = useRef(false);

  const pathname = usePathname();
  const roomsPage = pathname.includes('/rooms');

  const businessMode = useSelector(businessModeSelector) as BasicDetails;
  const bookingMode = useSelector(bookingModeSelector);
  const isSunbedMode = bookingMode === 'sunbed' || businessMode?.property_type === 'Resort';
  const bookingDetails = useSelector(bookingDetailsSelector);
  const isFromSearch = useSelector(isFromSearchSelector);

  const [coords, setCoords] = useState<{ latitude?: number; longitude?: number }>({});
  const {
    countries,
    selectedCountryId,
    selectedCountry,
    setSelectedCountryId,
    hydrated: countryHydrated,
  } = useMarketCountry();

  useEffect(() => {
    const stored = readStoredNearbyLocation();
    if (stored) {
      setCoords({ latitude: stored.latitude, longitude: stored.longitude });
      return;
    }
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  const hasCoords = coords.latitude != null && coords.longitude != null;

  const [sidebarFilter, setSidebarFilter] = useState<SidebarFilterTypes>({
    payAtProperty: false,
    minPrice: '',
    maxPrice: '',
    amenities: '',
    ratings: '',
    types: '',
    rules: '',
  });

  const [sortBy, setSortBy] = useState<string>('nearest');
  const sortInitialized = useRef(false);

  useEffect(() => {
    if (sortInitialized.current) return;
    if (hasCoords) {
      setSortBy('nearest');
      sortInitialized.current = true;
    } else if (countryHydrated) {
      setSortBy('highly_rated');
      sortInitialized.current = true;
    }
  }, [hasCoords, countryHydrated]);

  const [currentPage, setCurrentPage] = useState(1);

  const safeDecodeParam = (value: string | null): string => {
    if (!value) return '';
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  };

  const getFiltersFromURL = (): SidebarFilterTypes => {
    const params = new URLSearchParams(searchParams.toString());
    return {
      minPrice: safeDecodeParam(params.get('minPrice')),
      maxPrice: safeDecodeParam(params.get('maxPrice')),
      amenities: safeDecodeParam(params.get('amenities')),
      ratings: safeDecodeParam(params.get('ratings')),
      types: safeDecodeParam(params.get('types')),
      rules: safeDecodeParam(params.get('rules')),
    };
  };

  const updateURLWithFilters = (filters: SidebarFilterTypes) => {
    const params = new URLSearchParams(window.location.search);
    const filterKeys: (keyof SidebarFilterTypes)[] = ['minPrice', 'maxPrice', 'amenities', 'ratings', 'types', 'rules'];
    filterKeys.forEach(key => params.delete(key));
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.set(key, String(value));
      }
    });
    const queryString = params.toString().replace(/%2C/gi, ',');
    const newURL = queryString ? `?${queryString}` : window.location.pathname;
    router.replace(newURL, { scroll: false });
  };

  const clearAllFilters = () => {
    setSidebarFilter({
      minPrice: '',
      maxPrice: '',
      amenities: '',
      ratings: '',
      types: '',
      rules: '',
    });
    const params = new URLSearchParams(window.location.search);
    ['minPrice', 'maxPrice', 'amenities', 'ratings', 'types', 'rules'].forEach(key => params.delete(key));
    const queryString = params.toString().replace(/%2C/gi, ',');
    const newURL = queryString ? `?${queryString}` : window.location.pathname;
    router.replace(newURL, { scroll: false });
  };

  useEffect(() => {
    const urlFilters = getFiltersFromURL();
    const hasUrlFilters = Object.values(urlFilters).some(v => v && v !== '');
    if (hasUrlFilters) {
      isUpdatingFromURL.current = true;
      setSidebarFilter(urlFilters);
    }
    isInitialized.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (!isInitialized.current) return;
    if (isUpdatingFromURL.current) {
      isUpdatingFromURL.current = false;
      return;
    }
    updateURLWithFilters(sidebarFilter);
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sidebarFilter]);

  const hasActiveFilters = Object.values(sidebarFilter).some(v => v && v !== '');

  const totalFilterCount =
    (sidebarFilter.amenities ? sidebarFilter.amenities.split(',').filter(Boolean).length : 0) +
    (sidebarFilter.ratings ? sidebarFilter.ratings.split(',').filter(Boolean).length : 0) +
    (sidebarFilter.types ? sidebarFilter.types.split(',').filter(Boolean).length : 0) +
    (sidebarFilter.rules ? sidebarFilter.rules.split(',').filter(Boolean).length : 0);

  const sortByOpts = isSunbedMode
    ? [
        ...(hasCoords ? [{ label: t('nearestFirst') || 'Nearest first', value: 'nearest' }] : []),
        { label: t('priceLow'), value: 'price_low_high' },
        { label: t('priceHigh'), value: 'price_high_low' },
        { label: t('highlyRated'), value: 'highly_rated' },
      ]
    : [
        { label: t('priceHigh'), value: 'price_high_low' },
        { label: t('priceLow'), value: 'price_low_high' },
        { label: t('highlyRated'), value: 'highly_rated' },
      ];

  const { data: roomsData, isLoading: roomsLoading, error: roomsError } = useRooms({
    property_slug: bookingDetails.location,
    ...(isFromSearch && { check_in: formateDateForApi(bookingDetails.checkIn) }),
    ...(isFromSearch && { check_out: formateDateForApi(bookingDetails.checkout) }),
    rooms: bookingDetails.rooms,
    adults: bookingDetails.adults,
    children: bookingDetails.childrenCount,
    min_price: Number(sidebarFilter.minPrice),
    max_price: Number(sidebarFilter.maxPrice),
    amenities: sidebarFilter.amenities,
    sort_by: sortBy,
  }, currentPage, roomsPage);

  const { data: propertiesData, isLoading: propertiesLoading, error: propertiesError } = useProperties({
    amenities: sidebarFilter.amenities,
    ...(isFromSearch && { check_in: formateDateForApi(bookingDetails.checkIn) }),
    ...(isFromSearch && { check_out: formateDateForApi(bookingDetails.checkout) }),
    min_price: Number(sidebarFilter?.minPrice),
    max_price: Number(sidebarFilter?.maxPrice),
    pay_at_property: sidebarFilter.payAtProperty ? 1 : 0,
    sort_by: sortBy,
  }, currentPage, !roomsPage && !isSunbedMode);

  const {
    data: resortsData,
    isLoading: resortsLoading,
    error: resortsError,
  } = useResortsList(
    {
      country_id: selectedCountryId ?? undefined,
      latitude: coords.latitude,
      longitude: coords.longitude,
      sort_by: sortBy === 'nearest' && !hasCoords ? 'highly_rated' : sortBy,
      min_price: Number(sidebarFilter?.minPrice) || undefined,
      max_price: Number(sidebarFilter?.maxPrice) || undefined,
      limit: 12,
    },
    currentPage,
    isSunbedMode && !roomsPage && countryHydrated && !!selectedCountryId
  );

  const resData = (roomsPage ? roomsData?.data : propertiesData?.data) as RoomsResponseData | PropertiesResponseData | undefined;
  const isLoading = roomsPage ? roomsLoading : isSunbedMode ? resortsLoading : propertiesLoading;
  const error = roomsPage ? roomsError : isSunbedMode ? resortsError : propertiesError;
  const hotelPagination: PaginationType | undefined = resData?.pagination;
  const resortPagination = resortsData?.data?.pagination;
  const pagination = isSunbedMode && !roomsPage ? resortPagination : hotelPagination;
  const totalPages = pagination?.last_page ?? 1;

  const rooms: Room[] | Property[] = resData?.items ?? [];
  const resorts = resortsData?.data?.items ?? [];
  const listCount = isSunbedMode && !roomsPage ? resorts.length : rooms.length;
  const totalResults = pagination?.total ?? 0;
  const pageSize = isSunbedMode ? 12 : 10;

  const priceMin = roomsPage ? (resData as RoomsResponseData)?.converted_min_price : (resData as PropertiesResponseData)?.converted_min_price;
  const priceMax = roomsPage ? (resData as RoomsResponseData)?.converted_max_price : (resData as PropertiesResponseData)?.converted_max_price;
  const currencySymbol = roomsPage ? (resData as RoomsResponseData)?.converted_currency_symbol : (resData as PropertiesResponseData)?.converted_currency_symbol

  const [amenities, setAmenities] = useState<Facility[]>([]);

  useEffect(() => {
    if (error) {
      console.log('error fetching rooms/properties', error)
    }
  }, [error]);

  useEffect(() => {
    if (amenities?.length < 1 && resData?.facilities) {
      setAmenities(resData.facilities)
    }
  }, [resData, amenities?.length]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, selectedCountryId, coords.latitude, coords.longitude]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <Layout>
      <MobileBreadcrum title={isSunbedMode ? (t('resorts') || t('properties')) : t('properties')} />
      <Suspense>
        {isSunbedMode ? (
          <div className="pt-4 pb-2">
            <SunbedSearchBar
              homePage
              countryId={selectedCountryId}
              countries={countries}
              selectedCountry={selectedCountry}
              onCountryChange={setSelectedCountryId}
            />
          </div>
        ) : (
          <SearchBar />
        )}
      </Suspense>
      <section className="bg-white pb-30 md:commonPY">
        <div className="container">
          <div className="grid grid-cols-12 commonGap">
            {!isSunbedMode && (
              <div className="hidden lg:block lg:col-span-3">
                <SidebarFilter sidebarFilter={sidebarFilter} setSidebarFilter={setSidebarFilter} priceMin={priceMin} priceMax={priceMax} amenities={amenities} pricePrefix={currencySymbol} />
              </div>
            )}
            <div className={`col-span-12 space-y-6 ${isSunbedMode ? '' : 'lg:col-span-9'}`}>
              <div className="border rounded-2xl p-4 hidden md:flex items-center justify-between">
                <div className="flexCenter gap-4">
                  {!isSunbedMode && (
                    <div className="block lg:hidden">
                      <SidebarFilterSheet sidebarFilter={sidebarFilter} setSidebarFilter={setSidebarFilter} pricePrefix={currencySymbol} hasActiveFilters={hasActiveFilters} clearAll={clearAllFilters} priceMin={priceMin!} priceMax={priceMax!} amenities={amenities} />
                    </div>
                  )}
                  <div className="">
                    <Typography variant="h6" weight="semibold" children={`${t('showing')} ${listCount > 0 ? ((currentPage - 1) * pageSize) + 1 : 0}-${Math.min(currentPage * pageSize, totalResults)} ${t('of')} ${totalResults} ${t('results')}`} />
                  </div>
                </div>
                <SelectOpt
                  options={sortByOpts}
                  value={sortBy}
                  onChange={(v) => setSortBy(v)}
                />
              </div>

              <div className="w-full overflow-auto md:hidden">
                <div className="flexCenter gap-2 md:hidden w-max overflow-x-auto py-2">
                  {!isSunbedMode && (
                    <SidebarFilterSheet sidebarFilter={sidebarFilter} setSidebarFilter={setSidebarFilter} pricePrefix={currencySymbol} hasActiveFilters={hasActiveFilters} clearAll={clearAllFilters} priceMin={priceMin!} priceMax={priceMax!} amenities={amenities} />
                  )}
                  <SelectOpt
                    options={sortByOpts}
                    value={sortBy}
                    onChange={(v) => setSortBy(v)}
                    placeholder={t('sortBy')}
                    triggerClassName="w-fit h-9 border-gray-200 rounded-lg bodyBg"
                  />
                  {!isSunbedMode && hasActiveFilters && (
                    <div className="flex items-center gap-2">
                      {sidebarFilter.amenities && sidebarFilter.amenities.split(',').filter(Boolean).map(id => (
                        <Button
                          key={id}
                          variant="ghost"
                          size="sm"
                          children={amenities?.find(f => String(f.id) === id)?.name}
                          className="rounded-lg! h-9 w-max text-black!"
                          onClick={() => setSidebarFilter(prev => ({
                            ...prev,
                            amenities: prev.amenities.split(',').filter(a => a !== id).join(','),
                          }))}
                        />
                      ))}
                      {sidebarFilter.ratings && sidebarFilter.ratings.split(',').filter(Boolean).map(r => (
                        <Button
                          key={r}
                          variant="ghost"
                          size="sm"
                          children={`${r} Stars`}
                          className="rounded-lg! h-9 w-max text-black!"
                          onClick={() => setSidebarFilter(prev => ({
                            ...prev,
                            ratings: prev.ratings.split(',').filter(s => s !== r).join(','),
                          }))}
                        />
                      ))}
                      {sidebarFilter.types && sidebarFilter.types.split(',').filter(Boolean).map(type => (
                        <Button
                          key={type}
                          variant="ghost"
                          size="sm"
                          children={type.charAt(0).toUpperCase() + type.slice(1)}
                          className="rounded-lg! h-9 w-max text-black!"
                          onClick={() => setSidebarFilter(prev => ({
                            ...prev,
                            types: prev.types.split(',').filter(t => t !== type).join(','),
                          }))}
                        />
                      ))}
                      {sidebarFilter.rules && sidebarFilter.rules.split(',').filter(Boolean).map(rule => (
                        <Button
                          key={rule}
                          variant="ghost"
                          size="sm"
                          children={rule.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                          className="rounded-lg! h-9 w-max text-black!"
                          onClick={() => setSidebarFilter(prev => ({
                            ...prev,
                            rules: prev.rules.split(',').filter(r => r !== rule).join(','),
                          }))}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {!isSunbedMode && hasActiveFilters && (
                <div className="hidden md:flex items-center gap-2 flex-wrap">
                  {sidebarFilter.amenities && sidebarFilter.amenities.split(',').filter(Boolean).map(id => (
                    <Button
                      key={id}
                      variant="ghost"
                      size="md"
                      children={amenities?.find(f => String(f.id) === id)?.name}
                      rightIcon={<PiXCircleFill className="text-xl text-[#555555]" />}
                      className="rounded-2xl!"
                      onClick={() => setSidebarFilter(prev => ({
                        ...prev,
                        amenities: prev.amenities.split(',').filter(a => a !== id).join(','),
                      }))}
                    />
                  ))}
                  {sidebarFilter.ratings && sidebarFilter.ratings.split(',').filter(Boolean).map(r => (
                    <Button
                      key={r}
                      variant="ghost"
                      size="md"
                      children={`${r} Stars`}
                      rightIcon={<PiXCircleFill className="text-xl text-[#555555]" />}
                      className="rounded-2xl!"
                      onClick={() => setSidebarFilter(prev => ({
                        ...prev,
                        ratings: prev.ratings.split(',').filter(s => s !== r).join(','),
                      }))}
                    />
                  ))}
                  {sidebarFilter.types && sidebarFilter.types.split(',').filter(Boolean).map(type => (
                    <Button
                      key={type}
                      variant="ghost"
                      size="md"
                      children={type.charAt(0).toUpperCase() + type.slice(1)}
                      rightIcon={<PiXCircleFill className="text-xl text-[#555555]" />}
                      className="rounded-2xl!"
                      onClick={() => setSidebarFilter(prev => ({
                        ...prev,
                        types: prev.types.split(',').filter(t => t !== type).join(','),
                      }))}
                    />
                  ))}
                  {sidebarFilter.rules && sidebarFilter.rules.split(',').filter(Boolean).map(rule => (
                    <Button
                      key={rule}
                      variant="ghost"
                      size="md"
                      children={rule.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      rightIcon={<PiXCircleFill className="text-xl text-[#555555]" />}
                      className="rounded-2xl!"
                      onClick={() => setSidebarFilter(prev => ({
                        ...prev,
                        rules: prev.rules.split(',').filter(r => r !== rule).join(','),
                      }))}
                    />
                  ))}
                  {totalFilterCount > 5 && (
                    <Button
                      onClick={clearAllFilters}
                      variant="ghost"
                      size="md"
                      children={t('clearAll')}
                      rightIcon={<PiXCircleFill className="text-xl" />}
                      className="rounded-2xl! errorColor!"
                    />
                  )}
                </div>
              )}

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="md:hidden">
                    <Typography variant="h6" weight="bold" children={`${t('showing')} ${listCount} ${t('results')}`} />
                  </div>
                  {isSunbedMode && !roomsPage ? (
                    isLoading ? (
                      <div className={RESORT_CARD_GRID}>
                        {Array.from({ length: 8 }).map((_, index) => (
                          <Skeleton key={index} className="h-72 rounded-2xl" />
                        ))}
                      </div>
                    ) : resorts.length > 0 ? (
                      <div className={RESORT_CARD_GRID}>
                        {resorts.map((resort) => (
                          <ResortCardItem key={resort.id} resort={resort} />
                        ))}
                      </div>
                    ) : (
                      !isLoading && <NoDataFound />
                    )
                  ) : (
                    isLoading ?
                      Array.from({ length: 6 }).map((_, index) => (
                        <SearchCardSkeleton key={index} />
                      ))
                      :
                      rooms.length > 0 ?
                        rooms.map((item: Room | Property) => (
                          <SearchCard
                            key={item.id}
                            item={item}
                            propertyData={roomsData?.data?.property}
                          />
                        ))
                        :
                        !isLoading &&
                        <NoDataFound />
                  )}
                </div>
                {totalPages > 1 && (
                  <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                    siblingCount={1}
                    className="mt-8 justify-center"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default SearchPage
