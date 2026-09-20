import type { LayoutObject } from '../types';
import {
  BarShape,
  isSunbedType,
  PlantShape,
  PoolShape,
  SandZoneShape,
  SeaTextShape,
  SunbedShape,
  WalkwayShape,
  type MapObjectStatus,
} from './MapObjectShapes';

interface MapObjectRendererProps {
  obj: LayoutObject;
  selected?: boolean;
}

export function MapObjectRenderer({ obj, selected }: MapObjectRendererProps) {
  const { width, height, type, label, code, properties } = obj;
  const displayLabel = label ?? code ?? '';
  const status = (selected ? 'selected' : obj.status ?? 'available') as MapObjectStatus;

  if (isSunbedType(type)) {
    return <SunbedShape width={width} height={height} label={displayLabel} status={status} selected={selected} />;
  }

  switch (type) {
    case 'plant':
      return <PlantShape width={width} height={height} />;
    case 'pool':
      return <PoolShape width={width} height={height} label={displayLabel || 'Main Pool'} />;
    case 'walkway':
      return <WalkwayShape width={width} height={height} />;
    case 'bar':
      return <BarShape width={width} height={height} label={displayLabel} />;
    case 'zone':
      return <SandZoneShape width={width} height={height} label={displayLabel} />;
    case 'text':
      return (
        <SeaTextShape
          width={width}
          height={height}
          text={(properties?.text as string) ?? displayLabel ?? 'SEA'}
        />
      );
    default:
      return <SandZoneShape width={width} height={height} label={displayLabel} />;
  }
}
