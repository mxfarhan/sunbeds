'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { PiMagnifyingGlass, PiCaretDown, PiCheck, PiArrowLeft } from 'react-icons/pi';
import { formateDateForApi } from '@/utils/helpers';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { currentLangCodeSelector } from '@/redux/reducers/languageSlice';
import { getResortsApi } from '@/api/apiRoutes';
import { useQuery } from '@tanstack/react-query';
import { createPortal } from 'react-dom';
import { MarketCountry } from '@/hooks/useMarketCountry';

interface SunbedSearchBarProps {
  homePage?: boolean;
  countryId?: number | null;
  countries?: MarketCountry[];
  selectedCountry?: MarketCountry | null;
  onCountryChange?: (id: number) => void;
}

const BAR_HEIGHT = 'h-9'; // ~36px — matches flag chip

const SunbedSearchBar = ({
  homePage,
  countryId,
  countries = [],
  selectedCountry,
  onCountryChange,
}: SunbedSearchBarProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const langCode = useSelector(currentLangCodeSelector);

  const [search, setSearch] = useState('');
  const [selectedSlug, setSelectedSlug] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const [countryOpen, setCountryOpen] = useState(false);
  const [countryQuery, setCountryQuery] = useState('');
  const countryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = document.createElement('div');
    el.id = 'sunbed-search-portal';
    document.body.appendChild(el);
    setPortalRoot(el);
    return () => {
      if (document.body.contains(el)) document.body.removeChild(el);
    };
  }, []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!countryRef.current?.contains(e.target as Node)) {
        setCountryOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const { data: resortsData, isLoading } = useQuery({
    queryKey: ['resortSearch', search, countryId],
    enabled: search.trim().length > 0,
    queryFn: async () => {
      const res = await getResortsApi({
        search: search.trim(),
        limit: '20',
        offset: '0',
        country_id: countryId ? String(countryId) : '',
      });
      if (res?.error) throw new Error(res.message);
      return res?.data?.items ?? [];
    },
  });

  const resorts = resortsData ?? [];
  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(countryQuery.toLowerCase())
  );

  const goToResort = (slug: string) => {
    const date = formateDateForApi(new Date());
    router.push(`/${langCode}/properties/${slug}?date=${date}`);
    setMobileOpen(false);
  };

  const handleSearch = () => {
    if (selectedSlug) {
      goToResort(selectedSlug);
      return;
    }
    if (resorts.length === 1) {
      goToResort(resorts[0].slug);
    }
  };

  const selectResort = (slug: string, name: string) => {
    setSelectedSlug(slug);
    setSelectedName(name);
    setSearch('');
    goToResort(slug);
  };

  const countryPicker = onCountryChange ? (
    <div className="relative shrink-0" ref={countryRef}>
      <button
        type="button"
        onClick={() => setCountryOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-lg border bg-white px-2 ${BAR_HEIGHT} hover:bg-[var(--neutral-50,#f8fafc)] transition-colors`}
        aria-label={t('changeCountry') || 'Change country'}
      >
        {selectedCountry?.flag ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={selectedCountry.flag}
            alt={selectedCountry.name}
            className="w-6 h-4 object-cover rounded-sm shadow-sm"
          />
        ) : (
          <span className="w-6 h-4 rounded-sm bg-gray-200" />
        )}
        <PiCaretDown className="textSecondaryColor text-sm" />
      </button>
      {countryOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-64 max-h-72 overflow-hidden rounded-2xl border bg-white shadow-xl">
          <div className="p-2 border-b">
            <input
              value={countryQuery}
              onChange={(e) => setCountryQuery(e.target.value)}
              placeholder={t('searchCountry') || 'Search country...'}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
            />
          </div>
          <div className="overflow-y-auto max-h-56">
            {filteredCountries.map((country) => (
              <button
                key={country.id}
                type="button"
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bodyBg text-left"
                onClick={() => {
                  onCountryChange(country.id);
                  setCountryOpen(false);
                  setCountryQuery('');
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={country.flag} alt="" className="w-6 h-4 object-cover rounded-sm" />
                <span className="flex-1 text-sm font-medium">{country.name}</span>
                {country.id === selectedCountry?.id && <PiCheck className="primaryColor text-lg" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  ) : null;

  const resultsList = (compact = false) =>
    resorts.map((r: { id: number; slug: string; name: string; city?: string }) => (
      <button
        key={r.id}
        type="button"
        className={`w-full text-left hover:bodyBg border-b last:border-0 ${compact ? 'px-3 py-2.5' : 'p-4 border rounded-xl'}`}
        onClick={() => selectResort(r.slug, r.name)}
      >
        <span className="font-medium textPrimaryColor text-sm">{r.name}</span>
        {r.city && <span className="textSecondaryColor text-xs ml-2">{r.city}</span>}
      </button>
    ));

  const desktopBar = (
    <div className={`max-lg:hidden flex items-center gap-2 bg-white rounded-xl shadow-[0px_4px_14px_0px_#0000000F] border p-1.5`}>
      <div className={`flex-1 relative min-w-0 flex items-center gap-1.5 rounded-lg border bg-[var(--neutral-50,#f8fafc)] px-2.5 ${BAR_HEIGHT}`}>
        <PiMagnifyingGlass className="textSecondaryColor text-sm shrink-0" />
        <input
          type="search"
          className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:textSecondaryColor h-full"
          placeholder={t('searchResortsOrCities') || 'Search resorts or cities...'}
          value={search || selectedName}
          onChange={(e) => {
            setSearch(e.target.value);
            setSelectedSlug('');
            setSelectedName('');
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        {search && resorts.length > 0 && !selectedSlug && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border rounded-xl shadow-lg max-h-56 overflow-y-auto">
            {resultsList(true)}
          </div>
        )}
        {search && !isLoading && resorts.length === 0 && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border rounded-xl shadow-lg px-3 py-2.5 text-sm textSecondaryColor">
            {t('noResortsFound') || 'No resorts found'}
          </div>
        )}
      </div>
      {countryPicker}
      <button
        type="button"
        onClick={handleSearch}
        className={`shrink-0 primaryBg text-white rounded-lg px-3 ${BAR_HEIGHT} flex items-center justify-center`}
        aria-label={t('search') || 'Search'}
      >
        <PiMagnifyingGlass className="text-sm" />
      </button>
    </div>
  );

  const mobileTrigger = (
    <div className="flex lg:hidden items-center gap-2">
      <div
        className={`flex-1 bg-white rounded-xl border px-2.5 cursor-pointer items-center gap-2 flex min-w-0 ${BAR_HEIGHT}`}
        onClick={() => setMobileOpen(true)}
      >
        <PiMagnifyingGlass className="textSecondaryColor text-sm shrink-0" />
        <p className="text-sm textSecondaryColor truncate">
          {t('searchResortsOrCities') || 'Search resorts or cities...'}
        </p>
      </div>
      {countryPicker}
    </div>
  );

  const mobileSheet = portalRoot && mobileOpen && createPortal(
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col lg:hidden">
      <div className="flex items-center gap-3 p-3 border-b">
        <button type="button" onClick={() => setMobileOpen(false)}>
          <PiArrowLeft className="text-xl" />
        </button>
        <span className="font-semibold text-sm">{t('searchResorts') || 'Search resorts'}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <div className={`flex items-center gap-2 rounded-xl border px-2.5 ${BAR_HEIGHT}`}>
          <PiMagnifyingGlass className="textSecondaryColor text-sm shrink-0" />
          <input
            autoFocus
            type="search"
            className="flex-1 min-w-0 bg-transparent text-sm outline-none h-full"
            placeholder={t('searchResortsOrCities') || 'Search resorts or cities...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {isLoading ? (
          <p className="textSecondaryColor text-sm">{t('loading')}</p>
        ) : resorts.length === 0 && search ? (
          <p className="textSecondaryColor text-sm">{t('noResortsFound') || 'No resorts found'}</p>
        ) : (
          resultsList(false)
        )}
      </div>
    </div>,
    portalRoot
  );

  return (
    <div className={homePage ? '' : 'bg-white md:bg-transparent'}>
      <div className={homePage ? 'px-3' : 'container py-6'}>
        {desktopBar}
        {mobileTrigger}
        {mobileSheet}
      </div>
    </div>
  );
};

export default SunbedSearchBar;
