export type SunbedStatus = 'available' | 'booked' | 'locked' | 'blocked' | 'inactive';

export interface CanvasLayoutMeta {
  width: number;
  height: number;
  background_url: string | null;
  background_settings?: Record<string, unknown> | null;
  version: number;
}

export interface LayoutZone {
  id: number;
  resort_area_id: number | null;
  name: string;
  label: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  style: Record<string, unknown> | null;
  sort_order: number;
}

export interface LayoutObject {
  id: number;
  zone_id: number | null;
  type: string;
  bookable: boolean;
  sunbed_id: number | null;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scale: number;
  z_index: number;
  label: string | null;
  properties: Record<string, unknown> | null;
  status?: SunbedStatus;
  price?: number;
  code?: string;
}

export interface LayoutSunbed {
  id: number;
  code: string;
  position: number;
  type: string | null;
  price: number;
  status: SunbedStatus;
}

export interface LayoutRow {
  row_label: string;
  sunbeds: LayoutSunbed[];
}

export interface AreaLayoutMeta {
  orientation?: string;
  sea_edge?: 'top' | 'bottom' | null;
  footpath?: { between_rows?: boolean; width?: string; label?: string };
  row_direction?: string;
}

export interface LayoutArea {
  id: number;
  name: string;
  image: string | null;
  layout_meta?: AreaLayoutMeta | null;
  rows: LayoutRow[];
}

export interface SunbedLayoutData {
  property: { id: number; name: string; slug: string };
  date: string;
  slot: { id: number; key: string; label: string };
  areas: LayoutArea[];
  layout?: CanvasLayoutMeta;
  zones?: LayoutZone[];
  objects?: LayoutObject[];
  legacy_rows?: boolean | null;
}

export function isCanvasLayout(data: SunbedLayoutData): boolean {
  return !!data.objects && data.objects.length > 0 && data.legacy_rows !== true;
}

export function layoutObjectToSunbed(obj: LayoutObject): LayoutSunbed | null {
  if (!obj.sunbed_id || !obj.bookable) return null;
  return {
    id: Number(obj.sunbed_id),
    code: obj.code ?? obj.label ?? String(obj.sunbed_id),
    position: obj.id,
    type: obj.type,
    price: obj.price ?? 0,
    status: obj.status ?? 'inactive',
  };
}
