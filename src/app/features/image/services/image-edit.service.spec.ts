import { TestBed } from "@angular/core/testing";

import { ImageEditService } from "./image-edit.service";
import { MockBuilder } from "ng-mocks";
import { ImageModule } from "@features/image/image.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialState } from "@app/store/state";
import { SolarSystemSubjectType, SubjectType } from "@shared/interfaces/image.interface";

describe("ImageEditService", () => {
  let service: ImageEditService;

  beforeEach(async () => {
    await MockBuilder(ImageEditService, ImageModule).provide(provideMockStore({ initialState }));
    service = TestBed.inject(ImageEditService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("isLongExposure", () => {
    it("should return true for deep sky images", () => {
      service.model = {
        subjectType: SubjectType.DEEP_SKY
      };
      expect(service.isLongExposure()).toBe(true);
    });

    it("should return true for wide field images", () => {
      service.model = {
        subjectType: SubjectType.WIDE_FIELD
      };
      expect(service.isLongExposure()).toBe(true);
    });

    it("should return true for star trails images", () => {
      service.model = {
        subjectType: SubjectType.STAR_TRAILS
      };
      expect(service.isLongExposure()).toBe(true);
    });

    it("should return true for northern lights images", () => {
      service.model = {
        subjectType: SubjectType.NORTHERN_LIGHTS
      };
      expect(service.isLongExposure()).toBe(true);
    });

    it("should return true for noctilucent clouds images", () => {
      service.model = {
        subjectType: SubjectType.NOCTILUCENT_CLOUDS
      };
      expect(service.isLongExposure()).toBe(true);
    });

    it("should return true for landscape images", () => {
      service.model = {
        subjectType: SubjectType.LANDSCAPE
      };
      expect(service.isLongExposure()).toBe(true);
    });

    it("should return false for artificial satellite images", () => {
      service.model = {
        subjectType: SubjectType.ARTIFICIAL_SATELLITE
      };
      expect(service.isLongExposure()).toBe(false);
    });

    it("should return true for solar system images with comet as main subject", () => {
      service.model = {
        subjectType: SubjectType.SOLAR_SYSTEM,
        solarSystemMainSubject: SolarSystemSubjectType.COMET
      };
      expect(service.isLongExposure()).toBe(true);
    });

    it("should return false for solar system images with other main subject", () => {
      service.model = {
        subjectType: SubjectType.SOLAR_SYSTEM,
        solarSystemMainSubject: SolarSystemSubjectType.SUN
      };
      expect(service.isLongExposure()).toBe(false);
    });
  });
});
