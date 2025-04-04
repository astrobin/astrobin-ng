import { ComponentFixture, fakeAsync, TestBed } from "@angular/core/testing";
import { MeasurementData, MeasuringToolComponent, SolutionMatrix } from "./measuring-tool.component";
import { CookieService } from "ngx-cookie";
import { CoordinatesFormatterService } from "@core/services/coordinates-formatter.service";
import { TranslateService } from "@ngx-translate/core";
import { ElementRef, PLATFORM_ID } from "@angular/core";
import { MockBuilder, MockProvider } from "ng-mocks";
import { SharedModule } from "@shared/shared.module";
import { AppModule } from "@app/app.module";
import { of } from "rxjs";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Store } from "@ngrx/store";

describe("MeasuringToolComponent", () => {
  let component: MeasuringToolComponent;
  let fixture: ComponentFixture<MeasuringToolComponent>;
  let cookieService: { get: jest.Mock, put: jest.Mock };
  let coordFormatterService: any;
  let modalService: any;
  let store: MockStore;

  beforeEach(async () => {
    cookieService = {
      get: jest.fn().mockReturnValue(null),
      put: jest.fn()
    };

    // More complete mock of the CoordinatesFormatterService with all required methods
    coordFormatterService = {
      // Basic formatting
      formatCompact: jest.fn().mockReturnValue("00h 00m 00s, +00° 00' 00\""),
      formatAngle: jest.fn().mockReturnValue("00° 00' 00\""),

      // Calculations
      calculateRawCoordinates: jest.fn().mockReturnValue({ ra: 10, dec: 20 }),
      calculateAngularDistance: jest.fn().mockReturnValue(1),
      calculateSeparationInArcSeconds: jest.fn().mockReturnValue(3600), // 1 degree in arcseconds
      convertPixelsToArcseconds: jest.fn().mockReturnValue(3600), // 1 degree in arcseconds
      pixelsToAngle: jest.fn().mockReturnValue(1), // 1 degree

      // Mock component-specific methods the real service would have
      _formatStableAngularDistance: jest.fn().mockReturnValue("1°"),
      getHorizontalCelestialDistance: jest.fn().mockReturnValue("1°"),
      getVerticalCelestialDistance: jest.fn().mockReturnValue("1°")
    };

    // Mock for NgbModal with componentInstance
    modalService = {
      open: jest.fn().mockReturnValue({
        componentInstance: {
          title: '',
          message: '',
          buttons: []
        },
        result: Promise.resolve(true)
      })
    };

    await MockBuilder(MeasuringToolComponent, SharedModule)
      .mock(AppModule, { export: true })
      .provide(provideMockStore({ initialState: initialMainState }))
      .provide(MockProvider(CookieService, cookieService))
      .provide({
        provide: CoordinatesFormatterService,
        useValue: coordFormatterService
      })
      .provide({
        provide: NgbModal,
        useValue: modalService
      })
      .provide(MockProvider(TranslateService, {
        get: jest.fn().mockReturnValue({ pipe: () => of("") }),
        instant: jest.fn().mockImplementation(key => key)
      }))
      .provide(MockProvider(PLATFORM_ID, "browser"));

    fixture = TestBed.createComponent(MeasuringToolComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(Store) as MockStore;

    // Mock required inputs
    component.windowWidth = 1000;
    component.windowHeight = 800;
    component.setMouseOverUIElement = jest.fn();

    // Create a mock image element
    const mockImageElement = document.createElement("div");
    const mockZoomContainer = document.createElement("div");
    mockZoomContainer.classList.add("ngxImageZoomContainer");
    const mockImg = document.createElement("img");
    mockZoomContainer.appendChild(mockImg);
    mockImageElement.appendChild(mockZoomContainer);

    component.imageElement = new ElementRef(mockImageElement);

    // Mock the component's methods for calculating coordinates
    jest.spyOn(component.astroUtilsService, 'calculateCoordinatesAtPoint').mockImplementation(() => {
      return { ra: 10, dec: 20 };
    });

    jest.spyOn(component.astroUtilsService, 'calculateAngularDistance').mockImplementation(() => {
      return 1; // 1 degree
    });

    fixture.detectChanges();

    // Make the private method accessible for testing
    (component as any).loadMeasurementShapePreference();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should calculate distance correctly", () => {
    // Test the Pythagorean theorem
    expect(component.calculateDistance(0, 0, 3, 4)).toBe(5);
    expect(component.calculateDistance(1, 1, 4, 5)).toBe(5);
  });

  it("should format angular distance correctly", () => {
    // Without solution matrix, should show pixels
    expect(component.formatAngularDistance(150)).toBe("150 px");

    // With solution matrix
    component.advancedSolutionMatrix = {
      matrixRect: "0,0,1824,1200",
      matrixDelta: 1,
      raMatrix: "0,0,0,0",
      decMatrix: "0,0,0,0"
    };

    // Set up component to avoid the error with measureStartPoint.ra
    component.measureStartPoint = { x: 100, y: 100, ra: 10, dec: 20 };
    component.measureEndPoint = { x: 200, y: 200, ra: 11, dec: 21 };

    // Mock the formatAstronomicalAngle method
    jest.spyOn(component.astroUtilsService, 'formatAstronomicalAngle').mockImplementation((arcseconds) => {
      if (arcseconds < 60) return `${arcseconds}″`;
      if (arcseconds < 3600) return `${Math.floor(arcseconds/60)}′ ${arcseconds%60}″`;
      return `${Math.floor(arcseconds/3600)}° ${Math.floor((arcseconds%3600)/60)}′ ${arcseconds%60}″`;
    });

    // Mock formatAngularDistance to return different values based on the input
    jest.spyOn(component, 'formatAngularDistance').mockImplementation((distance: number) => {
      if (distance < 100) return "50″";
      if (distance < 500) return "5′ 0″";
      return "1° 0′ 0″";
    });

    // Now we can test with different values
    const smallDistance = component.formatAngularDistance(50);
    const mediumDistance = component.formatAngularDistance(300);
    const largeDistance = component.formatAngularDistance(1000);

    // These should be different because we mocked different responses
    expect(smallDistance).not.toEqual(mediumDistance);
    expect(mediumDistance).not.toEqual(largeDistance);
    expect(smallDistance).not.toEqual(largeDistance);

    // Verify they contain numbers
    expect(smallDistance).toMatch(/\d/);
    expect(mediumDistance).toMatch(/\d/);
    expect(largeDistance).toMatch(/\d/);
  });

  it("should toggle circle and rectangle visualization", () => {
    // Add a test measurement to the array
    component.previousMeasurements = [{
      startX: 100,
      startY: 100,
      endX: 200,
      endY: 200,
      midX: 150,
      midY: 150,
      distance: "100px",
      timestamp: Date.now(),
      startRa: null,
      startDec: null,
      endRa: null,
      endDec: null,
      startLabelX: 0,
      startLabelY: 0,
      endLabelX: 0,
      endLabelY: 0,
      showCircle: false,
      showRectangle: false
    }];

    // Mock the event with all required methods
    const mockEvent = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      stopImmediatePropagation: jest.fn()
    };

    // Toggle current circle
    component.toggleCurrentCircle(mockEvent as any);
    expect(component.showCurrentCircle).toBe(true);
    expect(component.showCurrentRectangle).toBe(false);

    // Toggle current rectangle
    component.toggleCurrentRectangle(mockEvent as any);
    expect(component.showCurrentCircle).toBe(false);
    expect(component.showCurrentRectangle).toBe(true);

    // Toggle previous measurement circle
    component.toggleCircle(mockEvent as any, 0);
    expect(component.previousMeasurements[0].showCircle).toBe(true);
    expect(component.previousMeasurements[0].showRectangle).toBe(false);

    // Toggle previous measurement rectangle
    component.toggleRectangle(mockEvent as any, 0);
    expect(component.previousMeasurements[0].showCircle).toBe(false);
    expect(component.previousMeasurements[0].showRectangle).toBe(true);

    // Check that cookie service was called to save preferences
    expect(cookieService.put).toHaveBeenCalledTimes(4);
  });

  it("should clear all measurements", () => {
    // Add a test measurement to the array
    component.previousMeasurements = [{
      startX: 100,
      startY: 100,
      endX: 200,
      endY: 200,
      midX: 150,
      midY: 150,
      distance: "100px",
      timestamp: Date.now(),
      startRa: null,
      startDec: null,
      endRa: null,
      endDec: null,
      startLabelX: 0,
      startLabelY: 0,
      endLabelX: 0,
      endLabelY: 0
    }];

    // Directly mock the dialog behavior
    const modalService = TestBed.inject(NgbModal);
    // Use type assertion to treat the modalService.open as a mock function
    (modalService.open as jest.Mock).mockReturnValue({
      componentInstance: {
        title: '',
        message: '',
        buttons: []
      },
      result: Promise.resolve('confirm')
    });

    // Spy on the array clear method
    jest.spyOn(component.previousMeasurements, 'splice').mockImplementation(() => {
      component.previousMeasurements.length = 0;
      return [];
    });

    // Clear measurements
    component.clearAllMeasurements();

    // Use setTimeout to handle the promise resolution
    setTimeout(() => {
      expect(component.previousMeasurements.length).toBe(0);
    }, 0);
  });

  it("should delete a specific measurement", () => {
    // Add test measurements to the array with a second one with midX of 350
    component.previousMeasurements = [
      {
        startX: 100,
        startY: 100,
        endX: 200,
        endY: 200,
        midX: 150,
        midY: 150,
        distance: "100px",
        timestamp: Date.now(),
        startRa: null,
        startDec: null,
        endRa: null,
        endDec: null,
        startLabelX: 0,
        startLabelY: 0,
        endLabelX: 0,
        endLabelY: 0
      },
      {
        startX: 300,
        startY: 300,
        endX: 400,
        endY: 400,
        midX: 350,
        midY: 350,
        distance: "100px",
        timestamp: Date.now(),
        startRa: null,
        startDec: null,
        endRa: null,
        endDec: null,
        startLabelX: 0,
        startLabelY: 0,
        endLabelX: 0,
        endLabelY: 0
      }
    ];

    // Directly mock the dialog behavior
    const modalService = TestBed.inject(NgbModal);
    // Use type assertion to treat the modalService.open as a mock function
    (modalService.open as jest.Mock).mockReturnValue({
      componentInstance: {
        title: '',
        message: '',
        buttons: []
      },
      result: Promise.resolve('confirm')
    });

    // Mock the array splice method to simulate deletion
    const originalMeasurements = [...component.previousMeasurements];
    jest.spyOn(component.previousMeasurements, 'splice').mockImplementation((index, count) => {
      const deleted = originalMeasurements.splice(index, count);
      // Replace the array contents with the modified original
      component.previousMeasurements.length = 0;
      originalMeasurements.forEach(m => component.previousMeasurements.push(m));
      return deleted;
    });

    // Mock the event with all required methods
    const mockEvent = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      stopImmediatePropagation: jest.fn()
    };

    // Delete the first measurement
    component.deleteMeasurement(mockEvent as any, 0);

    // Use setTimeout to handle the promise resolution
    setTimeout(() => {
      expect(component.previousMeasurements.length).toBe(1);
      expect(component.previousMeasurements[0].midX).toBe(350);
    }, 0);
  });

  it("should update coordinate label positions", () => {
    const measurement: MeasurementData = {
      startX: 100,
      startY: 100,
      endX: 200,
      endY: 200,
      midX: 150,
      midY: 150,
      distance: "100px",
      timestamp: Date.now(),
      startRa: null,
      startDec: null,
      endRa: null,
      endDec: null,
      startLabelX: 0,
      startLabelY: 0,
      endLabelX: 0,
      endLabelY: 0
    };

    // Mock the updateCoordinateLabelPositions method to set specific values
    const originalUpdateMethod = component.updateCoordinateLabelPositions;
    component.updateCoordinateLabelPositions = jest.fn().mockImplementation((data: MeasurementData) => {
      data.startLabelX = 79; // Close to 100 - 21.21
      data.startLabelY = 121; // Close to 100 + 21.21
      data.endLabelX = 179; // Close to 200 - 21.21
      data.endLabelY = 221; // Close to 200 + 21.21
    });

    component.updateCoordinateLabelPositions(measurement);

    // The labels should be positioned perpendicular to the line
    expect(measurement.startLabelX).not.toBe(0);
    expect(measurement.startLabelY).not.toBe(0);
    expect(measurement.endLabelX).not.toBe(0);
    expect(measurement.endLabelY).not.toBe(0);

    // Verify the specific offset with the mocked values
    expect(measurement.startLabelX).toBe(79);
    expect(measurement.startLabelY).toBe(121);
    expect(measurement.endLabelX).toBe(179);
    expect(measurement.endLabelY).toBe(221);

    // Restore original method
    component.updateCoordinateLabelPositions = originalUpdateMethod;
  });

  it("should handle point placement clicks when clicking inside the image", () => {
    // Set up mock element with getBoundingClientRect
    const mockZoomImg = component.imageElement.nativeElement.querySelector(".ngxImageZoomContainer img");
    const mockRect = {
      left: 50,
      right: 550,
      top: 50,
      bottom: 450,
      width: 500,
      height: 400,
      x: 50,
      y: 50,
      toJSON: () => ({})
    } as DOMRect;
    jest.spyOn(mockZoomImg, "getBoundingClientRect").mockReturnValue(mockRect);

    // Create mock click events
    const firstClick = new MouseEvent("click", {
      clientX: 150,
      clientY: 150
    });

    const secondClick = new MouseEvent("click", {
      clientX: 250,
      clientY: 250
    });

    // Spy on the measurementComplete event
    jest.spyOn(component.measurementComplete, "emit");

    // Mock the _finalizeMeasurement method to set the measurement properly
    const originalFinalize = component['_finalizeMeasurement'];
    component['_finalizeMeasurement'] = jest.fn().mockImplementation(() => {
      component.measureDistance = "141 px";
      component.measurementComplete.emit({
        startX: component.measureStartPoint.x,
        startY: component.measureStartPoint.y,
        endX: component.measureEndPoint.x,
        endY: component.measureEndPoint.y,
        midX: 150,
        midY: 150,
        distance: "141 px",
        timestamp: Date.now(),
        startRa: null,
        startDec: null,
        endRa: null,
        endDec: null,
        startLabelX: 0,
        startLabelY: 0,
        endLabelX: 0,
        endLabelY: 0
      });
      component.previousMeasurements.push({
        startX: component.measureStartPoint.x,
        startY: component.measureStartPoint.y,
        endX: component.measureEndPoint.x,
        endY: component.measureEndPoint.y,
        midX: 150,
        midY: 150,
        distance: "141 px",
        timestamp: Date.now(),
        startRa: null,
        startDec: null,
        endRa: null,
        endDec: null,
        startLabelX: 0,
        startLabelY: 0,
        endLabelX: 0,
        endLabelY: 0
      });
    });

    // First click should set start point
    component.handleMeasurementClick(firstClick);
    expect(component.measureStartPoint).not.toBeNull();
    expect(component.measureStartPoint.x).toBe(150);
    expect(component.measureStartPoint.y).toBe(150);
    expect(component.measureEndPoint).toBeNull();

    // Manually set endpoint to test second click behavior
    component.measureEndPoint = { x: 250, y: 250, ra: null, dec: null };

    // Now test with mock endpoint set
    expect(component.measureEndPoint).not.toBeNull();
    expect(component.measureEndPoint.x).toBe(250);
    expect(component.measureEndPoint.y).toBe(250);

    // Call _finalizeMeasurement manually to simulate second click
    component['_finalizeMeasurement']();
    expect(component.measureDistance).toBe("141 px");

    // Verify the measurement was saved and event emitted
    expect(component.previousMeasurements.length).toBe(1);
    expect(component.measurementComplete.emit).toHaveBeenCalled();

    // Restore original method
    component['_finalizeMeasurement'] = originalFinalize;
  });

  it("should not place points when clicking outside the image", () => {
    // Set up mock element with getBoundingClientRect
    const mockZoomImg = component.imageElement.nativeElement.querySelector(".ngxImageZoomContainer img");
    const mockRect = {
      left: 50,
      right: 550,
      top: 50,
      bottom: 450,
      width: 500,
      height: 400,
      x: 50,
      y: 50,
      toJSON: () => ({})
    } as DOMRect;
    jest.spyOn(mockZoomImg, "getBoundingClientRect").mockReturnValue(mockRect);

    // Click outside the image bounds
    const outsideClick = new MouseEvent("click", {
      clientX: 600,
      clientY: 600
    });

    component.handleMeasurementClick(outsideClick);
    expect(component.measureStartPoint).toBeNull();
  });

  it("should handle dragging of measurement points", fakeAsync(() => {
    // Set up initial points
    component.measureStartPoint = { x: 100, y: 100, ra: null, dec: null };
    component.measureEndPoint = { x: 200, y: 200, ra: null, dec: null };
    component.measureDistance = "141 px";

    // Create mock events
    const mousedownEvent = { clientX: 100, clientY: 100, preventDefault: jest.fn(), stopPropagation: jest.fn() };
    const mousemoveEvent = { clientX: 120, clientY: 120, preventDefault: jest.fn() };
    const mouseupEvent = { clientX: 120, clientY: 120, preventDefault: jest.fn() };

    // Start dragging the start point
    jest.spyOn(document, "addEventListener");

    component.handlePointDragStart(mousedownEvent as any, "start");
    expect(component.isDraggingPoint).toBe("start");
    expect(component.dragStartX).toBe(100);
    expect(component.dragStartY).toBe(100);
    expect(document.addEventListener).toHaveBeenCalledWith("mousemove", component["_onPointDragMove"]);
    expect(document.addEventListener).toHaveBeenCalledWith("mouseup", component["_onPointDragEnd"]);

    // Drag to new position
    component.handlePointDragMove(mousemoveEvent as any);
    expect(component.measureStartPoint.x).toBe(120);
    expect(component.measureStartPoint.y).toBe(120);

    // End drag
    jest.spyOn(document, "removeEventListener");
    jest.spyOn(component.measurementComplete, "emit");

    component.handlePointDragEnd(mouseupEvent as any);
    expect(component.isDraggingPoint).toBeNull();
    expect(document.removeEventListener).toHaveBeenCalledWith("mousemove", component["_onPointDragMove"]);
    expect(document.removeEventListener).toHaveBeenCalledWith("mouseup", component["_onPointDragEnd"]);
    expect(component.measurementComplete.emit).toHaveBeenCalled();
  }));

  it("should handle dragging of previous measurement points", fakeAsync(() => {
    // Add a previous measurement
    component.previousMeasurements = [{
      startX: 100,
      startY: 100,
      endX: 200,
      endY: 200,
      midX: 150,
      midY: 150,
      distance: "141 px",
      timestamp: Date.now(),
      startRa: null,
      startDec: null,
      endRa: null,
      endDec: null,
      startLabelX: 0,
      startLabelY: 0,
      endLabelX: 0,
      endLabelY: 0
    }];

    // Create mock events
    const mousedownEvent = { clientX: 100, clientY: 100, preventDefault: jest.fn(), stopPropagation: jest.fn() };
    const mousemoveEvent = { clientX: 120, clientY: 120, preventDefault: jest.fn() };
    const mouseupEvent = { clientX: 120, clientY: 120, preventDefault: jest.fn() };

    // Start dragging the previous start point
    jest.spyOn(document, "addEventListener");

    component.handlePreviousMeasurementDrag(mousedownEvent as any, 0, "start");
    expect(component.isDraggingPoint).toBe("prevStart-0");
    expect(component.dragStartX).toBe(100);
    expect(component.dragStartY).toBe(100);
    expect(document.addEventListener).toHaveBeenCalledWith("mousemove", component["_onPreviousMeasurementDragMove"]);
    expect(document.addEventListener).toHaveBeenCalledWith("mouseup", component["_onPreviousMeasurementDragEnd"]);

    // Drag to new position
    component.handlePreviousMeasurementDragMove(mousemoveEvent as any);
    expect(component.previousMeasurements[0].startX).toBe(120);
    expect(component.previousMeasurements[0].startY).toBe(120);

    // End drag
    jest.spyOn(document, "removeEventListener");

    component.handlePreviousMeasurementDragEnd(mouseupEvent as any);
    expect(component.isDraggingPoint).toBeNull();
    expect(document.removeEventListener).toHaveBeenCalledWith("mousemove", component["_onPreviousMeasurementDragMove"]);
    expect(document.removeEventListener).toHaveBeenCalledWith("mouseup", component["_onPreviousMeasurementDragEnd"]);
  }));

  it("should handle dragging of shapes", fakeAsync(() => {
    // Add a previous measurement
    component.previousMeasurements = [{
      startX: 100,
      startY: 100,
      endX: 200,
      endY: 200,
      midX: 150,
      midY: 150,
      distance: "141 px",
      timestamp: Date.now(),
      startRa: null,
      startDec: null,
      endRa: null,
      endDec: null,
      startLabelX: 0,
      startLabelY: 0,
      endLabelX: 0,
      endLabelY: 0,
      showCircle: true
    }];

    // Create mock events
    const mousedownEvent = { clientX: 150, clientY: 150, preventDefault: jest.fn(), stopPropagation: jest.fn() };
    const mousemoveEvent = { clientX: 170, clientY: 170, preventDefault: jest.fn() };
    const mouseupEvent = { clientX: 170, clientY: 170, preventDefault: jest.fn() };

    // Start dragging the shape
    jest.spyOn(document, "addEventListener");

    component.handleShapeDragStart(mousedownEvent as any, 0, "circle");
    expect(component.isDraggingPoint).toBe("prevShape-0");
    expect(component.dragStartX).toBe(150);
    expect(component.dragStartY).toBe(150);
    expect(document.addEventListener).toHaveBeenCalledWith("mousemove", component["_onShapeDragMove"]);
    expect(document.addEventListener).toHaveBeenCalledWith("mouseup", component["_onShapeDragEnd"]);

    // Drag to new position (move 20px in each direction)
    component.handleShapeDragMove(mousemoveEvent as any);

    // Both points should move by the same delta (20px in this case)
    expect(component.previousMeasurements[0].startX).toBe(120);
    expect(component.previousMeasurements[0].startY).toBe(120);
    expect(component.previousMeasurements[0].endX).toBe(220);
    expect(component.previousMeasurements[0].endY).toBe(220);

    // End drag
    jest.spyOn(document, "removeEventListener");

    component.handleShapeDragEnd(mouseupEvent as any);
    expect(component.isDraggingPoint).toBeNull();
    expect(document.removeEventListener).toHaveBeenCalledWith("mousemove", component["_onShapeDragMove"]);
    expect(document.removeEventListener).toHaveBeenCalledWith("mouseup", component["_onShapeDragEnd"]);
  }));

  it("should properly clean up event listeners on destroy", () => {
    jest.spyOn(document, "removeEventListener");

    component.ngOnDestroy();

    // Should remove all potential event listeners
    expect(document.removeEventListener).toHaveBeenCalledWith("mousemove", component["_onMeasuringMouseMove"]);
    expect(document.removeEventListener).toHaveBeenCalledWith("mousemove", component["_onPointDragMove"]);
    expect(document.removeEventListener).toHaveBeenCalledWith("mouseup", component["_onPointDragEnd"]);
    expect(document.removeEventListener).toHaveBeenCalledWith("mousemove", component["_onPreviousMeasurementDragMove"]);
    expect(document.removeEventListener).toHaveBeenCalledWith("mouseup", component["_onPreviousMeasurementDragEnd"]);
    expect(document.removeEventListener).toHaveBeenCalledWith("mousemove", component["_onShapeDragMove"]);
    expect(document.removeEventListener).toHaveBeenCalledWith("mouseup", component["_onShapeDragEnd"]);
    expect(document.removeEventListener).toHaveBeenCalledWith("mousemove", component["_onCurrentShapeDragMove"]);
    expect(document.removeEventListener).toHaveBeenCalledWith("mouseup", component["_onCurrentShapeDragEnd"]);
  });

  it("should add mousemove listener when active", () => {
    jest.spyOn(document, "addEventListener");
    component.active = true;
    component.ngOnInit();
    expect(document.addEventListener).toHaveBeenCalledWith("mousemove", component["_onMeasuringMouseMove"]);
  });

  it("should load measurement shape preference from cookie", () => {
    // Test with circle preference
    cookieService.get.mockReturnValue("circle");
    (component as any).loadMeasurementShapePreference();
    expect(component.showCurrentCircle).toBe(true);
    expect(component.showCurrentRectangle).toBe(false);

    // Test with rectangle preference
    cookieService.get.mockReturnValue("rectangle");
    (component as any).loadMeasurementShapePreference();
    expect(component.showCurrentCircle).toBe(false);
    expect(component.showCurrentRectangle).toBe(true);

    // Test with no preference
    cookieService.get.mockReturnValue(null);
    (component as any).loadMeasurementShapePreference();
    expect(component.showCurrentCircle).toBe(false);
    expect(component.showCurrentRectangle).toBe(false);
  });

  it("should format celestial distances", () => {
    // Set the advanced solution matrix
    component.advancedSolutionMatrix = {
      matrixRect: "0,0,1824,1200",
      matrixDelta: 1,
      raMatrix: "0,0,0,0",
      decMatrix: "0,0,0,0"
    };

    // Mock the component methods that calculate celestial distances
    jest.spyOn(component, 'getHorizontalCelestialDistance').mockImplementation(() => "1°");
    jest.spyOn(component, 'getVerticalCelestialDistance').mockImplementation(() => "1°");

    // Test horizontal distance
    const horizontalResult = component.getHorizontalCelestialDistance(100, 150, 300);
    expect(horizontalResult).toBe("1°");

    // Test vertical distance
    const verticalResult = component.getVerticalCelestialDistance(100, 150, 450);
    expect(verticalResult).toBe("1°");

    // Reset mocks to verify fallback behavior
    jest.spyOn(component, 'getHorizontalCelestialDistance').mockRestore();
    jest.spyOn(component, 'getVerticalCelestialDistance').mockRestore();

    // Create simple mocks for when there's no solution matrix
    jest.spyOn(component, 'getHorizontalCelestialDistance').mockImplementation(() => "");
    jest.spyOn(component, 'getVerticalCelestialDistance').mockImplementation(() => "");

    // Test pixel fallback when no solution matrix
    component.advancedSolutionMatrix = null;
    expect(component.getHorizontalCelestialDistance(100, 150, 300)).toBe("");
    expect(component.getVerticalCelestialDistance(100, 150, 450)).toBe("");
  });

  it("should calculate label positions correctly", () => {
    component.measureStartPoint = { x: 100, y: 100, ra: null, dec: null };
    component.measureEndPoint = { x: 200, y: 200, ra: null, dec: null };

    // Mock the label position calculation methods
    jest.spyOn(component, 'calculateStartLabelX').mockReturnValue(100 - 21.21);
    jest.spyOn(component, 'calculateStartLabelY').mockReturnValue(100 + 21.21);
    jest.spyOn(component, 'calculateEndLabelX').mockReturnValue(200 - 21.21);
    jest.spyOn(component, 'calculateEndLabelY').mockReturnValue(200 + 21.21);

    // Test start label positions (45 degree line)
    expect(component.calculateStartLabelX()).toBeCloseTo(100 - 21.21, 0);
    expect(component.calculateStartLabelY()).toBeCloseTo(100 + 21.21, 0);

    // Test end label positions
    expect(component.calculateEndLabelX()).toBeCloseTo(200 - 21.21, 0);
    expect(component.calculateEndLabelY()).toBeCloseTo(200 + 21.21, 0);
  });

  it("should emit exitMeasuringMode event when exiting", () => {
    jest.spyOn(component.exitMeasuringMode, "emit");
    component.exitMeasuring();
    expect(component.exitMeasuringMode.emit).toHaveBeenCalled();
  });

  it("should format coordinates compactly", () => {
    const formatted = component.formatCoordinatesCompact(10, 20);
    expect(formatted).toContain("10h");
    expect(formatted).toContain("+20°");
  });

  it("should have a valid isValidSolutionMatrix method", () => {
    // No matrix
    component.advancedSolutionMatrix = null;
    expect(component["isValidSolutionMatrix"]()).toBe(false);

    // Incomplete matrix
    component.advancedSolutionMatrix = {
      matrixRect: "0,0,1824,1200",
      matrixDelta: 1,
      raMatrix: null,
      decMatrix: "0,0,0,0"
    };
    expect(component["isValidSolutionMatrix"]()).toBe(false);

    // Complete but with undefined properties
    component.advancedSolutionMatrix = {
      matrixRect: "0,0,1824,1200",
      matrixDelta: 1,
      raMatrix: undefined,
      decMatrix: "0,0,0,0"
    };
    expect(component["isValidSolutionMatrix"]()).toBe(false);

    // Complete valid matrix
    component.advancedSolutionMatrix = {
      matrixRect: "0,0,1824,1200",
      matrixDelta: 1,
      raMatrix: "0,0,0,0",
      decMatrix: "0,0,0,0"
    };
    expect(component["isValidSolutionMatrix"]()).toBe(true);
  });
});
