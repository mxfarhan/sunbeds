'use client';

import { ResortSlot } from '@/hooks/queries/useResortDetails';
import { cn } from '@/lib/utils';

interface SlotSelectorProps {
  slots: ResortSlot[];
  selectedSlotId: number | null;
  onSelectSlot: (slotId: number) => void;
}

const SlotSelector = ({ slots, selectedSlotId, onSelectSlot }: SlotSelectorProps) => {
  if (!slots.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {slots.map((slot) => (
        <button
          key={slot.id}
          type="button"
          onClick={() => onSelectSlot(slot.id)}
          className={cn(
            'px-4 py-2 rounded-xl text-sm font-medium border transition-colors',
            selectedSlotId === slot.id
              ? 'primaryBg text-white border-transparent'
              : 'bg-white textPrimaryColor borderColor hover:primaryLightBg'
          )}
        >
          {slot.label || slot.key.replace('_', ' ')}
        </button>
      ))}
    </div>
  );
};

export default SlotSelector;
