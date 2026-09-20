'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/storyBook/atoms/Button';
import { Typography } from '@/components/storyBook/atoms/Typography';
import { useTranslation } from '@/hooks/useTranslation';
import { LayoutArea, LayoutSunbed, SunbedLayoutData } from '@/hooks/queries/useSunbedLayout';
import BeachMapCanvas from './BeachMapCanvas';
import { useIsMobile } from '@/hooks/useMobile';
import { formatPriceHelper } from '@/utils/helpers';

interface SunbedSelectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  areas: LayoutArea[];
  layoutData?: SunbedLayoutData;
  selectedSunbeds: LayoutSunbed[];
  onToggleSunbed: (sunbed: LayoutSunbed) => void;
  onConfirm: () => void;
  loading?: boolean;
  currencySymbol?: string;
}

const SunbedSelectModal = ({
  open,
  onOpenChange,
  areas,
  layoutData,
  selectedSunbeds,
  onToggleSunbed,
  onConfirm,
  loading,
  currencySymbol = '€',
}: SunbedSelectModalProps) => {
  const { t } = useTranslation();
  const isMobile = useIsMobile();
  const selectionTotal = selectedSunbeds.reduce((sum, sunbed) => sum + (sunbed.price || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          isMobile
            ? 'max-w-full! w-full! h-full! max-h-full! rounded-none flex flex-col p-4 bg-[#faf8f5]'
            : 'max-w-5xl! max-h-[92vh] flex flex-col bg-[#faf8f5]'
        }
      >
        <DialogHeader>
          <DialogTitle>{t('selectSunbeds') || 'Select your sunbeds'}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 min-h-0">
          {loading ? (
            <div className="h-40 flexCenter textSecondaryColor">{t('loading')}</div>
          ) : areas.length > 0 || (layoutData?.objects?.length ?? 0) > 0 ? (
            <BeachMapCanvas
              areas={areas}
              layoutData={layoutData}
              selectedIds={selectedSunbeds.map((s) => s.id)}
              onToggleSunbed={onToggleSunbed}
            />
          ) : (
            <Typography variant="desc2" className="textSecondaryColor!">
              {t('noSunbedsAvailable') || 'No sunbeds available'}
            </Typography>
          )}
        </div>

        <div className="border-t pt-4 space-y-3 shrink-0">
          {selectedSunbeds.length > 0 && (
            <div className="space-y-1">
              <Typography variant="desc2" className="textPrimaryColor!">
                {selectedSunbeds.length} {t('sunbedsSelected')}: {selectedSunbeds.map((s) => s.code).join(', ')}
              </Typography>
              <div className="flex items-center justify-between gap-4">
                <Typography variant="desc2" className="textSecondaryColor!">
                  {t('selectionTotal') || 'Selection total'}
                </Typography>
                <Typography variant="h6" weight="semibold" className="textPrimaryColor!">
                  {currencySymbol}{formatPriceHelper(selectionTotal)}
                </Typography>
              </div>
              <Typography variant="caption" className="textSecondaryColor!">
                {selectedSunbeds.map((s) => `${s.code}: ${currencySymbol}${formatPriceHelper(s.price)}`).join(' · ')}
              </Typography>
            </div>
          )}
          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('cancel') || 'Cancel'}
            </Button>
            <Button
              variant="primary"
              onClick={onConfirm}
              disabled={selectedSunbeds.length === 0}
            >
              {t('confirmSelection') || 'Confirm selection'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SunbedSelectModal;
