export interface LocationInterface {
  id: number;
  name: string;
  city?: string;
  state?: string;
  country?: string;
  lat_deg: number;
  lat_min?: number;
  lat_sec?: number;
  lat_side: "N" | "S";
  lon_deg: number;
  lon_min?: number;
  lon_sec?: number;
  lon_side: "E" | "W";
  altitude?: number;
}
