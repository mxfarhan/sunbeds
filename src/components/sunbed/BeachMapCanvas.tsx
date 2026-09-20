'use client';

import dynamic from 'next/dynamic';
import { Typography } from '@/components/storyBook/atoms/Typography';
import { LayoutArea, LayoutSunbed } from '@/hooks/queries/useSunbedLayout';
import { isCanvasLayout, SunbedLayoutData } from '@/layout-engine/types';
import SunbedIcon from './SunbedIcon';
import { cn } from '@/lib/utils';

const LayoutRenderer = dynamic(() => import('@/layout-engine/LayoutRenderer'), {
  ssr: false,
  loading: () => <div className="h-[360px] flexCenter textSecondaryColor">Loading map…</div>,
});

interface BeachMapCanvasProps {
  areas: LayoutArea[];
  selectedIds: number[];
  onToggleSunbed: (sunbed: LayoutSunbed) => void;
  layoutData?: SunbedLayoutData;
}

const footpathWidth: Record<string, string> = {
  sm: 'h-3',
  md: 'h-5',
  lg: 'h-8',
};

const BeachMapCanvas = ({ areas, selectedIds, onToggleSunbed, layoutData }: BeachMapCanvasProps) => {
  if (layoutData && isCanvasLayout(layoutData)) {
    return (
      <LayoutRenderer
        data={layoutData}
        selectedIds={selectedIds}
        onToggleSunbed={onToggleSunbed}
      />
    );
  }

  return (
    <div className="space-y-8">
      {areas.map((area) => {
        const meta = area.layout_meta;
        const seaTop = meta?.sea_edge === 'top';
        const seaBottom = meta?.sea_edge === 'bottom';
        const footpathBetween = meta?.footpath?.between_rows ?? false;
        const pathHeight = footpathWidth[meta?.footpath?.width ?? 'md'] ?? footpathWidth.md;

        return (
          <div key={area.id} className="rounded-2xl overflow-hidden border shadow-sm">
            {seaTop && (
              <div className="bg-gradient-to-b from-sky-500 via-sky-400 to-sky-300 px-4 py-3 text-center">
                <Typography variant="caption" className="text-white! font-medium tracking-wide uppercase">
                  Sea
                </Typography>
              </div>
            )}

            <div className="bg-[#f5e6c8] p-4 md:p-6">
              <Typography variant="h6" weight="semibold" className="textPrimaryColor! mb-4">
                {area.name}
              </Typography>

              <div className="space-y-0">
                {area.rows.map((row, rowIndex) => (
                  <div key={row.row_label}>
                    {footpathBetween && rowIndex > 0 && (
                      <div className={cn('w-full rounded-full bg-stone-300/80 my-2 mx-auto max-w-full', pathHeight)}>
                        {meta?.footpath?.label && (
                          <span className="sr-only">{meta.footpath.label}</span>
                        )}
                      </div>
                    )}
                    <div className="flex items-end gap-2 flex-wrap py-2">
                      <span className="text-xs font-bold text-stone-600 w-6 shrink-0 pb-2">{row.row_label}</span>
                      <div className="flex flex-wrap gap-2 justify-center flex-1">
                        {row.sunbeds.map((sunbed) => (
                          <SunbedIcon
                            key={sunbed.id}
                            sunbed={sunbed}
                            selected={selectedIds.includes(sunbed.id)}
                            onClick={() => onToggleSunbed(sunbed)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {seaBottom && (
              <div className="bg-gradient-to-t from-sky-500 via-sky-400 to-sky-300 px-4 py-3 text-center">
                <Typography variant="caption" className="text-white! font-medium tracking-wide uppercase">
                  Sea
                </Typography>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BeachMapCanvas;
