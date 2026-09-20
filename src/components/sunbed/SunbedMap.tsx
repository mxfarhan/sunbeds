'use client';

import { LayoutSunbed, LayoutArea } from '@/hooks/queries/useSunbedLayout';
import { Typography } from '@/components/storyBook/atoms/Typography';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  available: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
  booked: 'bg-red-500 text-white cursor-not-allowed',
  locked: 'bg-yellow-400 text-gray-900 cursor-not-allowed',
  blocked: 'bg-gray-400 text-white cursor-not-allowed',
  inactive: 'bg-gray-300 text-gray-500 cursor-not-allowed',
};

interface SunbedMapProps {
  areas: LayoutArea[];
  selectedIds: number[];
  onToggleSunbed: (sunbed: LayoutSunbed) => void;
}

const SunbedMap = ({ areas, selectedIds, onToggleSunbed }: SunbedMapProps) => {
  const { t } = useTranslation();

  const handleClick = (sunbed: LayoutSunbed) => {
    if (sunbed.status !== 'available') return;
    onToggleSunbed(sunbed);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 text-sm">
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-gray-200 border" />
          {t('available') || 'Available'}
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-red-500" />
          {t('booked') || 'Booked'}
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-yellow-400" />
          {t('locked') || 'Locked'}
        </span>
      </div>

      {areas.map((area) => (
        <div key={area.id} className="space-y-3">
          <Typography variant="h6" weight="semibold" className="textPrimaryColor!">
            {area.name}
          </Typography>
          <div className="space-y-2">
            {area.rows.map((row) => (
              <div key={row.row_label} className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium textSecondaryColor w-8 shrink-0">{row.row_label}</span>
                <div className="flex flex-wrap gap-1.5">
                  {row.sunbeds.map((sunbed) => {
                    const isSelected = selectedIds.includes(sunbed.id);
                    return (
                      <button
                        key={sunbed.id}
                        type="button"
                        title={`${sunbed.code} — ${sunbed.price}`}
                        disabled={sunbed.status !== 'available'}
                        onClick={() => handleClick(sunbed)}
                        className={cn(
                          'w-10 h-10 rounded-lg text-xs font-bold transition-all border-2',
                          statusColors[sunbed.status] ?? statusColors.available,
                          isSelected && 'border-primary ring-2 ring-primary/30 scale-105'
                        )}
                      >
                        {sunbed.position}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SunbedMap;
