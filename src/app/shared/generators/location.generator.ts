import { LocationInterface } from "@shared/interfaces/location.interface";

export class LocationGenerator {
  static location(): LocationInterface {
    return {
      id: 1,
      name: "My location",
      lat_deg: 10,
      lat_side: "N",
      lon_deg: 5,
      lon_side: "E"
    };
  }
}
