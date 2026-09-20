'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import SectionInfo from '@/components/storyBook/molecules/SectionInfo';
import { getResortsApi } from '@/api/apiRoutes';
import { useQuery } from '@tanstack/react-query';
import { ResortCard } from '@/hooks/queries/useResortsHome';
import ResortCardItem from './ResortCardItem';
import Pagination from '@/components/storyBook/atoms/Pagination';
import { Skeleton } from '@/components/ui/skeleton';
import Input from '@/components/storyBook/atoms/Input/Input';
import { PiMagnifyingGlass } from 'react-icons/pi';
import { RESORT_CARD_GRID } from './resortCardLayout';

const RESORTS_LIMIT = 12;

interface AllResortsListProps {
  countryId?: number | null;
}

const AllResortsList = ({ countryId }: AllResortsListProps) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const offset = (page - 1) * RESORTS_LIMIT;

  const { data, isLoading } = useQuery({
    queryKey: ['resortsList', page, debouncedSearch, countryId],
    enabled: countryId != null,
    queryFn: async () => {
      const response = await getResortsApi({
        limit: String(RESORTS_LIMIT),
        offset: String(offset),
        search: debouncedSearch,
        country_id: countryId ? String(countryId) : '',
      });
      if (response?.error) throw new Error(response.message);
      return response;
    },
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(search);
    setPage(1);
  };

  const items: ResortCard[] = data?.data?.items ?? [];
  const pagination = data?.data?.pagination;
  const totalPages = pagination?.last_page ?? 1;

  return (
    <section className="container commonMT pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-7">
        <SectionInfo title={t('allResorts') || 'All resorts'} />
        <form onSubmit={handleSearchSubmit} className="w-full md:max-w-sm">
          <Input
            placeholder={t('searchResorts') || 'Search resorts...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<PiMagnifyingGlass className="text-xl textSecondaryColor" />}
          />
        </form>
      </div>

      {isLoading ? (
        <div className={RESORT_CARD_GRID}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-2xl" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <>
          <div className={RESORT_CARD_GRID}>
            {items.map((resort) => (
              <ResortCardItem key={resort.id} resort={resort} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-8 flexCenter">
              <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
            </div>
          )}
        </>
      ) : (
        <p className="textSecondaryColor text-center py-10">{t('noResortsFound') || 'No resorts found'}</p>
      )}
    </section>
  );
};

export default AllResortsList;
