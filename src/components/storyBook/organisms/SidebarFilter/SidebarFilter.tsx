'use client';

import React from 'react';
import FilterTitle from '@/components/storyBook/atoms/FilterTitle';
import Range from '@/components/storyBook/atoms/Range';
import Checkbox from '@/components/storyBook/atoms/Checkbox';
import StarRatings from '@/components/storyBook/atoms/startRatings';
import { SidebarFilterProps } from './SidebarFilter.type';
import { useTranslation } from '@/hooks/useTranslation';
import { isSingleHotelBranch } from '@/utils/helpers';
import { Typography } from '../../atoms/Typography';
import { usePathname } from 'next/navigation';

const STAR_OPTIONS = [5, 4, 3, 2, 1] as const;
const ITEMS_PER_STEP = 5;

const SidebarFilter: React.FC<SidebarFilterProps> = ({
    sidebarFilter,
    setSidebarFilter,
    priceMin = 0,
    priceMax = 1250,
    priceStep = 1,
    pricePrefix = '$',
    amenities,
    className = '',
}) => {

    const { t } = useTranslation();
    const isSingleBranch = isSingleHotelBranch();

    /* ── Derived values from shared state ── */
    const minPrice = sidebarFilter.minPrice ? Number(sidebarFilter.minPrice) : priceMin;
    const maxPrice = sidebarFilter.maxPrice ? Number(sidebarFilter.maxPrice) : priceMax;
    const currentPrice: [number, number] = [minPrice, maxPrice];
    const pathname = usePathname();

    const [localPrice, setLocalPrice] = React.useState<[number, number]>(currentPrice);

    // Track visible count per filter independently using filter id as key
    const [visibleCounts, setVisibleCounts] = React.useState<Record<string, number>>({});

    React.useEffect(() => {
        setLocalPrice(currentPrice);
    }, [currentPrice[0], currentPrice[1]]);

    const getVisibleCount = (filterId: string) => visibleCounts[filterId] ?? ITEMS_PER_STEP;

    const handleShowMore = (filterId: string, totalCount: number) => {
        setVisibleCounts(prev => ({ ...prev, [filterId]: totalCount }));
    };

    const handleShowLess = (filterId: string) => {
        setVisibleCounts(prev => ({ ...prev, [filterId]: ITEMS_PER_STEP }));
    };

    const currentAmenities = new Set(
        sidebarFilter.amenities ? sidebarFilter.amenities.split(',').filter(Boolean).map(Number) : []
    );

    const currentStars = new Set(
        sidebarFilter.ratings
            ? sidebarFilter.ratings.split(',').filter(Boolean).map(Number)
            : []
    );

    /* ── Handlers ── */
    const handleLocalPriceChange = (val: [number, number]) => setLocalPrice(val);

    const handlePriceChangeEnd = (val: [number, number]) => {
        setSidebarFilter(prev => ({
            ...prev,
            minPrice: String(val[0]),
            maxPrice: String(val[1]),
        }));
    };

    const handleAmenityChange = (id: string | number, checked: boolean) => {
        const numId = Number(id);
        setSidebarFilter(prev => {
            const existing = new Set(
                prev.amenities ? prev.amenities.split(',').filter(Boolean).map(Number) : []
            );
            checked ? existing.add(numId) : existing.delete(numId);
            return { ...prev, amenities: Array.from(existing).join(',') };
        });
    };

    const handleTypeChange = (id: string, checked: boolean) => {
        setSidebarFilter(prev => {
            const existing = new Set(prev.types ? prev.types.split(',').filter(Boolean) : []);
            checked ? existing.add(id) : existing.delete(id);
            return { ...prev, types: Array.from(existing).join(',') };
        });
    };

    const handleRuleChange = (id: string, checked: boolean) => {
        setSidebarFilter(prev => {
            const existing = new Set(prev.rules ? prev.rules.split(',').filter(Boolean) : []);
            checked ? existing.add(id) : existing.delete(id);
            return { ...prev, rules: Array.from(existing).join(',') };
        });
    };

    const handleStarChange = (stars: 1 | 2 | 3 | 4 | 5, checked: boolean) => {
        setSidebarFilter(prev => {
            const existing = new Set(
                prev.ratings ? prev.ratings.split(',').filter(Boolean).map(Number) : []
            );
            checked ? existing.add(stars) : existing.delete(stars);
            return { ...prev, ratings: Array.from(existing).join(',') };
        });
    };

    const filtersList = [
        {
            id: 'amenities',
            title: t("amenities"),
            items: amenities,
            currentSet: currentAmenities,
            onChange: handleAmenityChange,
            prefix: 'amenity',
        },
        // add more filters here — Show More works independently for each
    ];

    /* ── Reusable Show More/Less button ── */
    const ShowMoreButton = ({ filterId, totalCount }: { filterId: string; totalCount: number }) => {
        const visible = getVisibleCount(filterId);
        const hasMore = visible < totalCount;
        const canCollapse = visible > ITEMS_PER_STEP;

        if (!hasMore && !canCollapse) return null;

        return (
            <div className="flex gap-3 pb-2 justify-between">
                {hasMore && (
                    <button
                        type="button"
                        onClick={() => handleShowMore(filterId, totalCount)}
                        className="text-sm font-medium primaryColor"
                    >
                        + {t('showMore')}
                    </button>
                )}
                {canCollapse && (
                    <button
                        type="button"
                        onClick={() => handleShowLess(filterId)}
                        className="text-sm font-medium primaryColor"
                    >
                        - {t('showLess')}
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className='space-y-4'>
            <div className={`w-full bg-white md:rounded-2xl md:border md:p-4 flex flex-col overflow-hidden ${className}`}>

                {/* ── Price Range ── */}
                <div className='md:-mt-4'>
                    <FilterTitle title={t("priceRange")}>
                        <div className="pb-4">
                            <Range
                                min={priceMin}
                                max={priceMax}
                                value={localPrice}
                                step={priceStep}
                                prefix={pricePrefix}
                                onChange={handleLocalPriceChange}
                                onChangeEnd={handlePriceChangeEnd}
                                minLabel={t("minPrice")}
                                maxLabel={t("maxPrice")}
                            />
                        </div>
                    </FilterTitle>
                </div>

                {/* ── Guest Rating ── */}
                {!isSingleBranch && (
                    <FilterTitle title={t("guestRating")}>
                        <div className="flex md:flex-col gap-4 pb-4">
                            {STAR_OPTIONS.map((stars) => (
                                <StarRatings
                                    key={stars}
                                    stars={stars}
                                    checked={currentStars.has(stars)}
                                    onChange={(checked) => handleStarChange(stars, checked)}
                                />
                            ))}
                        </div>
                    </FilterTitle>
                )}

                {/* ── Dynamic Filters (each with independent Show More) ── */}
                {filtersList.map((filter) => {
                    const total = filter.items?.length ?? 0;
                    const visibleCount = getVisibleCount(filter.id);
                    const visibleItems = filter.items?.slice(0, visibleCount) ?? [];

                    return (
                        <FilterTitle key={filter.id} title={filter.title}>
                            {/* Desktop */}
                            <div className="hidden md:flex flex-col gap-4 pb-4">
                                {visibleItems.map((item) => (
                                    <Checkbox
                                        key={item.id}
                                        id={`${filter.prefix}-${item.id}`}
                                        label={item.name}
                                        checked={filter.currentSet.has(item.id)}
                                        onChange={(checked) => filter.onChange(item.id, checked)}
                                    />
                                ))}
                            </div>

                            {/* Mobile */}
                            <div className="flex gap-4 pb-4 md:hidden flex-wrap">
                                {visibleItems.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        className={`flex md:hidden items-center justify-center gap-2 px-5 py-2 rounded-lg border transition-all ${filter.currentSet.has(item.id)
                                            ? 'primaryLightBg primaryBorder'
                                            : 'border-transparent bodyBg'
                                            }`}
                                        onClick={() => filter.onChange(item.id, !filter.currentSet.has(item.id))}
                                    >
                                        <span className="text-sm font-medium textPrimaryColor">{item.name}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Show More / Show Less — only renders if total > 5 */}
                            {total > ITEMS_PER_STEP && (
                                <ShowMoreButton filterId={filter.id} totalCount={total} />
                            )}
                        </FilterTitle>
                    );
                })}
            </div>
        </div >
    );
};

export default SidebarFilter;