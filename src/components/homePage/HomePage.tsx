'use client'
import Layout from "../layout/Layout"
import Slider from "./sections/Slider"
import WhyBookWithUs from "./sections/WhyBookWithUs"
import AboutUs from "./singleHotelSections/AboutUs"
import HotelServices from "./singleHotelSections/HotelServices"
import SelectRooms from "./singleHotelSections/SelectRooms"
import HowItWorks from "./singleHotelSections/HowItWorks"
import EventsFacilities from "./singleHotelSections/EventsFacilities"
import Testimonials from "./singleHotelSections/Testimonials"
import TopRatedResorts from "./sections/TopRatedResorts"
import NearbyResorts from "./sections/NearbyResorts"
import AllResortsList from "./sections/AllResortsList"
import { useDispatch, useSelector } from "react-redux"
import { bookingModeSelector, businessModeSelector } from "@/redux/reducers/settingsSlice"
import { isLoginSelector } from "@/redux/reducers/userSlice"
import { BasicDetails } from "@/hooks/queries/useSettings"
import { AboutUsContent, useHomepageContent } from "@/hooks/queries/useHomepageContent"
import { useResortsHome } from "@/hooks/queries/useResortsHome"
import {
  NearbyLocation,
  readStoredNearbyLocation,
  useMarketCountry,
  writeStoredNearbyLocation,
} from "@/hooks/useMarketCountry"
import { useCallback, useEffect, useState } from "react"
import { setServices, setTestimonials } from "@/redux/reducers/helpersReducer"
import SunbedSearchBar from "../commonComponents/SunbedSearchBar"
import { Suspense } from "react"
import { updateProfileApi } from "@/api/apiRoutes"
import {
  getGeolocationBlockReason,
  requestBrowserPosition,
  reverseGeocodeAddress,
} from "@/utils/requestBrowserLocation"

const HomePage = () => {

    const dispatch = useDispatch();

    const businessMode = useSelector(businessModeSelector) as BasicDetails;
    const bookingMode = useSelector(bookingModeSelector);
    const isLogin = useSelector(isLoginSelector);
    const isSingleHotel = businessMode?.business_mode === 'single' && businessMode?.no_of_properties === 1;
    const isSunbedMode = bookingMode === 'sunbed' || businessMode?.property_type === 'Resort';

    const { data: homepageContent, isLoading, error } = useHomepageContent();
    const [radiusKm, setRadiusKm] = useState(20);
    const [location, setLocation] = useState<NearbyLocation | null>(null);
    const [locationDenied, setLocationDenied] = useState(false);
    const [locationError, setLocationError] = useState<'denied' | 'insecure' | 'unavailable' | null>(null);
    const [detectedCountryId, setDetectedCountryId] = useState<number | null>(null);

    const {
        countries,
        selectedCountryId,
        selectedCountry,
        setSelectedCountryId,
        hydrated,
    } = useMarketCountry(detectedCountryId);

    useEffect(() => {
        setLocation(readStoredNearbyLocation());
    }, []);

    const persistLocation = useCallback(async (next: NearbyLocation | null) => {
        setLocation(next);
        writeStoredNearbyLocation(next);
        if (next && isLogin) {
            try {
                await updateProfileApi({
                    address: next.address || '',
                    preferred_latitude: String(next.latitude),
                    preferred_longitude: String(next.longitude),
                    preferred_place_id: next.place_id || '',
                    current_country_id: selectedCountryId ? String(selectedCountryId) : '',
                });
            } catch {
                // local storage still keeps the preference for guests / offline
            }
        }
    }, [isLogin, selectedCountryId]);

    const requestGps = useCallback(() => {
        const blocked = getGeolocationBlockReason();
        if (blocked === 'insecure' || blocked === 'unsupported') {
            setLocationDenied(true);
            setLocationError(blocked === 'insecure' ? 'insecure' : 'unavailable');
            return;
        }

        void (async () => {
            try {
                const pos = await requestBrowserPosition();
                setLocationDenied(false);
                setLocationError(null);
                const address = await reverseGeocodeAddress(pos.latitude, pos.longitude);
                await persistLocation({
                    latitude: pos.latitude,
                    longitude: pos.longitude,
                    address,
                    source: 'gps',
                });
            } catch (err) {
                const reason = err instanceof Error ? err.message : 'denied';
                setLocationDenied(true);
                if (reason === 'insecure') setLocationError('insecure');
                else if (reason === 'denied') setLocationError('denied');
                else setLocationError('unavailable');
            }
        })();
    }, [persistLocation]);

    const { data: resortsHomeData, isLoading: resortsLoading } = useResortsHome(
        {
            latitude: location?.latitude,
            longitude: location?.longitude,
            radius_km: radiusKm,
            country_id: selectedCountryId ?? undefined,
        },
        isSunbedMode && !isSingleHotel && hydrated && !!selectedCountryId
    );

    useEffect(() => {
        const detected = resortsHomeData?.data?.detected_country_id ?? null;
        if (detected) setDetectedCountryId(detected);
    }, [resortsHomeData?.data?.detected_country_id]);

    useEffect(() => {
        // iOS Safari blocks geolocation without a user gesture — do not auto-prompt.
        // Only restore from storage (handled above) or wait for Locate me / address search.
        if (!isSunbedMode || isSingleHotel) return;
        if (getGeolocationBlockReason() === 'insecure') {
            setLocationError('insecure');
        }
    }, [isSunbedMode, isSingleHotel]);

    const aboutUs = homepageContent?.data?.about_us;
    const amenities = homepageContent?.data?.amenities;
    const testimonials = homepageContent?.data?.featured_reviews;

    const topRated = resortsHomeData?.data?.top_rated ?? [];
    const nearby = resortsHomeData?.data?.nearby ?? [];

    useEffect(() => {
        if (error) {
            console.log("error in homePageContent api =>", error);
        }
    }, [error])


    useEffect(() => {
        if (amenities && !error) {
            dispatch(setServices(amenities));
        }
        if (testimonials && !error) {
            dispatch(setTestimonials(testimonials));
        }
    }, [amenities, testimonials]);

    return (
        <Layout>
            {
                isSingleHotel ?
                    <>
                        <Slider />
                        <div className="bg-white -mt-14 py-10 lg:py-24 md:py-16">
                            <AboutUs aboutUsData={aboutUs as AboutUsContent} />
                            <HotelServices loading={isLoading} />
                            <SelectRooms />
                            <HowItWorks />
                            <EventsFacilities />
                            <Testimonials />
                        </div>
                    </>
                    :
                    isSunbedMode ?
                        <>
                            <div className="headerMT pt-[18px] pb-2">
                                <Suspense>
                                    <SunbedSearchBar
                                        homePage={true}
                                        countryId={selectedCountryId}
                                        countries={countries}
                                        selectedCountry={selectedCountry}
                                        onCountryChange={setSelectedCountryId}
                                    />
                                </Suspense>
                            </div>
                            <div className="bg-white pt-1">
                                {!resortsLoading && (
                                    <>
                                        <TopRatedResorts resorts={topRated} />
                                        <NearbyResorts
                                            resorts={nearby}
                                            radiusKm={radiusKm}
                                            onRadiusChange={setRadiusKm}
                                            location={location}
                                            locationDenied={locationDenied}
                                            locationError={locationError}
                                            onRequestGps={requestGps}
                                            onPlaceSelected={(place) => void persistLocation(place)}
                                        />
                                    </>
                                )}
                                <AllResortsList countryId={selectedCountryId} />
                                <WhyBookWithUs />
                            </div>
                        </>
                        :
                        <>
                            <Slider />
                            <div className="bg-white pt-10">
                                <WhyBookWithUs />
                            </div>
                        </>
            }
        </Layout>
    )
}

export default HomePage
