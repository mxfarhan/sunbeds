'use client'
import Link from 'next/link'
import LanguageModal from '@/components/modalsAndSheets/LanguageModal';
import { PiBuildings, PiHeart, PiHouse, PiImages, PiInfo, PiLockers, PiPhone, PiQuestion, PiTicket, PiUserCircle } from 'react-icons/pi';
import { useTranslation } from '@/hooks/useTranslation';
import MenusDropdown from '@/components/dropdowns/MenusDropdown';
import ProfileDropdown from '@/components/dropdowns/ProfileDropdown';
import { usePathname, useParams } from 'next/navigation';
import MobileNav from './MobileNav';
import { NavLinksType } from '@/types/GlobalTypes';
import ImagePreview from '@/components/storyBook/atoms/ImagePreview';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { isLoginSelector, userDataSelector } from '@/redux/reducers/userSlice';
import { settingsSelector } from '@/redux/reducers/settingsSlice';
import { BasicDetails, useSettings } from '@/hooks/queries/useSettings';
import { usePrefetchedSettings } from '@/components/SettingsHydrator';
import { currentLangCodeSelector } from '@/redux/reducers/languageSlice';
import { setIsFromSearch, setLoginModalState } from '@/redux/reducers/helpersReducer';
import { Button } from '@/components/storyBook/atoms/Button';

const Header = () => {

    const { t } = useTranslation();
    const pathname = usePathname();
    const params = useParams();
    const dispatch = useDispatch();

    const isLogin = useSelector(isLoginSelector);
    // Prefer server-prefetched settings so SSR + first client paint match (redux-persist
    // would otherwise rehydrate a different nav mode and cause hydration errors).
    const prefetched = usePrefetchedSettings();
    const { data: settingsQuery } = useSettings();
    const reduxSettings = useSelector(settingsSelector);
    const settingsData = settingsQuery?.data ?? prefetched?.data ?? reduxSettings;
    const businessMode = settingsData?.basic_details as BasicDetails | undefined;
    const bookingMode = businessMode?.booking_mode
        ?? (businessMode?.property_type === 'Resort' ? 'sunbed' : 'hotel');
    const isSunbedMode = bookingMode === 'sunbed' || businessMode?.property_type === 'Resort';
    const reduxLangCode = useSelector(currentLangCodeSelector)
    const langCode = (params?.langCode as string) ?? reduxLangCode ?? 'en';
    const logo = settingsData?.branding?.logo
    const userData = useSelector(userDataSelector);

    const [scrolled, setScrolled] = useState(false);
    const [mounted, setMounted] = useState(false);

    const isSingleHotel = businessMode?.business_mode === 'single' && businessMode?.no_of_properties === 1;
    const isLoggedIn = mounted && isLogin;
    const isHomePage = pathname === '/' || pathname === `/${langCode}`;

    const sunbedNavLinks: NavLinksType[] = [
        {
            id: 1,
            label: t('home'),
            link: `/${langCode}`,
            icon: <PiHouse />
        },
        {
            id: 2,
            label: t('properties'),
            link: `/${langCode}/properties`,
            icon: <PiLockers />
        },
        {
            id: 4,
            label: t('aboutUs'),
            link: `/${langCode}/about-us`,
            icon: <PiInfo />
        },
        {
            id: 5,
            label: t('contactUs'),
            link: `/${langCode}/contact-us`,
            icon: <PiPhone />
        },
        {
            id: 6,
            label: t('helpSupport'),
            link: `/${langCode}/help-support`,
            icon: <PiQuestion />
        },
    ];

    const singleHotelLinks: NavLinksType[] = [
        {
            id: 1,
            label: t('home'),
            link: `/${langCode}`,
            icon: <PiHouse />

        },
        businessMode?.no_of_properties > 1 ? {
            id: 2,
            label: t('properties'),
            link: `/${langCode}/properties`,
            icon: <PiLockers />
        } : {
            id: 2,
            label: t('rooms'),
            link: `/${langCode}/rooms`,
            icon: <PiLockers />
        },
        ...(isSingleHotel && businessMode?.no_of_properties === 1 ? [{
            id: 3,
            label: t('gallery'),
            link: `/${langCode}/gallery`,
            icon: <PiImages />
        }] : []),
        {
            id: 4,
            label: t('aboutUs'),
            link: `/${langCode}/about-us`,
            icon: <PiInfo />
        },
        {
            id: 5,
            label: t('contactUs'),
            link: `/${langCode}/contact-us`,
            icon: <PiPhone />
        },
        {
            id: 6,
            label: t('helpSupport'),
            link: `/${langCode}/help-support`,
            icon: <PiQuestion />
        },
    ];


    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, []);

    const handlePropertyRoomLink = (link: string) => {
        if (link === `/${langCode}/rooms` || link === `/${langCode}/properties`) {
            dispatch(setIsFromSearch(false));
        }
    }

    const openLoginModal = () => dispatch(setLoginModalState(true));

    const showMobileBottomNav = mounted && (
        isHomePage
        || pathname === `/${langCode}/account`
        || pathname === `/${langCode}/my-bookings`
        || pathname === `/${langCode}/properties`
        || pathname.startsWith(`/${langCode}/properties/`)
        || pathname === `/${langCode}/rooms`
        || pathname.startsWith(`/${langCode}/rooms/`)
    );

    return (
        <header suppressHydrationWarning className={`${isSingleHotel ? 'bg-white' : ''} ${pathname !== '/' ? 'bg-white' : `${scrolled ? 'bg-white' : isSingleHotel ? '' : 'md:mt-6'}`} border-b ${pathname !== '/' || scrolled ? 'primaryLightBorderColor' : 'border-transparent'} fixed top-0 z-50 w-full transition-[background-color,border-color] duration-500 ease-in-out`}>
            <div className={`hidden md:block ${isHomePage ? `${scrolled ? 'container' : 'max-1680:!container 2xl:max-w-[1872px] mx-auto'}` : 'container'} transition-[max-width,padding] duration-500 ease-in-out`}>
                <div className={`bg-white ${isHomePage && !scrolled ? 'p-6' : 'py-6'} rounded-2xl relative transition-[padding] duration-500 ease-in-out`}>
                    <div className='flex items-center justify-between'>
                        <div>
                            <Link href={`/${langCode}`} title='Pliiz Sunbed'>
                                <div className='w-auto h-[56px]!'>
                                    <ImagePreview src={logo} alt='Pliiz Sunbed' className='w-auto!' />
                                </div>
                            </Link>
                        </div>
                        {
                            isSingleHotel &&
                            <nav className='max-1199:hidden flexCenter gap-6'>
                                {singleHotelLinks.map((item) => (
                                    <Link href={item.link} key={item.id} className={`font-medium  pb-2 ${pathname === item.link ? 'border-b-2 primaryBorder' : ''} `} onClick={() => {
                                        handlePropertyRoomLink(item.link)
                                    }}>
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                        }
                        {
                            isSunbedMode && !isSingleHotel &&
                            <nav className='max-1199:hidden flexCenter gap-6'>
                                {sunbedNavLinks.map((item) => (
                                    <Link href={item.link} key={item.id} className={`font-medium pb-2 ${pathname === item.link || (item.link.endsWith('/properties') && pathname.includes('/properties')) ? 'border-b-2 primaryBorder' : ''}`} onClick={() => {
                                        handlePropertyRoomLink(item.link)
                                    }}>
                                        {item.label}
                                    </Link>
                                ))}
                            </nav>
                        }
                        {
                            isSingleHotel &&
                            <div className='flexCenter gap-4'>
                                <LanguageModal />
                                <div className='md:block hidden'>
                                    {
                                        isLoggedIn ? (
                                            <ProfileDropdown />
                                        ) : (
                                            <Button variant="primary" size="md" className="primaryBtn btn_md flexCenter gap-2" leftIcon={<PiUserCircle size={24} />} onClick={openLoginModal}>
                                                {t('loginSignUp')}
                                            </Button>
                                        )
                                    }
                                </div>
                                <div className='lg:hidden max-1199:block '>
                                    <MobileNav navLinks={singleHotelLinks} />
                                </div>
                            </div>
                        }
                        {
                            isSunbedMode && !isSingleHotel &&
                            <div className='flexCenter gap-4'>
                                <LanguageModal />
                                <Link href={'/list-property'} className='max-xl:hidden flexCenter gap-2 border py-2 px-4 rounded-full'>
                                    <PiBuildings size={24} />
                                    <span>{t('listYourResort')}</span>
                                </Link>
                                {
                                    isLoggedIn ? (
                                        <ProfileDropdown />
                                    ) : (
                                        <Button variant="primary" size="md" className="primaryBtn btn_md flexCenter gap-2" leftIcon={<PiUserCircle size={24} />} onClick={openLoginModal}>
                                            {t('loginSignUp')}
                                        </Button>
                                    )
                                }
                                <div className='lg:hidden max-1199:block'>
                                    <MobileNav navLinks={sunbedNavLinks} />
                                </div>
                            </div>
                        }
                        {

                            !isSingleHotel && !isSunbedMode &&
                            <nav className='flexCenter gap-4'>
                                <LanguageModal />
                                <Link href={'/list-property'} className='flexCenter gap-2 border py-2 px-4 rounded-full'>
                                    <PiBuildings size={24} />
                                    <span>{isSunbedMode ? t('listYourResort') : t('listYourProperty')}</span>
                                </Link>
                                {
                                    isLoggedIn ? (
                                        <ProfileDropdown />
                                    ) : (
                                        <Button variant="primary" size="md" className="primaryBtn btn_md flexCenter gap-2" leftIcon={<PiUserCircle size={24} />} onClick={openLoginModal}>
                                            {t('loginSignUp')}
                                        </Button>
                                    )
                                }
                                <MenusDropdown />
                            </nav>
                        }

                    </div>
                </div>
            </div>
            {
                isHomePage &&
                <div className='bg-white py-3 md:hidden'>
                    <div className='container'>
                        {
                            isLoggedIn ? (
                                <Link href={`/${langCode}/account`} className='flex items-center gap-3'>
                                    <span className='w-12 h-12 rounded-full flexCenter text-white'>
                                        <ImagePreview src={userData?.profile} alt='user-profile' rounded='full' />
                                    </span>
                                    <div className='flex flex-col text-sm'>
                                        <span className='textSecondaryColor'>{t('welcomeBack')} 👋</span>
                                        <span>{userData?.name}</span>
                                    </div>
                                </Link>
                            ) : (
                                <button type="button" onClick={openLoginModal} className='flex items-center gap-3 w-full text-left'>
                                    <span className='bg-(--neutral-200) w-12 h-12 rounded-full flexCenter'>
                                        <PiUserCircle size={24} />
                                    </span>
                                    <div className='flex flex-col text-sm'>
                                        <span className='textSecondaryColor'>{t('helloThere')} 👋</span>
                                        <span className='textPrimaryColor!'>{t('guest')} — {t('loginSignUp')}</span>
                                    </div>
                                </button>
                            )
                        }
                    </div>
                </div>
            }

            {/* Mobile top bar — resort/property pages */}
            {
                mounted && !isHomePage && (isSunbedMode || isSingleHotel) &&
                <div className='md:hidden bg-white border-b py-3'>
                    <div className='container flex items-center justify-between gap-3'>
                        <Link href={`/${langCode}`} title='Pliiz Sunbed'>
                            <div className='w-auto h-10'>
                                <ImagePreview src={logo} alt='Pliiz Sunbed' className='w-auto!' />
                            </div>
                        </Link>
                        <div className='flex items-center gap-2 shrink-0'>
                            {
                                isLoggedIn ? (
                                    <ProfileDropdown />
                                ) : (
                                    <Button variant="primary" size="sm" className="primaryBtn flexCenter gap-1" leftIcon={<PiUserCircle size={20} />} onClick={openLoginModal}>
                                        {t('login')}
                                    </Button>
                                )
                            }
                        </div>
                    </div>
                </div>
            }

            {/* mobile bottom navigation */}
            {
                showMobileBottomNav &&
                (() => {
                    const isHome = isHomePage
                    const isProfile = pathname.includes('/account')
                    const isBookings = pathname.includes('/my-bookings')

                    const midLink = isSingleHotel
                        ? businessMode?.no_of_properties > 1
                            ? { href: `/${langCode}/properties`, labelKey: t('properties'), icon: <PiLockers size={24} /> }
                            : { href: `/${langCode}/rooms`, labelKey: t('rooms'), icon: <PiLockers size={24} /> }
                        : isSunbedMode
                            ? { href: `/${langCode}/properties`, labelKey: t('properties'), icon: <PiLockers size={24} /> }
                            : { href: `/${langCode}/wishlist`, labelKey: t('wishlist'), icon: <PiHeart size={24} /> }

                    const NavItem = ({ href, active, icon, label, onClick }: { href: string; active: boolean; icon: React.ReactNode; label: string; onClick?: () => void }) => (
                        <Link href={href} onClick={onClick} className={`flex-1 relative inline-flex flex-col justify-start items-center ${active ? 'h-14' : ''}`}>
                            {active && (
                                <div className='absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center'>
                                    <span className='w-6 h-1 primaryBg rounded-3xl block' />
                                    <svg width="24" height="18" viewBox="0 0 21 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <defs>
                                            <linearGradient id="navFunnelGrad" x1="10.1719" y1="0" x2="10.1719" y2="14.5116" gradientUnits="userSpaceOnUse">
                                                <stop stopColor="var(--primary-color)" stopOpacity="0.3" />
                                                <stop offset="1" stopColor="white" stopOpacity="0.5" />
                                            </linearGradient>
                                        </defs>
                                        <path opacity="0.4" d="M5.82881 13.2617L0.337048 3.75004C-0.625241 2.08337 0.577569 0 2.50209 0H17.8418C19.7663 0 20.9691 2.08333 20.0068 3.75L14.5153 13.2616C14.0687 14.0351 13.2434 14.5116 12.3502 14.5116H7.99386C7.10071 14.5116 6.2754 14.0351 5.82881 13.2617Z" fill="url(#navFunnelGrad)" fillOpacity="0.7" />
                                    </svg>
                                </div>
                            )}
                            <div className={`inline-flex flex-col items-center gap-1 ${active ? 'absolute top-3 w-full' : 'pt-2'}`}>
                                <span className={active ? 'primaryColor' : 'textSecondaryColor'}>{icon}</span>
                                <span className={`text-sm ${active ? 'primaryColor font-medium' : 'textSecondaryColor font-normal'}`}>{label}</span>
                            </div>
                        </Link>
                    )

                    return (
                        <div className='md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50'>
                            <nav className='flex items-end justify-around px-4 pt-2 pb-4'>
                                <NavItem href={`/${langCode}`} active={isHome} icon={<PiHouse size={24} />} label={t('home')} />
                                <NavItem href={`/${langCode}/my-bookings`} active={isBookings} icon={<PiTicket size={24} />} label={t('myBooking')} />
                                <NavItem href={midLink.href} active={pathname === midLink.href || pathname.startsWith(`${midLink.href}/`)} icon={midLink.icon} label={midLink.labelKey} onClick={() => handlePropertyRoomLink(midLink.href)} />
                                <NavItem href={`/${langCode}/account`} active={isProfile} icon={<PiUserCircle size={24} />} label={t('profile')} />
                            </nav>
                        </div>
                    )
                })()
            }
        </header >
    )
}

export default Header
