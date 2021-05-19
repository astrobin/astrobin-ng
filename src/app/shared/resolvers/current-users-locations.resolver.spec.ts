import { TestBed } from "@angular/core/testing";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { CurrentUsersLocationsResolver } from "@shared/resolvers/current-users-locations.resolver";
import { LocationGenerator } from "@shared/generators/location.generator";
import { LocationInterface } from "@shared/interfaces/location.interface";

describe("CurrentUsersLocationsResolver", () => {
  let service: CurrentUsersLocationsResolver;

  beforeEach(async () => {
    await MockBuilder(CurrentUsersLocationsResolver, AppModule);
    service = TestBed.inject(CurrentUsersLocationsResolver);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("uniqueValidLocations", () => {
    it("should be empty array if given an empty array", () => {
      expect(service.uniqueValidLocations([])).toEqual([]);
    });

    it("should be empty array if given null", () => {
      expect(service.uniqueValidLocations(null)).toEqual([]);
    });

    it("should be empty array if given undefined", () => {
      expect(service.uniqueValidLocations(undefined)).toEqual([]);
    });

    it("should remove duplicates (same object)", () => {
      const location = LocationGenerator.location();
      expect(service.uniqueValidLocations([location, location])).toEqual([location]);
    });

    it("should remove duplicates (different object, same data)", () => {
      const location1: LocationInterface = {
        id: 2797748,
        name: "Remote observatory at Astrocamp",
        city: "Nerpio",
        state: "",
        country: "ES",
        lat_deg: 38,
        lat_min: 9,
        lat_sec: null,
        lat_side: "N",
        lon_deg: 2,
        lon_min: 18,
        lon_sec: null,
        lon_side: "E",
        altitude: null,
        user: 4
      };

      const location2: LocationInterface = {
        id: 2797748,
        name: "Remote observatory at Astrocamp",
        city: "Nerpio",
        state: "",
        country: "ES",
        lat_deg: 38,
        lat_min: 9,
        lat_sec: null,
        lat_side: "N",
        lon_deg: 2,
        lon_min: 18,
        lon_sec: null,
        lon_side: "E",
        altitude: null,
        user: 4
      };

      expect(service.uniqueValidLocations([location1, location2])).toEqual([location1]);
    });

    it("should remove items with no name", () => {
      const locations = [LocationGenerator.location(), LocationGenerator.location(2, "")];

      expect(service.uniqueValidLocations(locations)).toEqual([locations[0]]);
    });

    it("should remove items with no lat_deg", () => {
      const locations = [LocationGenerator.location(), LocationGenerator.location(2, "Foo", null)];

      expect(service.uniqueValidLocations(locations)).toEqual([locations[0]]);
    });

    it("should remove items with no lont_deg", () => {
      const locations = [LocationGenerator.location(), LocationGenerator.location(2, "Foo", 10, null)];

      expect(service.uniqueValidLocations(locations)).toEqual([locations[0]]);
    });
  });
});
