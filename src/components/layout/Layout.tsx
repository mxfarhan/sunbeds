"use client";
import React, { useEffect, useState } from "react";
import Footer from "./Footer";
import Header from "./header/Header";
import { useDispatch, useSelector } from "react-redux";
import { isLoginSelector, setUserData, userDataSelector } from "@/redux/reducers/userSlice";
import { userDetailsType } from "@/types/GlobalTypes";
import { toast } from '@/lib/toast';
import { useTranslation } from "@/hooks/useTranslation";
import { useLogoutUser } from "@/hooks/logoutUser";
import { useSettings } from "@/hooks/queries/useSettings";
import { setSettings, settingsSelector } from "@/redux/reducers/settingsSlice";
import { bookingDetailsSelector, setBookingDetails } from "@/redux/reducers/bookingDetailsSlice";
import { addDays } from "date-fns";
import { formateDate, formateDateForApi } from "@/utils/helpers";
import { generateColorShades } from "@/utils/colorShades";
import MainLoader from "../commonComponents/MainLoader";
import { currentLanguageSelector, setCurrentLanguage, setIsRTL } from "@/redux/reducers/languageSlice";
import EmptyStatus from "../commonComponents/EmptyStatus";
import { useGetUserDetails } from "@/hooks/queries/profile/useGetUserDetails";
import { usePathname, useRouter } from "next/navigation";
import CookiesComponent from "../CookiesComp";
import { useBookingDetails } from "@/contexts/BookingDetails";
import AuthModals from "../auth/AuthModals";

const Layout = ({ children }: { children: React.ReactNode }) => {

  const { t } = useTranslation();
  const { handleUserLogout } = useLogoutUser();
  const dispatch = useDispatch();
  const pathname = usePathname();
  const router = useRouter();

  const userDetails = useSelector(userDataSelector) as userDetailsType;
  const isLogin = useSelector(isLoginSelector);
  const userStatus = userDetails?.status;
  const currentLanguage = useSelector(currentLanguageSelector);

  const bookingDetails = useSelector(bookingDetailsSelector);
  const { bookingData, setBookingData } = useBookingDetails();

  const settings = useSelector(settingsSelector);

  const [mounted, setMounted] = useState(false)
  const { data: settingsData, isLoading: settingsLoading, error: settingsError, isError: isSettingsError } = useSettings();

  const hasSettings = Boolean(
    settingsData?.data?.basic_details ||
    settings?.basic_details?.property_type,
  );

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (isSettingsError) {
      console.log(settingsError)
      return
    }
    if (!settingsData?.data) return

    dispatch(setSettings(settingsData.data));
    if (pathname === '/') {
      // router.replace(`/${settingsData.data.languages?.find((lang: any) => lang.is_default)?.code || 'en'}`);
    }

    const availableLanguages = settingsData.data.languages ?? [];
    const defaultLanguage = availableLanguages.find(lang => lang.is_default);

    if (!currentLanguage) {
      if (defaultLanguage) {
        dispatch(setCurrentLanguage(defaultLanguage));
        dispatch(setIsRTL(defaultLanguage.is_rtl));
      }
    } else {
      const stillExists = availableLanguages.some(lang => lang.code === currentLanguage.code);
      if (!stillExists && defaultLanguage) {
        dispatch(setCurrentLanguage(defaultLanguage));
        dispatch(setIsRTL(defaultLanguage.is_rtl));
        // router.replace(`/${defaultLanguage.code}`);
      }
    }
  }, [settingsData, settingsError, isSettingsError]);


  const { data: userDetailsData, error: userDetailsError,isError } = useGetUserDetails(isLogin);

  useEffect(() => {
    if (isError && userDetailsError) {
      const message = userDetailsError instanceof Error
        ? userDetailsError.message
        : String(userDetailsError)
      toast.error(message)
      console.log('user api error =>', message)
    }
    if (!isLogin) return;
    if (userDetailsData?.data?.user) {
      dispatch(setUserData(userDetailsData.data.user));
    }
  }, [isLogin, userDetailsData, userDetailsError, isError, dispatch]);

  useEffect(() => {
    // 0 = inactive | 1 = active | 2 = suspend
    if (userStatus === undefined || userStatus === null) return;
    if (userStatus === 0) {
      toast.error(t("accountInactive"));
      handleUserLogout();
    }
    if (userStatus === 2) {
      toast.error(t("accountSuspended"));
      handleUserLogout();
    }
  }, [userDetails]);


  useEffect(() => {

    const checkIn = new Date(formateDateForApi(bookingDetails?.checkIn));
    const checkOut = new Date(formateDateForApi(bookingDetails?.checkout));
    const contextCheckIn = new Date(formateDateForApi(bookingData?.checkIn));
    const contextCheckOut = new Date(formateDateForApi(bookingData?.checkout));
    const today = new Date();

    let newCheckIn = checkIn;
    let newCheckOut = checkOut;

    if (checkIn < today) {
      newCheckIn = new Date();
    }
    if (checkOut <= newCheckIn) {
      newCheckOut = addDays(newCheckIn, 1);
    }

    if (newCheckIn !== checkIn || newCheckOut !== checkOut) {
      dispatch(setBookingDetails({ ...bookingDetails, checkIn: formateDate(newCheckIn), checkout: formateDate(newCheckOut) }));
    }

    let newContextCheckIn = contextCheckIn;
    let newContextCheckOut = contextCheckOut;

    if (contextCheckIn < today) {
      newContextCheckIn = new Date();
    }
    if (contextCheckOut <= newContextCheckIn) {
      newContextCheckOut = addDays(newContextCheckIn, 1);
    }

    if (newContextCheckIn !== contextCheckIn || newContextCheckOut !== contextCheckOut) {
      setBookingData({ ...bookingData, checkIn: formateDate(newContextCheckIn), checkout: formateDate(newContextCheckOut) });
    }
  }, []);

  // Sync booking details to booking context
  useEffect(() => {
    if (pathname !== '/confirm-booking') {
      setBookingData(bookingDetails);
    }
  }, [bookingDetails, pathname]);


  useEffect(() => {
    document.documentElement.style.setProperty('--loader-color', process.env.NEXT_PUBLIC_LOADER_COLOR || '#1A73E8')

    if (settings) {
      const rawColor = settings?.branding?.primary_color || '#1A73E8';
      const primaryColor = rawColor.startsWith('#') ? rawColor : `#${rawColor}`;

      const setShades = (prefix: string, baseVar: string, hex: string, levels: readonly number[], lastLevel?: number) => {
        const shades = generateColorShades(hex);
        document.documentElement.style.setProperty(baseVar, shades[500]);
        levels.forEach((n) => {
          document.documentElement.style.setProperty(`--${prefix}-${n}`, shades[n as keyof typeof shades]);
        });
        if (lastLevel !== undefined) {
          document.documentElement.style.setProperty(`--${prefix}-${lastLevel}`, shades[950]);
        }
      };

      const STD = [50, 100, 200, 300, 400, 600, 700, 800, 900, 950] as const;
      const NO_950 = [50, 100, 200, 300, 400, 600, 700, 800, 900] as const;

      // primary: --primary-color base, --primary-color-{n} shades
      const primaryShades = generateColorShades(primaryColor);
      document.documentElement.style.setProperty('--primary-color', primaryShades[500]);
      STD.forEach((n) => document.documentElement.style.setProperty(`--primary-color-${n}`, primaryShades[n]));

      // success: --success-color base, --success-{n} shades
      setShades('success', '--success-color', '#20B364', STD);

      // error: --error-color base, --error-{n} shades
      setShades('error', '--error-color', '#D63031', STD);

      // warning: --warning-color base, --warning-{n} shades, 1000 instead of 950
      setShades('warning', '--warning-color', '#F79E1B', NO_950, 1000);

      // info: --info-color base, --info-{n} shades, 1000 instead of 950
      setShades('info', '--info-color', '#2196F3', NO_950, 1000);

      // secondary: single var, no shades
      document.documentElement.style.setProperty('--secondary-color', '#010211');


      // Set favicon from settings API
      if (settings?.web_config?.favicon) {
        const favicon: HTMLLinkElement = document.querySelector('link[rel="icon"]') as HTMLLinkElement || document.createElement("link") as HTMLLinkElement;
        favicon.rel = "icon";
        favicon.href = settings.web_config.favicon;
        if (!document.querySelector('link[rel="icon"]')) {
          document.head.appendChild(favicon);
        }
      }
    }

    if (settings?.basic_details?.business_mode === 'single' && settings?.basic_details?.no_of_properties === 1) {
      dispatch(setBookingDetails({ ...bookingDetails, location: settings?.basic_details?.slug }))
    }
  }, [settings]);

  useEffect(() => {
    if (currentLanguage && currentLanguage?.is_rtl) {
      document.documentElement.dir = 'rtl'
      document.documentElement.lang = `${currentLanguage && currentLanguage?.code}`
    } else {
      document.documentElement.dir = 'ltr'
      document.documentElement.lang = `${currentLanguage && currentLanguage?.code}`
    }
  }, [currentLanguage]);

  const maintenanceMode = settings?.general_config?.maintenance_mode;
  const cookiesMode = settings?.web_config?.cookies_enabled;


  return (
    settingsLoading && !hasSettings ?
      <MainLoader />
      :
      (isSettingsError && !hasSettings) ?
        <EmptyStatus title={t('somethingWentWrongTitle')} description={t('somethingWentWrongDescription')} type="somethingWentWrong" />
        :
        maintenanceMode ?
          <EmptyStatus title={t('maintenanceModeTitle')} description={t('maintenanceModeDescription')} type="maintenanceMode" />
          :
          <div>
            <Header />
            <AuthModals />
            <main className="headerPT">
              {children}
            </main>
            {
              cookiesMode &&
              <CookiesComponent />
            }
            <Footer />
          </div>
  );
};

export default Layout;
