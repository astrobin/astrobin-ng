import { TestBed } from "@angular/core/testing";
import { CompareService, CompareServiceError } from "./compare.service";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { CameraGenerator } from "@features/equipment/generators/camera.generator";
import { MountGenerator } from "@features/equipment/generators/mount.generator";
import { CameraDisplayProperty, CameraService } from "@features/equipment/services/camera.service";
import { of } from "rxjs";
import { MountDisplayProperty, MountService } from "@features/equipment/services/mount.service";

describe("CompareService", () => {
  let service: CompareService;
  let mountService: MountService;

  beforeEach(async () => {
    await MockBuilder(CompareService, AppModule);
    service = TestBed.inject(CompareService);
    mountService = TestBed.inject(MountService);
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

      expect(() => service.add(item)).toThrowError(CompareServiceError.ALREADY_IN_LIST);

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
      const mount0 = MountGenerator.mount({ id: 1, name: "mount0" });
      const mount1 = MountGenerator.mount({ id: 2, name: "mount1" });
      const mount2 = MountGenerator.mount({ id: 3, name: "mount2" });

      service.add(mount0);
      service.add(mount1);
      service.add(mount2);

      jest.spyOn(service.equipmentItemServiceFactory, "getService").mockReturnValue(mountService);
      jest.spyOn(service.equipmentItemService, "getFullDisplayName$").mockReturnValue(of("foo"));
      jest.spyOn(service.equipmentItemService, "getPrintableProperty$").mockReturnValue(of("foo.png"));
      jest.spyOn(mountService, "getSupportedPrintableProperties").mockReturnValue(["WEIGHT" as MountDisplayProperty]);
      jest.spyOn(service.equipmentItemService, "getPrintablePropertyName").mockReturnValue("Weight");
      jest.spyOn(mountService, "getPrintableProperty$").mockImplementation((mount, property) => of(mount.weight + ""));

      service.comparison$().subscribe(comparison => {
        expect(Object.keys(comparison).length).toEqual(3);

        // 5 = NAME, IMAGE, WEIGHT, USERS, IMAGES
        expect(comparison[mount0.id].length).toEqual(5);
        expect(comparison[mount1.id].length).toEqual(5);
        expect(comparison[mount2.id].length).toEqual(5);

        expect(comparison[mount0.id][0].name).toEqual("Weight");
        expect(comparison[mount0.id][0].value).toEqual(mount0.weight + "");

        expect(comparison[mount1.id][0].name).toEqual("Weight");
        expect(comparison[mount1.id][0].value).toEqual(mount1.weight + "");

        expect(comparison[mount2.id][0].name).toEqual("Weight");
        expect(comparison[mount2.id][0].value).toEqual(mount2.weight + "");

        done();
      });
    });
  });
});
