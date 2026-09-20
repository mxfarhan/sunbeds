'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { LayoutSunbed, SunbedStatus } from '@/hooks/queries/useSunbedLayout';

interface SunbedIconProps {
  sunbed: LayoutSunbed;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

const statusStyles: Record<SunbedStatus, string> = {
  available: '',
  booked: 'brightness-75 saturate-50 hue-rotate-[-30deg] opacity-90',
  locked: 'brightness-110 saturate-150 hue-rotate-[15deg]',
  blocked: 'grayscale opacity-50',
  inactive: 'grayscale opacity-40',
};

const SunbedIcon = ({ sunbed, selected, onClick, disabled, size = 'md' }: SunbedIconProps) => {
  const isClickable = sunbed.status === 'available' && !disabled;
  const dim = size === 'sm' ? 'w-12 h-14' : 'w-14 h-16';

  return (
    <button
      type="button"
      disabled={!isClickable}
      onClick={isClickable ? onClick : undefined}
      title={`${sunbed.code} — €${sunbed.price}`}
      className={cn(
        'relative flex flex-col items-center justify-end transition-transform',
        isClickable && 'cursor-pointer hover:scale-105',
        !isClickable && 'cursor-not-allowed',
        selected && 'scale-110 z-10'
      )}
    >
      <div
        className={cn(
          'relative rounded-lg overflow-hidden',
          dim,
          statusStyles[sunbed.status],
          selected && 'ring-2 ring-[var(--primary-color)] ring-offset-2',
          sunbed.status === 'booked' && 'after:absolute after:inset-0 after:bg-red-500/40 after:rounded-lg',
          sunbed.status === 'locked' && 'after:absolute after:inset-0 after:bg-amber-400/35 after:rounded-lg'
        )}
      >
        <Image
          src="/images/map/sunbed.png"
          alt={sunbed.code}
          fill
          className="object-contain"
          sizes="56px"
        />
      </div>
      <span className="text-[10px] font-bold textPrimaryColor mt-0.5 leading-none">{sunbed.position}</span>
    </button>
  );
};

export default SunbedIcon;
