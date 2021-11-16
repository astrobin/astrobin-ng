import { TestBed } from "@angular/core/testing";

import { EquipmentApiService } from "./equipment-api.service";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { BrandGenerator } from "@features/equipment/generators/brand.generator";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { HttpClientModule } from "@angular/common/http";
import { CameraGenerator } from "@features/equipment/generators/camera.generator";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { TelescopeGenerator } from "@features/equipment/generators/telescope.generator";
import { SensorGenerator } from "@features/equipment/generators/sensor.generator";
import { of } from "rxjs";
import { ContentTypeGenerator } from "@shared/generators/content-type.generator";
import { MountGenerator } from "@features/equipment/generators/mount.generator";
import { FilterGenerator } from "@features/equipment/generators/filter.generator";
import { AccessoryGenerator } from "@features/equipment/generators/accessory.generator";

describe("EquipmentApiService", () => {
  let service: EquipmentApiService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await MockBuilder(EquipmentApiService, AppModule).replace(HttpClientModule, HttpClientTestingModule);
    service = TestBed.inject(EquipmentApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("getBrand should work", () => {
    const brand = BrandGenerator.brand();

    service.getBrand(brand.id).subscribe(response => {
      expect(response.id).toEqual(brand.id);
    });

    const req = httpMock.expectOne(`${service.configUrl}/brand/${brand.id}/`);
    expect(req.request.method).toBe("GET");
    req.flush(brand);
  });

  it("createBrand should work", () => {
    const brand = BrandGenerator.brand();

    service.createBrand(brand).subscribe(response => {
      expect(response.id).toEqual(brand.id);
    });

    const req = httpMock.expectOne(`${service.configUrl}/brand/`);
    expect(req.request.method).toBe("POST");
    req.flush(brand);
  });

  it("createSensor should work", () => {
    const sensor = SensorGenerator.sensor();

    service.createSensor(sensor).subscribe(response => {
      expect(response.id).toEqual(sensor.id);
    });

    const req = httpMock.expectOne(`${service.configUrl}/sensor/`);
    expect(req.request.method).toBe("POST");
    req.flush(sensor);
  });

  it("createCamera should work", () => {
    const camera = CameraGenerator.camera();

    service.createCamera(camera, false).subscribe(response => {
      expect(response.id).toEqual(camera.id);
    });

    const req = httpMock.expectOne(`${service.configUrl}/camera/`);
    expect(req.request.method).toBe("POST");
    req.flush(camera);
  });

  it("findAllBrands should work", () => {
    const brands = [BrandGenerator.brand(), BrandGenerator.brand()];

    service.findAllBrands("foo").subscribe(response => {
      expect(response.length).toEqual(2);
    });

    const req = httpMock.expectOne(`${service.configUrl}/brand/?q=foo`);
    expect(req.request.method).toBe("GET");
    req.flush(brands);
  });

  it("findAllEquipmentItems should work", () => {
    const cameras = [CameraGenerator.camera(), CameraGenerator.camera()];

    service.findAllEquipmentItems("foo", EquipmentItemType.CAMERA).subscribe(response => {
      expect(response.length).toEqual(2);
    });

    const req = httpMock.expectOne(`${service.configUrl}/camera/?q=foo`);
    expect(req.request.method).toBe("GET");
    req.flush(cameras);
  });

  // TODO: complete
  describe("getByContentTypeAndObjectId", () => {
    it("should work with camera", () => {
      const camera = CameraGenerator.camera();

      jest
        .spyOn(service.commonApiService, "getContentTypeById")
        .mockReturnValue(of(ContentTypeGenerator.contentType({ model: "camera" })));
      jest.spyOn(service, "getCamera").mockReturnValue(of(camera));

      service.getByContentTypeAndObjectId(1, camera.id).subscribe(response => {
        expect(service.getCamera).toHaveBeenCalledWith(camera.id);
        expect(response.id).toEqual(camera.id);
      });
    });

    it("should work with sensor", () => {
      const sensor = SensorGenerator.sensor();

      jest
        .spyOn(service.commonApiService, "getContentTypeById")
        .mockReturnValue(of(ContentTypeGenerator.contentType({ model: "sensor" })));
      jest.spyOn(service, "getSensor").mockReturnValue(of(sensor));

      service.getByContentTypeAndObjectId(1, sensor.id).subscribe(response => {
        expect(service.getCamera).toHaveBeenCalledWith(sensor.id);
        expect(response.id).toEqual(sensor.id);
      });
    });

    it("should work with telescope", () => {
      const telescope = TelescopeGenerator.telescope();

      jest
        .spyOn(service.commonApiService, "getContentTypeById")
        .mockReturnValue(of(ContentTypeGenerator.contentType({ model: "telescope" })));
      jest.spyOn(service, "getTelescope").mockReturnValue(of(telescope));

      service.getByContentTypeAndObjectId(1, telescope.id).subscribe(response => {
        expect(service.getTelescope).toHaveBeenCalledWith(telescope.id);
        expect(response.id).toEqual(telescope.id);
      });
    });

    it("should work with mount", () => {
      const mount = MountGenerator.mount();

      jest
        .spyOn(service.commonApiService, "getContentTypeById")
        .mockReturnValue(of(ContentTypeGenerator.contentType({ model: "mount" })));
      jest.spyOn(service, "getMount").mockReturnValue(of(mount));

      service.getByContentTypeAndObjectId(1, mount.id).subscribe(response => {
        expect(service.getMount).toHaveBeenCalledWith(mount.id);
        expect(response.id).toEqual(mount.id);
      });
    });

    it("should work with filter", () => {
      const filter = FilterGenerator.filter();

      jest
        .spyOn(service.commonApiService, "getContentTypeById")
        .mockReturnValue(of(ContentTypeGenerator.contentType({ model: "filter" })));
      jest.spyOn(service, "getFilter").mockReturnValue(of(filter));

      service.getByContentTypeAndObjectId(1, filter.id).subscribe(response => {
        expect(service.getFilter).toHaveBeenCalledWith(filter.id);
        expect(response.id).toEqual(filter.id);
      });
    });

    it("should work with accessory", () => {
      const accessory = AccessoryGenerator.accessory();

      jest
        .spyOn(service.commonApiService, "getContentTypeById")
        .mockReturnValue(of(ContentTypeGenerator.contentType({ model: "accessory" })));
      jest.spyOn(service, "getAccessory").mockReturnValue(of(accessory));

      service.getByContentTypeAndObjectId(1, accessory.id).subscribe(response => {
        expect(service.getAccessory).toHaveBeenCalledWith(accessory.id);
        expect(response.id).toEqual(accessory.id);
      });
    });
  });

  // TODO: complete
  describe("getByNameAndType", () => {
    it("should work with sensor", () => {
      const item = SensorGenerator.sensor();

      service.getByBrandAndName(EquipmentItemType.SENSOR, item.brand, item.name).subscribe(response => {
        expect(response.id).toEqual(item.id);
      });

      const req = httpMock.expectOne(
        `${service.configUrl}/sensor/?${new URLSearchParams({ brand: item.brand.toString(), name: item.name })}`
      );
      expect(req.request.method).toBe("GET");
      req.flush(item);
    });

    it("should work with camera", () => {
      const item = CameraGenerator.camera();

      service.getByBrandAndName(EquipmentItemType.CAMERA, item.brand, item.name).subscribe(response => {
        expect(response.id).toEqual(item.id);
      });

      const req = httpMock.expectOne(
        `${service.configUrl}/camera/?${new URLSearchParams({ brand: "" + item.brand.toString(), name: item.name })}`
      );
      expect(req.request.method).toBe("GET");
      req.flush(item);
    });

    it("should work with telescope", () => {
      const item = TelescopeGenerator.telescope();

      service.getByBrandAndName(EquipmentItemType.TELESCOPE, item.brand, item.name).subscribe(response => {
        expect(response.id).toEqual(item.id);
      });

      const req = httpMock.expectOne(
        `${service.configUrl}/telescope/?${new URLSearchParams({ brand: "" + item.brand.toString(), name: item.name })}`
      );
      expect(req.request.method).toBe("GET");
      req.flush(item);
    });

    it("should work with mount", () => {
      const item = MountGenerator.mount();

      service.getByBrandAndName(EquipmentItemType.MOUNT, item.brand, item.name).subscribe(response => {
        expect(response.id).toEqual(item.id);
      });

      const req = httpMock.expectOne(
        `${service.configUrl}/mount/?${new URLSearchParams({ brand: "" + item.brand.toString(), name: item.name })}`
      );
      expect(req.request.method).toBe("GET");
      req.flush(item);
    });

    it("should work with filter", () => {
      const item = FilterGenerator.filter();

      service.getByBrandAndName(EquipmentItemType.FILTER, item.brand, item.name).subscribe(response => {
        expect(response.id).toEqual(item.id);
      });

      const req = httpMock.expectOne(
        `${service.configUrl}/filter/?${new URLSearchParams({ brand: "" + item.brand.toString(), name: item.name })}`
      );
      expect(req.request.method).toBe("GET");
      req.flush(item);
    });

    it("should work with accessory", () => {
      const item = AccessoryGenerator.accessory();

      service.getByBrandAndName(EquipmentItemType.ACCESSORY, item.brand, item.name).subscribe(response => {
        expect(response.id).toEqual(item.id);
      });

      const req = httpMock.expectOne(
        `${service.configUrl}/accessory/?${new URLSearchParams({ brand: "" + item.brand.toString(), name: item.name })}`
      );
      expect(req.request.method).toBe("GET");
      req.flush(item);
    });
  });

  // TODO: complete

  it("getCamera should work", () => {
    const camera = CameraGenerator.camera();

    service.getCamera(camera.id).subscribe(response => {
      expect(response.id).toEqual(camera.id);
    });

    const req = httpMock.expectOne(`${service.configUrl}/camera/${camera.id}/`);
    expect(req.request.method).toBe("GET");
    req.flush(camera);
  });

  it("getSensor should work", () => {
    const sensor = SensorGenerator.sensor();

    service.getSensor(sensor.id).subscribe(response => {
      expect(response.id).toEqual(sensor.id);
    });

    const req = httpMock.expectOne(`${service.configUrl}/sensor/${sensor.id}/`);
    expect(req.request.method).toBe("GET");
    req.flush(sensor);
  });

  it("getTelescope should work", () => {
    const telescope = TelescopeGenerator.telescope();

    service.getTelescope(telescope.id).subscribe(response => {
      expect(response.id).toEqual(telescope.id);
    });

    const req = httpMock.expectOne(`${service.configUrl}/telescope/${telescope.id}/`);
    expect(req.request.method).toBe("GET");
    req.flush(telescope);
  });

  it("getMount should work", () => {
    const mount = MountGenerator.mount();

    service.getMount(mount.id).subscribe(response => {
      expect(response.id).toEqual(mount.id);
    });

    const req = httpMock.expectOne(`${service.configUrl}/mount/${mount.id}/`);
    expect(req.request.method).toBe("GET");
    req.flush(mount);
  });

  it("getFilter should work", () => {
    const filter = FilterGenerator.filter();

    service.getFilter(filter.id).subscribe(response => {
      expect(response.id).toEqual(filter.id);
    });

    const req = httpMock.expectOne(`${service.configUrl}/filter/${filter.id}/`);
    expect(req.request.method).toBe("GET");
    req.flush(filter);
  });

  it("getAccessory should work", () => {
    const accessory = AccessoryGenerator.accessory();

    service.getAccessory(accessory.id).subscribe(response => {
      expect(response.id).toEqual(accessory.id);
    });

    const req = httpMock.expectOne(`${service.configUrl}/accessory/${accessory.id}/`);
    expect(req.request.method).toBe("GET");
    req.flush(accessory);
  });
});
