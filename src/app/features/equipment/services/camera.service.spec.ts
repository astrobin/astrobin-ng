import { TestBed } from "@angular/core/testing";

import { CameraDisplayProperty, CameraService } from "./camera.service";
import { MockBuilder } from "ng-mocks";
import { CameraGenerator } from "@features/equipment/generators/camera.generator";
import { AppModule } from "@app/app.module";

describe("CameraService", () => {
  let service: CameraService;

  beforeEach(async () => {
    await MockBuilder(CameraService, AppModule);
    service = TestBed.inject(CameraService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("getPrintableProperty", () => {
    it("should work for 'cooled'", () => {
      const yesNoMock = jest.spyOn(service.utilsService, "yesNo");

      service.getPrintableProperty(CameraGenerator.camera({ cooled: true }), CameraDisplayProperty.COOLED);
      expect(service.utilsService.yesNo).toHaveBeenCalledWith(true);

      yesNoMock.mockReset();

      service.getPrintableProperty(CameraGenerator.camera({ cooled: false }), CameraDisplayProperty.COOLED);
      expect(service.utilsService.yesNo).toHaveBeenCalledWith(false);
    });

    it("should work for 'maxCooling'", () => {
      expect(
        service.getPrintableProperty(CameraGenerator.camera({ maxCooling: 10 }), CameraDisplayProperty.MAX_COOLING)
      ).toEqual("10 &deg;C");

      expect(
        service.getPrintableProperty(CameraGenerator.camera({ maxCooling: null }), CameraDisplayProperty.MAX_COOLING)
      ).toEqual("");
    });

    it("should work for 'backFocus'", () => {
      expect(
        service.getPrintableProperty(CameraGenerator.camera({ backFocus: 10 }), CameraDisplayProperty.BACK_FOCUS)
      ).toEqual("10 mm");

      expect(
        service.getPrintableProperty(CameraGenerator.camera({ backFocus: null }), CameraDisplayProperty.BACK_FOCUS)
      ).toEqual("");
    });
  });
});
