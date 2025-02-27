import { TestBed } from "@angular/core/testing";
import { EquipmentService } from "./equipment.service";
import { TelescopeInterface, TelescopeType } from "@features/equipment/types/telescope.interface";
import { CameraInterface } from "@features/equipment/types/camera.interface";
import { MountInterface } from "@features/equipment/types/mount.interface";
import { FilterInterface } from "@features/equipment/types/filter.interface";
import { TranslateService } from "@ngx-translate/core";
import { Actions } from "@ngrx/effects";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";
import { LoadingService } from "./loading.service";
import { PopNotificationsService } from "./pop-notifications.service";
import { of } from "rxjs";

describe("EquipmentService", () => {
  let service: EquipmentService;
  let translateService: jest.Mocked<Partial<TranslateService>>;

  beforeEach(() => {
    translateService = {
      instant: jest.fn().mockImplementation(key => key) // Return the key as the translation
    };

    const mockStore = {
      dispatch: jest.fn()
    };

    const mockActions = {
      pipe: jest.fn().mockReturnValue(of({}))
    };

    const mockLoadingService = {
      setLoading: jest.fn()
    };

    const mockModalService = {
      open: jest.fn().mockReturnValue({
        componentInstance: {},
        closed: of({})
      })
    };

    const mockPopNotificationsService = {
      success: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        EquipmentService,
        { provide: TranslateService, useValue: translateService },
        { provide: Store, useValue: mockStore },
        { provide: Actions, useValue: mockActions },
        { provide: LoadingService, useValue: mockLoadingService },
        { provide: NgbModal, useValue: mockModalService },
        { provide: PopNotificationsService, useValue: mockPopNotificationsService }
      ]
    });

    service = TestBed.inject(EquipmentService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("humanizeTelescopeLabel", () => {
    it("should return 'Lens' for CAMERA_LENS type", () => {
      const telescope: TelescopeInterface = {
        type: TelescopeType.CAMERA_LENS
      } as TelescopeInterface;

      expect(service.humanizeTelescopeLabel(telescope)).toBe("Lens");
      expect(translateService.instant).toHaveBeenCalledWith("Lens");
    });

    it("should return 'Binoculars' for BINOCULARS type", () => {
      const telescope: TelescopeInterface = {
        type: TelescopeType.BINOCULARS
      } as TelescopeInterface;

      expect(service.humanizeTelescopeLabel(telescope)).toBe("Binoculars");
      expect(translateService.instant).toHaveBeenCalledWith("Binoculars");
    });

    it("should return 'Optics' for OTHER type", () => {
      const telescope: TelescopeInterface = {
        type: TelescopeType.OTHER
      } as TelescopeInterface;

      expect(service.humanizeTelescopeLabel(telescope)).toBe("Optics");
      expect(translateService.instant).toHaveBeenCalledWith("Optics");
    });

    it("should return 'Telescope' for other telescope types", () => {
      const telescope: TelescopeInterface = {
        type: TelescopeType.REFRACTOR_ACHROMATIC
      } as TelescopeInterface;

      expect(service.humanizeTelescopeLabel(telescope)).toBe("Telescope");
      expect(translateService.instant).toHaveBeenCalledWith("Telescope");
    });
  });


  describe("humanizeCameraLabel", () => {
    it("should return 'Camera'", () => {
      const camera: CameraInterface = {} as CameraInterface;

      expect(service.humanizeCameraLabel(camera)).toBe("Camera");
      expect(translateService.instant).toHaveBeenCalledWith("Camera");
    });
  });

  describe("humanizeMountLabel", () => {
    it("should return 'Mount'", () => {
      const mount: MountInterface = {} as MountInterface;

      expect(service.humanizeMountLabel(mount)).toBe("Mount");
      expect(translateService.instant).toHaveBeenCalledWith("Mount");
    });
  });

  describe("humanizeFilterLabel", () => {
    it("should return 'Filter'", () => {
      const filter: FilterInterface = {} as FilterInterface;

      expect(service.humanizeFilterLabel(filter)).toBe("Filter");
      expect(translateService.instant).toHaveBeenCalledWith("Filter");
    });
  });

  describe("humanizeEquipmentItemType", () => {
    it("should call the appropriate type-specific method for each item type", () => {
      jest.spyOn(service, 'humanizeTelescopeLabel');
      jest.spyOn(service, 'humanizeCameraLabel');
      jest.spyOn(service, 'humanizeMountLabel');
      jest.spyOn(service, 'humanizeFilterLabel');

      const telescope = { klass: 'TELESCOPE' } as any;
      const camera = { klass: 'CAMERA' } as any;
      const mount = { klass: 'MOUNT' } as any;
      const filter = { klass: 'FILTER' } as any;
      const other = { klass: 'OTHER' } as any;

      service.humanizeEquipmentItemLabel(telescope);
      service.humanizeEquipmentItemLabel(camera);
      service.humanizeEquipmentItemLabel(mount);
      service.humanizeEquipmentItemLabel(filter);
      service.humanizeEquipmentItemLabel(other);

      expect(service.humanizeTelescopeLabel).toHaveBeenCalledWith(telescope);
      expect(service.humanizeCameraLabel).toHaveBeenCalledWith(camera);
      expect(service.humanizeMountLabel).toHaveBeenCalledWith(mount);
      expect(service.humanizeFilterLabel).toHaveBeenCalledWith(filter);
      expect(translateService.instant).toHaveBeenCalledWith("Equipment");
    });
  });
});
