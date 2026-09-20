import { Circle, Group, Image as KonvaImage, Line, Path, Rect, Text } from 'react-konva';
import { useEffect, useState } from 'react';

export type MapObjectStatus =
  | 'available'
  | 'selected'
  | 'booked'
  | 'locked'
  | 'blocked'
  | 'inactive'
  | 'default'
  | 'active';

interface BaseShapeProps {
  width: number;
  height: number;
}

function useHtmlImage(src: string): HTMLImageElement | null {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => setImage(img);
    img.onerror = () => setImage(null);
    img.src = src;
  }, [src]);
  return image;
}

const STATUS_TINT: Record<string, string> = {
  available: '',
  active: '',
  default: '',
  selected: '#2563eb',
  booked: '#78716c',
  locked: '#d97706',
  blocked: '#a8a29e',
  inactive: '#a8a29e',
};

interface SunbedShapeProps extends BaseShapeProps {
  label?: string;
  status?: MapObjectStatus;
  selected?: boolean;
  iconUrl?: string;
}

export function SunbedShape({
  width,
  height,
  label,
  status = 'available',
  selected,
  iconUrl = '/images/map/sunbed.png',
}: SunbedShapeProps) {
  const image = useHtmlImage(iconUrl);
  const key = selected ? 'selected' : status;
  const tint = STATUS_TINT[key] ?? '';
  const unavailable = key === 'booked' || key === 'blocked' || key === 'inactive';

  return (
    <Group>
      <Rect x={3} y={4} width={width} height={height} cornerRadius={6} fill="rgba(0,0,0,0.18)" listening={false} />

      {image ? (
        <KonvaImage
          image={image}
          width={width}
          height={height}
          opacity={unavailable ? 0.55 : 1}
          listening={false}
        />
      ) : (
        <FallbackSunbed width={width} height={height} selected={!!selected} unavailable={unavailable} />
      )}

      {selected && (
        <Rect
          x={-3}
          y={-3}
          width={width + 6}
          height={height + 6}
          cornerRadius={8}
          stroke="#2563eb"
          strokeWidth={3}
          shadowColor="#2563eb"
          shadowBlur={8}
          shadowOpacity={0.45}
          listening={false}
        />
      )}

      {unavailable && (
        <Group listening={false}>
          <Line points={[6, 6, width - 6, height - 6]} stroke="#7f1d1d" strokeWidth={2.5} opacity={0.85} />
          <Line points={[width - 6, 6, 6, height - 6]} stroke="#7f1d1d" strokeWidth={2.5} opacity={0.85} />
        </Group>
      )}

      {tint && !selected && key === 'locked' && (
        <Rect width={width} height={height} fill="rgba(251,191,36,0.25)" cornerRadius={4} listening={false} />
      )}

      {label && (
        <Text
          text={label}
          width={width}
          y={height * 0.62}
          fontSize={Math.max(9, Math.min(12, width * 0.2))}
          fontStyle="bold"
          fill="#1c1917"
          align="center"
          shadowColor="#fff"
          shadowBlur={2}
          listening={false}
        />
      )}
    </Group>
  );
}

function FallbackSunbed({
  width,
  height,
  selected,
  unavailable,
}: {
  width: number;
  height: number;
  selected: boolean;
  unavailable: boolean;
}) {
  const body = unavailable ? '#a8a29e' : selected ? '#bfdbfe' : '#ddd6fe';
  const stripe = unavailable ? '#78716c' : selected ? '#93c5fd' : '#fde68a';
  return (
    <Group listening={false}>
      <Rect width={width} height={height} cornerRadius={6} fill={body} stroke="#1c1917" strokeWidth={2} />
      {[0.2, 0.35, 0.5, 0.65, 0.8].map((r, i) => (
        <Line
          key={r}
          points={[4, height * r, width - 4, height * r]}
          stroke={i % 2 === 0 ? stripe : body}
          strokeWidth={3}
        />
      ))}
    </Group>
  );
}

export function PlantShape({ width, height, iconUrl = '/images/map/plant.png' }: BaseShapeProps & { iconUrl?: string }) {
  const image = useHtmlImage(iconUrl);
  const size = Math.min(width, height);

  return (
    <Group>
      <Circle x={size / 2 + 2} y={size * 0.85} radius={size * 0.22} fill="rgba(0,0,0,0.15)" listening={false} />
      {image ? (
        <KonvaImage image={image} width={size} height={size} listening={false} />
      ) : (
        <Group scaleX={size / 64} scaleY={size / 64} listening={false}>
          <Rect x={29} y={42} width={6} height={16} fill="#92400e" stroke="#1c1917" strokeWidth={2} />
          <Path
            data="M32 8 C38 8 42 18 32 28 C22 18 26 8 32 8 Z"
            fill="#84cc16"
            stroke="#1c1917"
            strokeWidth={2.5}
            lineJoin="round"
          />
          <Path
            data="M32 18 C42 18 48 30 32 42 C16 30 22 18 32 18 Z"
            fill="#65a30d"
            stroke="#1c1917"
            strokeWidth={2.5}
            lineJoin="round"
          />
        </Group>
      )}
    </Group>
  );
}

export function PoolShape({ width, height, label }: BaseShapeProps & { label?: string }) {
  const border = Math.max(8, Math.min(14, width * 0.035));
  const innerW = width - border * 2;
  const innerH = height - border * 2;
  const grid = 16;

  const hLines: number[] = [];
  const vLines: number[] = [];
  for (let y = border + grid; y < height - border; y += grid) hLines.push(y);
  for (let x = border + grid; x < width - border; x += grid) vLines.push(x);

  return (
    <Group>
      <Rect width={width} height={height} cornerRadius={12} fill="#e7e5e4" stroke="#a8a29e" strokeWidth={2} listening={false} />
      <Rect
        x={border}
        y={border}
        width={innerW}
        height={innerH}
        cornerRadius={8}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: 0, y: innerH }}
        fillLinearGradientColorStops={[0, '#7dd3fc', 0.45, '#38bdf8', 1, '#0ea5e9']}
        listening={false}
      />
      {hLines.map((y) => (
        <Line key={`h-${y}`} points={[border, y, width - border, y]} stroke="rgba(255,255,255,0.28)" strokeWidth={1} listening={false} />
      ))}
      {vLines.map((x) => (
        <Line key={`v-${x}`} points={[x, border, x, height - border]} stroke="rgba(255,255,255,0.2)" strokeWidth={1} listening={false} />
      ))}
      <Line
        points={[border + 10, border + 12, border + innerW * 0.55, border + 12]}
        stroke="rgba(255,255,255,0.65)"
        strokeWidth={3}
        listening={false}
      />
      <Line
        points={[border + innerW * 0.4, border + innerH * 0.4, border + innerW * 0.9, border + innerH * 0.4]}
        stroke="rgba(255,255,255,0.35)"
        strokeWidth={2}
        listening={false}
      />
      {label && (
        <Text
          text={label}
          width={width}
          y={height * 0.42}
          fontSize={Math.max(12, width * 0.06)}
          fontStyle="bold"
          fill="#fff"
          align="center"
          shadowColor="#0369a1"
          shadowBlur={6}
          listening={false}
        />
      )}
    </Group>
  );
}

export function SeaShape({ width, height, label = 'SEA' }: BaseShapeProps & { label?: string }) {
  const bands = [
    { color: '#0369a1', h: 0.22 },
    { color: '#0284c7', h: 0.2 },
    { color: '#0ea5e9', h: 0.2 },
    { color: '#38bdf8', h: 0.2 },
    { color: '#7dd3fc', h: 0.18 },
  ];
  let y = 0;

  return (
    <Group>
      {bands.map((b, i) => {
        const h = height * b.h;
        const rect = <Rect key={i} y={y} width={width} height={h + 1} fill={b.color} listening={false} />;
        y += h;
        return rect;
      })}

      {/* foam / wave crest */}
      {Array.from({ length: Math.ceil(width / 14) }).map((_, i) => (
        <Circle
          key={`f-${i}`}
          x={i * 14 + 4}
          y={height * 0.08 + (i % 3) * 3}
          radius={4 + (i % 2)}
          fill="rgba(255,255,255,0.9)"
          listening={false}
        />
      ))}
      <Line
        points={Array.from({ length: Math.ceil(width / 20) + 1 }, (_, i) => [
          i * 20,
          height * 0.14 + Math.sin(i) * 4,
        ]).flat()}
        stroke="rgba(255,255,255,0.7)"
        strokeWidth={3}
        tension={0.4}
        listening={false}
      />

      {[0.4, 0.6, 0.78].map((ratio) => (
        <Line
          key={ratio}
          points={[0, height * ratio, width, height * ratio]}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={1.5}
          listening={false}
        />
      ))}

      <Text
        text={label}
        width={width}
        y={height * 0.42}
        fontSize={Math.max(18, Math.min(36, width * 0.06))}
        fontStyle="bold"
        fill="#fff"
        align="center"
        letterSpacing={6}
        shadowColor="#0c4a6e"
        shadowBlur={8}
        listening={false}
      />
    </Group>
  );
}

/** Black railing container with plank/rail lines inside */
export function WalkwayShape({ width, height }: BaseShapeProps) {
  const border = Math.max(5, Math.min(10, Math.min(width, height) * 0.15));
  const horizontal = width >= height;
  const lines: number[] = [];

  if (horizontal) {
    for (let y = border + 6; y < height - border - 2; y += 7) lines.push(y);
  } else {
    for (let x = border + 6; x < width - border - 2; x += 7) lines.push(x);
  }

  return (
    <Group>
      <Rect width={width} height={height} fill="#0c0a09" cornerRadius={4} listening={false} />
      <Rect
        x={border}
        y={border}
        width={width - border * 2}
        height={height - border * 2}
        fill="#a8a29e"
        cornerRadius={2}
        listening={false}
      />
      {horizontal
        ? lines.map((y) => (
            <Line
              key={y}
              points={[border + 2, y, width - border - 2, y]}
              stroke="#1c1917"
              strokeWidth={1.8}
              listening={false}
            />
          ))
        : lines.map((x) => (
            <Line
              key={x}
              points={[x, border + 2, x, height - border - 2]}
              stroke="#1c1917"
              strokeWidth={1.8}
              listening={false}
            />
          ))}
      {[0.2, 0.5, 0.8].map((ratio) =>
        horizontal ? (
          <Rect key={ratio} x={width * ratio - 1.5} y={1} width={3} height={height - 2} fill="#000" listening={false} />
        ) : (
          <Rect key={ratio} x={1} y={height * ratio - 1.5} width={width - 2} height={3} fill="#000" listening={false} />
        ),
      )}
    </Group>
  );
}

export function SandZoneShape({ width, height, label }: BaseShapeProps & { label?: string }) {
  return (
    <Group>
      <Rect width={width} height={height} fill="#f5e6c8" cornerRadius={8} stroke="#d6c4a8" strokeWidth={1.5} listening={false} />
      {Array.from({ length: 50 }).map((_, i) => (
        <Circle
          key={i}
          x={(i * 47) % Math.max(1, width)}
          y={(i * 31) % Math.max(1, height)}
          radius={0.9}
          fill="rgba(168,140,90,0.28)"
          listening={false}
        />
      ))}
      {label && (
        <Text text={label} x={10} y={8} fontSize={13} fontStyle="bold" fill="#78716c" listening={false} />
      )}
    </Group>
  );
}

export function BarShape({ width, height, label }: BaseShapeProps & { label?: string }) {
  return (
    <Group>
      <Rect width={width} height={height} fill="#92400e" cornerRadius={4} stroke="#1c1917" strokeWidth={2} listening={false} />
      <Rect x={4} y={4} width={width - 8} height={height * 0.35} fill="#b45309" cornerRadius={2} listening={false} />
      {label && (
        <Text text={label} width={width} y={height * 0.45} fontSize={11} fontStyle="bold" fill="#fff" align="center" listening={false} />
      )}
    </Group>
  );
}

export function SeaTextShape({ width, height, text }: { width: number; height: number; text: string }) {
  const upper = (text || 'SEA').toUpperCase();
  if (upper.includes('SEA') || upper === 'OCEAN') {
    return <SeaShape width={width} height={height} label={upper.includes('SEA') ? 'SEA' : upper} />;
  }
  return (
    <Text
      width={width}
      height={height}
      text={text}
      fontSize={Math.max(14, width * 0.1)}
      fill="#0284c7"
      fontStyle="bold"
      align="center"
      verticalAlign="middle"
      listening={false}
    />
  );
}

export function isSunbedType(type: string): boolean {
  return ['sunbed', 'double_sunbed', 'daybed', 'cabana'].includes(type);
}

export function isDrawableType(type: string): boolean {
  return ['pool', 'walkway', 'text', 'zone', 'sea', 'bar'].includes(type);
}
