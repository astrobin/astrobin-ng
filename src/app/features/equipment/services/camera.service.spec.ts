import { TestBed } from "@angular/core/testing";

import { CameraService } from "./camera.service";
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

      service.getPrintableProperty(CameraGenerator.camera({ cooled: true }), "cooled");
      expect(service.utilsService.yesNo).toHaveBeenCalledWith(true);

      yesNoMock.mockReset();

      service.getPrintableProperty(CameraGenerator.camera({ cooled: false }), "cooled");
      expect(service.utilsService.yesNo).toHaveBeenCalledWith(false);
    });

    it("should work for 'maxCooling'", () => {
      expect(service.getPrintableProperty(CameraGenerator.camera({ maxCooling: 10 }), "maxCooling")).toEqual(
        "10 &deg;C"
      );

      expect(service.getPrintableProperty(CameraGenerator.camera({ maxCooling: null }), "maxCooling")).toEqual("");
    });

    it("should work for 'backFocus'", () => {
      expect(service.getPrintableProperty(CameraGenerator.camera({ backFocus: 10 }), "backFocus")).toEqual("10 mm");

      expect(service.getPrintableProperty(CameraGenerator.camera({ backFocus: null }), "backFocus")).toEqual("");
    });
  });
});
