import { TestBed } from "@angular/core/testing";
import { CompareService, CompareServiceError } from "./compare.service";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { CameraGenerator } from "@features/equipment/generators/camera.generator";
import { MountGenerator } from "@features/equipment/generators/mount.generator";
import { CameraDisplayProperty, CameraService } from "@features/equipment/services/camera.service";
import { of } from "rxjs";

describe("CompareService", () => {
  let service: CompareService;
  let cameraService: CameraService;

  beforeEach(async () => {
    await MockBuilder(CompareService, AppModule);
    service = TestBed.inject(CompareService);
    cameraService = TestBed.inject(CameraService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("add", () => {
    it("should add an item", () => {
      const item = CameraGenerator.camera();

      service.add(item);

      expect(service.getAll()).toContain(item);
      expect(service.getAll()[0]).toEqual(item);
      expect(service.amount()).toBe(1);
    });

    it("should not add duplicates", () => {
      const item = CameraGenerator.camera();

      service.add(item);
      service.add(item);

      expect(service.getAll()).toContain(item);
      expect(service.getAll()[0]).toEqual(item);
      expect(service.amount()).toBe(1);
    });

    it("should not add items of different classes", () => {
      const camera = CameraGenerator.camera();
      const mount = MountGenerator.mount();

      service.add(camera);

      expect(() => service.add(mount)).toThrowError(CompareServiceError.NON_MATCHING_CLASS);
      expect(service.amount()).toBe(1);
    });
  });

  describe("remove", () => {
    it("should remove an item", () => {
      const item = CameraGenerator.camera();

      service.add(item);
      service.remove(item);

      expect(service.amount()).toBe(0);
    });

    it("should throw if the item is not there", () => {
      const item = CameraGenerator.camera();

      expect(() => service.remove(item)).toThrowError(CompareServiceError.ITEM_NOT_FOUND);
    });
  });

  describe("comparison", () => {
    it("should work", done => {
      const camera0 = CameraGenerator.camera({ id: 1, name: "cam0" });
      const camera1 = CameraGenerator.camera({ id: 2, name: "cam1" });
      const camera2 = CameraGenerator.camera({ id: 3, name: "cam2" });

      service.add(camera0);
      service.add(camera1);
      service.add(camera2);

      jest.spyOn(service.equipmentItemServiceFactory, "getService").mockReturnValue(cameraService);
      jest.spyOn(cameraService, "getSupportedPrintableProperties").mockReturnValue(["NAME" as CameraDisplayProperty]);
      jest.spyOn(cameraService, "getPrintablePropertyName").mockReturnValue("Name");
      jest.spyOn(cameraService, "getPrintableProperty$").mockImplementation((camera, property) => of(camera.name));

      service.comparison$().subscribe(comparison => {
        expect(Object.keys(comparison).length).toEqual(3);

        expect(comparison[camera0.id].length).toEqual(cameraService.getSupportedPrintableProperties().length);
        expect(comparison[camera1.id].length).toEqual(cameraService.getSupportedPrintableProperties().length);
        expect(comparison[camera2.id].length).toEqual(cameraService.getSupportedPrintableProperties().length);

        expect(comparison[camera0.id][0].name).toEqual("Name");
        expect(comparison[camera0.id][0].value).toEqual(camera0.name);

        expect(comparison[camera1.id][0].name).toEqual("Name");
        expect(comparison[camera1.id][0].value).toEqual(camera1.name);

        expect(comparison[camera2.id][0].name).toEqual("Name");
        expect(comparison[camera2.id][0].value).toEqual(camera2.name);

        done();
      });
    });
  });
});
