import { LocationInterface } from "@shared/interfaces/location.interface";

export class LocationGenerator {
  static location(id = 1, name = "My location", lat_deg = 10, lon_deg = 5): LocationInterface {
    return {
      id,
      name,
      lat_deg,
      lat_side: "N",
      lon_deg,
      lon_side: "E"
    };
  }
}
