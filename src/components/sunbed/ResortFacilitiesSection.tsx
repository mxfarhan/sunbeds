'use client';

import { Typography } from '@/components/storyBook/atoms/Typography';
import { useTranslation } from '@/hooks/useTranslation';
import { getFacilityIcon } from './facilityIcons';
import { cn } from '@/lib/utils';

export interface ResortFacilityItem {
  id: number;
  name: string;
  icon?: string | null;
  category?: string | null;
}

interface ResortFacilitiesSectionProps {
  facilities: ResortFacilityItem[];
  className?: string;
}

const ResortFacilitiesSection = ({ facilities, className }: ResortFacilitiesSectionProps) => {
  const { t } = useTranslation();

  if (!facilities?.length) return null;

  const grouped = facilities.reduce<Record<string, ResortFacilityItem[]>>((acc, item) => {
    const key = item.category?.trim() || (t('amenities') || 'Amenities');
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const groups = Object.entries(grouped);

  return (
    <section className={cn('rounded-2xl border border-stone-200/80 bg-white p-5 sm:p-6 space-y-6', className)}>
      <div className="space-y-1">
        <Typography variant="h5" weight="semibold" className="textPrimaryColor!">
          {t('facilitiesAndAmenities') || t('amenities') || 'Facilities & amenities'}
        </Typography>
        <Typography variant="desc2" className="textSecondaryColor!">
          {t('whatsIncludedAtResort') || 'What’s included at this beach spot'}
        </Typography>
      </div>

      <div className="space-y-6">
        {groups.map(([category, items]) => (
          <div key={category} className="space-y-3">
            {groups.length > 1 && (
              <Typography variant="caption" weight="semibold" className="textSecondaryColor! uppercase tracking-wide">
                {category}
              </Typography>
            )}
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map((item) => {
                const Icon = getFacilityIcon(item.name);
                return (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl bg-[#F7FAFC] border border-sky-100/80 px-3.5 py-3"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white border border-sky-100 text-sky-700 shadow-sm">
                      {item.icon ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.icon} alt="" className="h-5 w-5 object-contain" />
                      ) : (
                        <Icon className="text-[22px]" aria-hidden />
                      )}
                    </span>
                    <span className="text-sm font-medium text-slate-800 leading-snug">{item.name}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ResortFacilitiesSection;
