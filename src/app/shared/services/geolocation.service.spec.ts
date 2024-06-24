import { GeolocationService } from "./geolocation.service";
import { TestBed } from "@angular/core/testing";
import { PLATFORM_ID } from "@angular/core";

describe("GeolocationService", () => {
  let service: GeolocationService;
  let platformId: Object;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GeolocationService]
    });
    service = TestBed.inject(GeolocationService);
    platformId = TestBed.inject(PLATFORM_ID);
  });

  describe("getCurrentPosition", () => {
    it("should get the current position if in browser context", async () => {
      const mockPosition: GeolocationPosition = {
        coords: {
          latitude: 123,
          longitude: 456,
          altitude: null,
          accuracy: 1,
          altitudeAccuracy: null,
          heading: null,
          speed: null
        },
        timestamp: new Date().getTime()
      };

      // Mocking geolocation API
      Object.defineProperty(navigator, "geolocation", {
        value: {
          getCurrentPosition: jest.fn().mockImplementation(success => {
            success(mockPosition);
          })
        },
        writable: true
      });

      if (typeof window !== "undefined") {
        const position = await service.getCurrentPosition();
        expect(position).toEqual(mockPosition);
      }
    });

    it("should handle errors in geolocation API", async () => {
      const error = new Error("Geolocation error");

      // Mocking geolocation API error
      Object.defineProperty(navigator, "geolocation", {
        value: {
          getCurrentPosition: jest.fn().mockImplementation((success, errorCb) => {
            errorCb(error);
          })
        },
        writable: true
      });

      if (typeof window !== "undefined") {
        await expect(service.getCurrentPosition()).rejects.toThrow("Geolocation error");
      }
    });

    it("should reject if not in browser context", async () => {
      if (typeof window === "undefined") {
        await expect(service.getCurrentPosition()).rejects.toThrow("Geolocation is not available in server-side rendering.");
      }
    });
  });
});
