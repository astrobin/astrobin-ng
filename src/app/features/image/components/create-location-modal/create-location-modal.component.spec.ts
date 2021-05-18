import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CreateLocationModalComponent } from "./create-location-modal.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { GoogleMapsService } from "@shared/services/google-maps/google-maps.service";

describe("CreateLocationModalComponent", () => {
  let component: CreateLocationModalComponent;
  let fixture: ComponentFixture<CreateLocationModalComponent>;

  const geocoderResult = {
    address_components: [
      {
        long_name: "Winnetka",
        short_name: "Winnetka",
        types: ["locality", "political"]
      },
      {
        long_name: "Illinois",
        short_name: "IL",
        types: ["administrative_area_level_1", "political"]
      },
      {
        long_name: "United States",
        short_name: "US",
        types: ["country", "political"]
      }
    ]
  } as google.maps.GeocoderResult;

  beforeEach(async () => {
    await MockBuilder(CreateLocationModalComponent, AppModule).provide([
      NgbActiveModal,
      provideMockStore({ initialState }),
      {
        provide: GoogleMapsService,
        useValue: {
          createGeocoder: () => {
            return {
              geocode: jest
                .fn()
                .mockImplementation(
                  (
                    request: google.maps.GeocoderRequest,
                    callback: (results: google.maps.GeocoderResult[], status: google.maps.GeocoderStatus) => void
                  ) => callback([geocoderResult, geocoderResult], google.maps.GeocoderStatus.OK)
                )
            };
          }
        }
      }
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateLocationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("getGeolocationComponent", () => {
    it("should be null if geolocation is null", () => {
      expect(component.getGeolocationComponent(null, "foo")).toBeNull();
    });

    it("should be null if address components is null", () => {
      expect(
        component.getGeolocationComponent({ address_components: null } as google.maps.GeocoderResult, "foo")
      ).toBeNull();
    });

    it("should be null if address components is empty", () => {
      expect(
        component.getGeolocationComponent({ address_components: [] } as google.maps.GeocoderResult, "foo")
      ).toBeNull();
    });

    describe("with result", () => {
      it("should find the locality", () => {
        expect(component.getGeolocationComponent(geocoderResult, "locality")).toEqual("Winnetka");
      });

      it("should find the administrative_area_level_1", () => {
        expect(component.getGeolocationComponent(geocoderResult, "administrative_area_level_1")).toEqual("IL");
      });

      it("should find the country", () => {
        expect(component.getGeolocationComponent(geocoderResult, "country")).toEqual("US");
      });
    });
  });

  describe("getGeolocation", () => {
    it("should work", () => {
      component.getGeolocation(10, 10).subscribe(result => {
        expect(result.city).toEqual("Winnetka");
        expect(result.state).toEqual("IL");
        expect(result.country).toEqual("US");
      });
    });
  });

  describe("convertToDms", () => {
    it("should work for New York", () => {
      expect(component.convertToDms(40.785091, "latitude")).toEqual({
        degrees: 40,
        minutes: 47,
        seconds: 6.33,
        direction: "N"
      });

      expect(component.convertToDms(-73.968285, "longitude")).toEqual({
        degrees: 73,
        minutes: 58,
        seconds: 5.83,
        direction: "W"
      });
    });

    it("should work for Buenos Aires", () => {
      expect(component.convertToDms(-34.603722, "latitude")).toEqual({
        degrees: 34,
        minutes: 36,
        seconds: 13.4,
        direction: "S"
      });

      expect(component.convertToDms(-58.381592, "longitude")).toEqual({
        degrees: 58,
        minutes: 22,
        seconds: 53.73,
        direction: "W"
      });
    });

    it("should work for Rome", () => {
      expect(component.convertToDms(41.902782, "latitude")).toEqual({
        degrees: 41,
        minutes: 54,
        seconds: 10.02,
        direction: "N"
      });

      expect(component.convertToDms(12.496366, "longitude")).toEqual({
        degrees: 12,
        minutes: 29,
        seconds: 46.92,
        direction: "E"
      });
    });

    it("should work for Sidney", () => {
      expect(component.convertToDms(-33.865143, "latitude")).toEqual({
        degrees: 33,
        minutes: 51,
        seconds: 54.51,
        direction: "S"
      });

      expect(component.convertToDms(151.2099, "longitude")).toEqual({
        degrees: 151,
        minutes: 12,
        seconds: 35.64,
        direction: "E"
      });
    });
  });

  describe("buildLocationObject", () => {
    it("should work with zeroes", () => {
      expect(component.buildLocationObject("Home", 0, 0, 400, "Zurich", "ZH", "CH")).toEqual({
        name: "Home",
        lat_deg: 0,
        lat_min: 0,
        lat_sec: 0,
        lat_side: "N",
        lon_deg: 0,
        lon_min: 0,
        lon_sec: 0,
        lon_side: "E",
        altitude: 400,
        city: "Zurich",
        state: "ZH",
        country: "CH"
      });
    });

    it("should work for New York (N/W)", () => {
      expect(
        component.buildLocationObject("NY Observatory", 40.785091, -73.968285, 10, "New York", "NY", "US")
      ).toEqual({
        name: "NY Observatory",
        lat_deg: 40,
        lat_min: 47,
        lat_sec: 6,
        lat_side: "N",
        lon_deg: 73,
        lon_min: 58,
        lon_sec: 6,
        lon_side: "W",
        altitude: 10,
        city: "New York",
        state: "NY",
        country: "US"
      });
    });

    it("should work with N/E", () => {
      expect(component.buildLocationObject("Home", 0.1, 0.1, 400, "Zurich", "ZH", "CH")).toEqual({
        name: "Home",
        lat_deg: 0,
        lat_min: 6,
        lat_sec: 0,
        lat_side: "N",
        lon_deg: 0,
        lon_min: 6,
        lon_sec: 0,
        lon_side: "E",
        altitude: 400,
        city: "Zurich",
        state: "ZH",
        country: "CH"
      });
    });

    it("should work S/W", () => {
      expect(component.buildLocationObject("Home", -0.1, -0.1, 400, "Zurich", "ZH", "CH")).toEqual({
        name: "Home",
        lat_deg: 0,
        lat_min: 6,
        lat_sec: 0,
        lat_side: "S",
        lon_deg: 0,
        lon_min: 6,
        lon_sec: 0,
        lon_side: "W",
        altitude: 400,
        city: "Zurich",
        state: "ZH",
        country: "CH"
      });
    });
  });
});
