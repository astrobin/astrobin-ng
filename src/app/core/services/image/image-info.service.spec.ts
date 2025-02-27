import { TestBed } from "@angular/core/testing";
import { ImageInfoService } from "./image-info.service";
import { TranslateService } from "@ngx-translate/core";
import { EquipmentService } from "@core/services/equipment.service";
import { FilterAcquisitionService } from "@features/equipment/services/filter-acquisition.service";
import { ImageInterface } from "@core/interfaces/image.interface";

describe("ImageInfoService", () => {
  let service: ImageInfoService;
  let translateService: jest.Mocked<Partial<TranslateService>>;
  let equipmentService: jest.Mocked<Partial<EquipmentService>>;
  let filterAcquisitionService: jest.Mocked<Partial<FilterAcquisitionService>>;

  beforeEach(() => {
    translateService = {
      instant: jest.fn(key => key)
    };

    equipmentService = {
      humanizeTelescopeLabel: jest.fn().mockReturnValue("Telescope"),
      humanizeCameraLabel: jest.fn().mockReturnValue("Camera"),
      humanizeMountLabel: jest.fn().mockReturnValue("Mount"),
      humanizeFilterLabel: jest.fn().mockReturnValue("Filter"),
      humanizeAccessoryLabel: jest.fn().mockReturnValue("Accessory"),
      humanizeSoftwareLabel: jest.fn().mockReturnValue("Software")
    };

    filterAcquisitionService = {
      buildFilterSummaries: jest.fn(),
      getSortedFilterSummaries: jest.fn(),
      humanizeFilterType: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        ImageInfoService,
        { provide: TranslateService, useValue: translateService },
        { provide: EquipmentService, useValue: equipmentService },
        { provide: FilterAcquisitionService, useValue: filterAcquisitionService }
      ]
    });

    service = TestBed.inject(ImageInfoService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("getEquipmentLabels", () => {
    it("should get singular labels for single items", () => {
      // Create a simple mock of ImageInterface, just enough to test the labels
      const mockImage: Partial<ImageInterface> = {
        imagingTelescopes2: [{}] as any[],
        imagingCameras2: [{}] as any[],
        mounts2: [{}] as any[],
        filters2: [{}] as any[],
        accessories2: [{}] as any[]
      };

      const labels = service.getEquipmentLabels(mockImage as ImageInterface);

      expect(labels.telescopes).toBe("Telescope");
      expect(labels.cameras).toBe("Camera");
      expect(labels.mounts).toBe("Mount");
      expect(labels.filters).toBe("Filter");
      expect(labels.accessories).toBe("Accessory");
      expect(labels.software).toBe("Software");

      expect(equipmentService.humanizeTelescopeLabel).toHaveBeenCalled();
      expect(equipmentService.humanizeCameraLabel).toHaveBeenCalled();
      expect(equipmentService.humanizeMountLabel).toHaveBeenCalled();
      expect(equipmentService.humanizeFilterLabel).toHaveBeenCalled();
      expect(equipmentService.humanizeAccessoryLabel).toHaveBeenCalled();
      expect(equipmentService.humanizeSoftwareLabel).toHaveBeenCalled();
    });

    it("should get plural labels for multiple items", () => {
      // Create a simple mock of ImageInterface with multiple equipment items
      const mockImage: Partial<ImageInterface> = {
        imagingTelescopes2: [{}, {}] as any[],
        imagingCameras2: [{}, {}] as any[],
        mounts2: [{}, {}] as any[],
        filters2: [{}, {}] as any[],
        accessories2: [{}, {}] as any[]
      };

      const labels = service.getEquipmentLabels(mockImage as ImageInterface);

      expect(labels.telescopes).toBe("Optics");
      expect(labels.cameras).toBe("Cameras");
      expect(labels.mounts).toBe("Mounts");
      expect(labels.filters).toBe("Filters");
      expect(labels.accessories).toBe("Accessories");
      expect(labels.software).toBe("Software");

      expect(translateService.instant).toHaveBeenCalledWith("Optics");
      expect(translateService.instant).toHaveBeenCalledWith("Cameras");
      expect(translateService.instant).toHaveBeenCalledWith("Mounts");
      expect(translateService.instant).toHaveBeenCalledWith("Filters");
      expect(translateService.instant).toHaveBeenCalledWith("Accessories");
    });

    it("should handle legacy equipment", () => {
      const mockImage: Partial<ImageInterface> = {
        imagingTelescopes: [{ pk: 1, name: "Telescope 1", make: "Brand" }] as any[],
        imagingCameras: [{ pk: 1, name: "Camera 1", make: "Brand" }] as any[],
      };

      const labels = service.getEquipmentLabels(mockImage as ImageInterface);

      expect(labels.telescopes).toBe("Optics");
      expect(labels.cameras).toBe("Camera");
    });

    it("should handle empty equipment arrays", () => {
      const mockImage: Partial<ImageInterface> = {
        imagingTelescopes2: [] as any[],
        imagingCameras2: [] as any[],
        mounts2: [] as any[],
        filters2: [] as any[],
        accessories2: [] as any[]
      };

      const labels = service.getEquipmentLabels(mockImage as ImageInterface);

      expect(labels.telescopes).toBe("Optics");
      expect(labels.cameras).toBe("Cameras");
      expect(labels.mounts).toBe("Mounts");
      expect(labels.filters).toBe("Filters");
      expect(labels.accessories).toBe("Accessories");
      expect(labels.software).toBe("Software");
    });
  });

  describe("formatEquipmentItem", () => {
    it("should format item with brand and name", () => {
      const item = { brand: 1, brandName: "Brand", name: "Item" } as any;
      expect(service.formatEquipmentItem(item)).toBe("Brand Item");
    });

    it("should format item with make and name (legacy)", () => {
      const item = { make: "Make", name: "Item" } as any;
      expect(service.formatEquipmentItem(item)).toBe("Make Item");
    });

    it("should use DIY as brand when no brand is provided", () => {
      translateService.instant.mockImplementation(key => key === "DIY" ? "DIY" : key);
      const item = { name: "Item" } as any;
      expect(service.formatEquipmentItem(item)).toBe("DIY Item");
    });

    it("should handle null or undefined", () => {
      expect(service.formatEquipmentItem(null)).toBe("");
      expect(service.formatEquipmentItem(undefined)).toBe("");
    });
  });

  describe("addEquipmentDetails", () => {
    it("should add equipment details to lines array", () => {
      const mockImage = {} as ImageInterface;
      const lines: string[] = [];

      // Mock the hasEquipment method
      jest.spyOn(service, "hasEquipment").mockReturnValue(true);

      // Spy on internal methods
      jest.spyOn(service, "addTelescopesEquipment").mockImplementation(jest.fn());
      jest.spyOn(service, "addCamerasEquipment").mockImplementation(jest.fn());

      service.addEquipmentDetails(mockImage as ImageInterface, lines);

      expect(service.hasEquipment).toHaveBeenCalled();
      expect(service.addTelescopesEquipment).toHaveBeenCalled();
      expect(service.addCamerasEquipment).toHaveBeenCalled();
      expect(lines.length).toBeGreaterThan(0);
      expect(lines[0]).toBe("Equipment:");
    });

    it("should not add equipment details if no equipment", () => {
      const mockImage: Partial<ImageInterface> = {};
      const lines: string[] = [];

      jest.spyOn(service, "hasEquipment").mockReturnValue(false);

      service.addEquipmentDetails(mockImage as ImageInterface, lines);

      expect(lines.length).toBe(0);
    });
  });

  describe("addFilterSummaries", () => {
    it("should add filter summaries to lines array", () => {
      const filterSummaries = {
        "OIII": { totalIntegration: 3600, number: 10, duration: "360" },
        "Ha": { totalIntegration: 7200, number: 20, duration: "360" }
      };
      const lines: string[] = [];
      const mockImageService = { formatIntegration: jest.fn().mockReturnValue("1h") };

      filterAcquisitionService.getSortedFilterSummaries.mockReturnValue([
        { filterType: "OIII", summary: filterSummaries["OIII"] },
        { filterType: "Ha", summary: filterSummaries["Ha"] }
      ]);

      filterAcquisitionService.humanizeFilterType.mockImplementation(type => type);

      service.addFilterSummaries(lines, filterSummaries, mockImageService);

      expect(lines.length).toBeGreaterThan(0);
      expect(lines).toContain("Integration per filter:");
      expect(mockImageService.formatIntegration).toHaveBeenCalledTimes(2);
      expect(filterAcquisitionService.getSortedFilterSummaries).toHaveBeenCalledWith(filterSummaries);
    });

    it("should handle empty filter summaries", () => {
      const filterSummaries = {};
      const lines: string[] = [];
      const mockImageService = { formatIntegration: jest.fn() };

      service.addFilterSummaries(lines, filterSummaries, mockImageService);

      expect(lines.length).toBe(0);
      expect(mockImageService.formatIntegration).not.toHaveBeenCalled();
    });
  });

  describe("hasEquipment", () => {
    it("should return true if image has any equipment", () => {
      const mockImage = {
        imagingTelescopes2: [{}] as any[]
      } as Partial<ImageInterface>;

      expect(service.hasEquipment(mockImage as ImageInterface)).toBe(true);
    });

    it("should return false if image has no equipment", () => {
      const mockImage: Partial<ImageInterface> = {
        imagingTelescopes2: [],
        imagingCameras2: [],
        mounts2: [],
        filters2: [],
        accessories2: [],
        software2: [],
        guidingTelescopes2: [],
        guidingCameras2: [],
        imagingTelescopes: [],
        imagingCameras: [],
        mounts: [],
        filters: [],
        accessories: [],
        focalReducers: [],
        software: []
      };

      expect(service.hasEquipment(mockImage as ImageInterface)).toBe(false);
    });
  });
});
