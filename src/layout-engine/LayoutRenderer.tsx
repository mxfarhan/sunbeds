'use client';

import { Group, Layer, Rect, Stage } from 'react-konva';
import { useCallback, useEffect, useRef, useState } from 'react';
import type Konva from 'konva';
import type { LayoutObject, LayoutZone, SunbedLayoutData } from './types';
import { layoutObjectToSunbed } from './types';
import type { LayoutSunbed } from '@/hooks/queries/useSunbedLayout';
import { MapObjectRenderer } from './shapes/MapObjectRenderer';
import { SandZoneShape } from './shapes/MapObjectShapes';

interface LayoutRendererProps {
  data: SunbedLayoutData;
  selectedIds: number[];
  onToggleSunbed: (sunbed: LayoutSunbed) => void;
}

export default function LayoutRenderer({ data, selectedIds, onToggleSunbed }: LayoutRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 700, height: 500 });
  const [zoom, setZoom] = useState(0.45);
  const [pan, setPan] = useState({ x: 20, y: 20 });

  const layout = data.layout!;
  const objects = data.objects ?? [];
  const zones = data.zones ?? [];

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height: Math.max(400, height) });
      const scale = Math.min((width - 40) / layout.width, (height - 40) / layout.height, 0.65);
      setZoom(scale);
      setPan(20, 20);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [layout.width, layout.height]);

  const handleWheel = useCallback(
    (e: Konva.KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();
      const stage = e.target.getStage();
      if (!stage) return;
      const scaleBy = 1.08;
      const oldScale = zoom;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;
      const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
      const clamped = Math.max(0.15, Math.min(2, newScale));
      const mousePointTo = {
        x: (pointer.x - pan.x) / oldScale,
        y: (pointer.y - pan.y) / oldScale,
      };
      setZoom(clamped);
      setPan({
        x: pointer.x - mousePointTo.x * clamped,
        y: pointer.y - mousePointTo.y * clamped,
      });
    },
    [zoom, pan.x, pan.y],
  );

  const handleObjectTap = (obj: LayoutObject) => {
    const sunbed = layoutObjectToSunbed(obj);
    if (!sunbed) return;
    if (sunbed.status !== 'available') return;
    onToggleSunbed(sunbed);
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-[min(65vh,560px)] min-h-[380px] rounded-xl overflow-hidden bg-[#cbd5e1] shadow-inner"
      style={{ touchAction: 'none' }}
    >
      <Stage width={size.width} height={size.height} onWheel={handleWheel}>
        <Layer x={pan.x} y={pan.y} scaleX={zoom} scaleY={zoom}>
          <Rect width={layout.width} height={layout.height} fill="#f5e6c8" listening={false} />

          {layout.background_url && (
            <BackgroundImage url={layout.background_url} width={layout.width} height={layout.height} />
          )}

          {zones.map((zone) => (
            <ZoneShape key={zone.id} zone={zone} />
          ))}

          {[...objects]
            .sort((a, b) => a.z_index - b.z_index)
            .map((obj) => {
              const selected = obj.sunbed_id ? selectedIds.includes(obj.sunbed_id) : false;
              const canTap = Boolean(obj.bookable && obj.sunbed_id && obj.status === 'available');

              return (
                <Group
                  key={obj.id}
                  x={obj.x}
                  y={obj.y}
                  rotation={obj.rotation}
                  onClick={canTap ? () => handleObjectTap(obj) : undefined}
                  onTap={canTap ? () => handleObjectTap(obj) : undefined}
                  onMouseEnter={(e) => {
                    const stage = e.target.getStage();
                    if (stage) stage.container().style.cursor = canTap ? 'pointer' : 'default';
                  }}
                  onMouseLeave={(e) => {
                    const stage = e.target.getStage();
                    if (stage) stage.container().style.cursor = 'default';
                  }}
                >
                  {/* Hit target — visual shapes use listening=false */}
                  <Rect
                    width={obj.width}
                    height={obj.height}
                    fill={canTap || selected ? 'rgba(0,0,0,0.001)' : 'rgba(0,0,0,0)'}
                    listening={canTap || selected}
                  />
                  <MapObjectRenderer obj={obj} selected={selected} />
                </Group>
              );
            })}
        </Layer>
      </Stage>
    </div>
  );
}

function BackgroundImage({ url, width, height }: { url: string; width: number; height: number }) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setImage(img);
    img.src = url;
  }, [url]);
  if (!image) return null;
  return (
    <Rect
      width={width}
      height={height}
      fillPatternImage={image}
      fillPatternScaleX={width / image.width}
      fillPatternScaleY={height / image.height}
      listening={false}
    />
  );
}

function ZoneShape({ zone }: { zone: LayoutZone }) {
  return (
    <Group x={zone.x} y={zone.y} listening={false}>
      <SandZoneShape width={zone.width} height={zone.height} label={zone.label ?? zone.name} />
    </Group>
  );
}
