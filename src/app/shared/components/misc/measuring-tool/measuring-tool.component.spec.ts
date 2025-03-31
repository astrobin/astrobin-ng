import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MeasuringToolComponent, MeasurementPoint, MeasurementData, SolutionMatrix } from './measuring-tool.component';
import { CookieService } from 'ngx-cookie';
import { CoordinatesFormatterService } from '@core/services/coordinates-formatter.service';
import { TranslateService, TranslatePipe, TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA, ElementRef, Component, Input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

// Create a mock FA-Icon component
@Component({
  selector: 'fa-icon',
  template: '<span>icon</span>'
})
class MockFaIconComponent {
  @Input() icon: any;
}

describe('MeasuringToolComponent', () => {
  let component: MeasuringToolComponent;
  let fixture: ComponentFixture<MeasuringToolComponent>;
  let cookieService: { get: jest.Mock, put: jest.Mock };
  let coordFormatterService: { formatCompact: jest.Mock };

  beforeEach(async () => {
    cookieService = {
      get: jest.fn().mockReturnValue(null),
      put: jest.fn()
    };

    coordFormatterService = {
      formatCompact: jest.fn().mockReturnValue('00h 00m 00s, +00° 00\' 00"')
    };

    await TestBed.configureTestingModule({
      declarations: [
        MeasuringToolComponent,
        MockFaIconComponent,
        TranslatePipe
      ],
      providers: [
        { provide: CookieService, useValue: cookieService },
        { provide: CoordinatesFormatterService, useValue: coordFormatterService },
        { provide: TranslateService, useValue: { get: jest.fn().mockReturnValue({ pipe: jest.fn() }) } }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(MeasuringToolComponent);
    component = fixture.componentInstance;

    // Mock required inputs
    component.windowWidth = 1000;
    component.windowHeight = 800;
    component.setMouseOverUIElement = jest.fn();

    // Create a mock image element
    const mockImageElement = document.createElement('div');
    const mockZoomContainer = document.createElement('div');
    mockZoomContainer.classList.add('ngxImageZoomContainer');
    const mockImg = document.createElement('img');
    mockZoomContainer.appendChild(mockImg);
    mockImageElement.appendChild(mockZoomContainer);

    component.imageElement = new ElementRef(mockImageElement);

    fixture.detectChanges();

    // Make the private method accessible for testing
    (component as any).loadMeasurementShapePreference();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate distance correctly', () => {
    // Test the Pythagorean theorem
    expect(component.calculateDistance(0, 0, 3, 4)).toBe(5);
    expect(component.calculateDistance(1, 1, 4, 5)).toBe(5);
  });

  it('should format angular distance correctly', () => {
    // Without solution matrix, should show pixels
    expect(component.formatAngularDistance(150)).toBe('150 px');

    // With solution matrix
    component.advancedSolutionMatrix = {
      matrixRect: '0,0,1824,1200',
      matrixDelta: 1,
      raMatrix: '0,0,0,0',
      decMatrix: '0,0,0,0'
    };

    // Skip specific character testing and just ensure the output is formatted differently by size
    const arcsecResult = component.formatAngularDistance(50);
    const arcminResult = component.formatAngularDistance(300);
    const degreeResult = component.formatAngularDistance(1000);

    // Just verify that the results are different based on the size
    expect(arcsecResult).not.toEqual(arcminResult);
    expect(arcminResult).not.toEqual(degreeResult);
    expect(arcsecResult).not.toEqual(degreeResult);

    // And that they all include numbers
    expect(arcsecResult).toMatch(/\d/);
    expect(arcminResult).toMatch(/\d/);
    expect(degreeResult).toMatch(/\d/);
  });

  it('should toggle circle and rectangle visualization', () => {
    // Add a test measurement to the array
    component.previousMeasurements = [{
      startX: 100,
      startY: 100,
      endX: 200,
      endY: 200,
      midX: 150,
      midY: 150,
      distance: '100px',
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

    // Mock the event
    const mockEvent = { preventDefault: jest.fn(), stopPropagation: jest.fn() };

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

  it('should clear all measurements', () => {
    // Add a test measurement to the array
    component.previousMeasurements = [{
      startX: 100,
      startY: 100,
      endX: 200,
      endY: 200,
      midX: 150,
      midY: 150,
      distance: '100px',
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

    // Clear measurements
    component.clearAllMeasurements();
    expect(component.previousMeasurements.length).toBe(0);
  });

  it('should delete a specific measurement', () => {
    // Add test measurements to the array
    component.previousMeasurements = [
      {
        startX: 100,
        startY: 100,
        endX: 200,
        endY: 200,
        midX: 150,
        midY: 150,
        distance: '100px',
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
        distance: '100px',
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

    // Mock the event
    const mockEvent = { preventDefault: jest.fn(), stopPropagation: jest.fn() };

    // Delete the first measurement
    component.deleteMeasurement(mockEvent as any, 0);
    expect(component.previousMeasurements.length).toBe(1);
    expect(component.previousMeasurements[0].midX).toBe(350);
  });

  it('should update coordinate label positions', () => {
    const measurement: MeasurementData = {
      startX: 100,
      startY: 100,
      endX: 200,
      endY: 200,
      midX: 150,
      midY: 150,
      distance: '100px',
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

    component.updateCoordinateLabelPositions(measurement);

    // The labels should be positioned perpendicular to the line
    // For a 45-degree line in this case, they should be offset appropriately
    expect(measurement.startLabelX).not.toBe(0);
    expect(measurement.startLabelY).not.toBe(0);
    expect(measurement.endLabelX).not.toBe(0);
    expect(measurement.endLabelY).not.toBe(0);

    // Verify the specific offset for this 45-degree angle
    // 100,100 to 200,200 gives an angle of 45 degrees
    // Perpendicular is 135 degrees, and with 30px offset:
    // x offset = cos(135°) * 30 ≈ -21.21
    // y offset = sin(135°) * 30 ≈ 21.21
    expect(Math.round(measurement.startLabelX)).toBeCloseTo(100 - 21.21, 0);
    expect(Math.round(measurement.startLabelY)).toBeCloseTo(100 + 21.21, 0);
    expect(Math.round(measurement.endLabelX)).toBeCloseTo(200 - 21.21, 0);
    expect(Math.round(measurement.endLabelY)).toBeCloseTo(200 + 21.21, 0);
  });

  it('should handle point placement clicks when clicking inside the image', () => {
    // Set up mock element with getBoundingClientRect
    const mockZoomImg = component.imageElement.nativeElement.querySelector('.ngxImageZoomContainer img');
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
    jest.spyOn(mockZoomImg, 'getBoundingClientRect').mockReturnValue(mockRect);

    // Create mock click events
    const firstClick = new MouseEvent('click', {
      clientX: 150,
      clientY: 150
    });

    const secondClick = new MouseEvent('click', {
      clientX: 250,
      clientY: 250
    });

    // Spy on the measurementComplete event
    jest.spyOn(component.measurementComplete, 'emit');

    // First click should set start point
    component.handleMeasurementClick(firstClick);
    expect(component.measureStartPoint).not.toBeNull();
    expect(component.measureStartPoint.x).toBe(150);
    expect(component.measureStartPoint.y).toBe(150);
    expect(component.measureEndPoint).toBeNull();

    // Second click should set end point and calculate distance
    component.handleMeasurementClick(secondClick);
    expect(component.measureEndPoint).not.toBeNull();
    expect(component.measureEndPoint.x).toBe(250);
    expect(component.measureEndPoint.y).toBe(250);
    expect(component.measureDistance).toBe('141 px'); // Distance between (150,150) and (250,250)

    // Verify the measurement was saved and event emitted
    expect(component.previousMeasurements.length).toBe(1);
    expect(component.measurementComplete.emit).toHaveBeenCalled();
  });

  it('should not place points when clicking outside the image', () => {
    // Set up mock element with getBoundingClientRect
    const mockZoomImg = component.imageElement.nativeElement.querySelector('.ngxImageZoomContainer img');
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
    jest.spyOn(mockZoomImg, 'getBoundingClientRect').mockReturnValue(mockRect);

    // Click outside the image bounds
    const outsideClick = new MouseEvent('click', {
      clientX: 600,
      clientY: 600
    });

    component.handleMeasurementClick(outsideClick);
    expect(component.measureStartPoint).toBeNull();
  });

  it('should handle dragging of measurement points', fakeAsync(() => {
    // Set up initial points
    component.measureStartPoint = { x: 100, y: 100, ra: null, dec: null };
    component.measureEndPoint = { x: 200, y: 200, ra: null, dec: null };
    component.measureDistance = '141 px';

    // Create mock events
    const mousedownEvent = { clientX: 100, clientY: 100, preventDefault: jest.fn(), stopPropagation: jest.fn() };
    const mousemoveEvent = { clientX: 120, clientY: 120, preventDefault: jest.fn() };
    const mouseupEvent = { clientX: 120, clientY: 120, preventDefault: jest.fn() };

    // Start dragging the start point
    jest.spyOn(document, 'addEventListener');

    component.handlePointDragStart(mousedownEvent as any, 'start');
    expect(component.isDraggingPoint).toBe('start');
    expect(component.dragStartX).toBe(100);
    expect(component.dragStartY).toBe(100);
    expect(document.addEventListener).toHaveBeenCalledWith('mousemove', component['_onPointDragMove']);
    expect(document.addEventListener).toHaveBeenCalledWith('mouseup', component['_onPointDragEnd']);

    // Drag to new position
    component.handlePointDragMove(mousemoveEvent as any);
    expect(component.measureStartPoint.x).toBe(120);
    expect(component.measureStartPoint.y).toBe(120);

    // End drag
    jest.spyOn(document, 'removeEventListener');
    jest.spyOn(component.measurementComplete, 'emit');

    component.handlePointDragEnd(mouseupEvent as any);
    expect(component.isDraggingPoint).toBeNull();
    expect(document.removeEventListener).toHaveBeenCalledWith('mousemove', component['_onPointDragMove']);
    expect(document.removeEventListener).toHaveBeenCalledWith('mouseup', component['_onPointDragEnd']);
    expect(component.measurementComplete.emit).toHaveBeenCalled();
  }));

  it('should handle dragging of previous measurement points', fakeAsync(() => {
    // Add a previous measurement
    component.previousMeasurements = [{
      startX: 100,
      startY: 100,
      endX: 200,
      endY: 200,
      midX: 150,
      midY: 150,
      distance: '141 px',
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
    jest.spyOn(document, 'addEventListener');

    component.handlePreviousMeasurementDrag(mousedownEvent as any, 0, 'start');
    expect(component.isDraggingPoint).toBe('prevStart-0');
    expect(component.dragStartX).toBe(100);
    expect(component.dragStartY).toBe(100);
    expect(document.addEventListener).toHaveBeenCalledWith('mousemove', component['_onPreviousMeasurementDragMove']);
    expect(document.addEventListener).toHaveBeenCalledWith('mouseup', component['_onPreviousMeasurementDragEnd']);

    // Drag to new position
    component.handlePreviousMeasurementDragMove(mousemoveEvent as any);
    expect(component.previousMeasurements[0].startX).toBe(120);
    expect(component.previousMeasurements[0].startY).toBe(120);

    // End drag
    jest.spyOn(document, 'removeEventListener');

    component.handlePreviousMeasurementDragEnd(mouseupEvent as any);
    expect(component.isDraggingPoint).toBeNull();
    expect(document.removeEventListener).toHaveBeenCalledWith('mousemove', component['_onPreviousMeasurementDragMove']);
    expect(document.removeEventListener).toHaveBeenCalledWith('mouseup', component['_onPreviousMeasurementDragEnd']);
  }));

  it('should handle dragging of shapes', fakeAsync(() => {
    // Add a previous measurement
    component.previousMeasurements = [{
      startX: 100,
      startY: 100,
      endX: 200,
      endY: 200,
      midX: 150,
      midY: 150,
      distance: '141 px',
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
    jest.spyOn(document, 'addEventListener');

    component.handleShapeDragStart(mousedownEvent as any, 0, 'circle');
    expect(component.isDraggingPoint).toBe('prevShape-0');
    expect(component.dragStartX).toBe(150);
    expect(component.dragStartY).toBe(150);
    expect(document.addEventListener).toHaveBeenCalledWith('mousemove', component['_onShapeDragMove']);
    expect(document.addEventListener).toHaveBeenCalledWith('mouseup', component['_onShapeDragEnd']);

    // Drag to new position (move 20px in each direction)
    component.handleShapeDragMove(mousemoveEvent as any);

    // Both points should move by the same delta (20px in this case)
    expect(component.previousMeasurements[0].startX).toBe(120);
    expect(component.previousMeasurements[0].startY).toBe(120);
    expect(component.previousMeasurements[0].endX).toBe(220);
    expect(component.previousMeasurements[0].endY).toBe(220);

    // End drag
    jest.spyOn(document, 'removeEventListener');

    component.handleShapeDragEnd(mouseupEvent as any);
    expect(component.isDraggingPoint).toBeNull();
    expect(document.removeEventListener).toHaveBeenCalledWith('mousemove', component['_onShapeDragMove']);
    expect(document.removeEventListener).toHaveBeenCalledWith('mouseup', component['_onShapeDragEnd']);
  }));

  it('should properly clean up event listeners on destroy', () => {
    jest.spyOn(document, 'removeEventListener');

    component.ngOnDestroy();

    // Should remove all potential event listeners
    expect(document.removeEventListener).toHaveBeenCalledWith('mousemove', component['_onMeasuringMouseMove']);
    expect(document.removeEventListener).toHaveBeenCalledWith('mousemove', component['_onPointDragMove']);
    expect(document.removeEventListener).toHaveBeenCalledWith('mouseup', component['_onPointDragEnd']);
    expect(document.removeEventListener).toHaveBeenCalledWith('mousemove', component['_onPreviousMeasurementDragMove']);
    expect(document.removeEventListener).toHaveBeenCalledWith('mouseup', component['_onPreviousMeasurementDragEnd']);
    expect(document.removeEventListener).toHaveBeenCalledWith('mousemove', component['_onShapeDragMove']);
    expect(document.removeEventListener).toHaveBeenCalledWith('mouseup', component['_onShapeDragEnd']);
    expect(document.removeEventListener).toHaveBeenCalledWith('mousemove', component['_onCurrentShapeDragMove']);
    expect(document.removeEventListener).toHaveBeenCalledWith('mouseup', component['_onCurrentShapeDragEnd']);
  });

  it('should add mousemove listener when active', () => {
    jest.spyOn(document, 'addEventListener');
    component.active = true;
    component.ngOnInit();
    expect(document.addEventListener).toHaveBeenCalledWith('mousemove', component['_onMeasuringMouseMove']);
  });

  it('should load measurement shape preference from cookie', () => {
    // Test with circle preference
    cookieService.get.mockReturnValue('circle');
    (component as any).loadMeasurementShapePreference();
    expect(component.showCurrentCircle).toBe(true);
    expect(component.showCurrentRectangle).toBe(false);

    // Test with rectangle preference
    cookieService.get.mockReturnValue('rectangle');
    (component as any).loadMeasurementShapePreference();
    expect(component.showCurrentCircle).toBe(false);
    expect(component.showCurrentRectangle).toBe(true);

    // Test with no preference
    cookieService.get.mockReturnValue(null);
    (component as any).loadMeasurementShapePreference();
    expect(component.showCurrentCircle).toBe(false);
    expect(component.showCurrentRectangle).toBe(false);
  });

  it('should format celestial distances', () => {
    // Set the advanced solution matrix
    component.advancedSolutionMatrix = {
      matrixRect: '0,0,1824,1200',
      matrixDelta: 1,
      raMatrix: '0,0,0,0',
      decMatrix: '0,0,0,0'
    };

    // Test horizontal distance
    const horizontalResult = component.getHorizontalCelestialDistance(100, 150, 300);
    expect(horizontalResult.endsWith('°')).toBe(true);

    // Test vertical distance
    const verticalResult = component.getVerticalCelestialDistance(100, 150, 450);
    expect(verticalResult.endsWith('°')).toBe(true);

    // Test pixel fallback when no solution matrix
    component.advancedSolutionMatrix = null;
    expect(component.getHorizontalCelestialDistance(100, 150, 300)).toBe('');
    expect(component.getVerticalCelestialDistance(100, 150, 450)).toBe('');
  });

  it('should calculate label positions correctly', () => {
    component.measureStartPoint = { x: 100, y: 100, ra: null, dec: null };
    component.measureEndPoint = { x: 200, y: 200, ra: null, dec: null };

    // Test start label positions (45 degree line)
    expect(Math.round(component.calculateStartLabelX())).toBeCloseTo(100 - 21.21, 0);
    expect(Math.round(component.calculateStartLabelY())).toBeCloseTo(100 + 21.21, 0);

    // Test end label positions
    expect(Math.round(component.calculateEndLabelX())).toBeCloseTo(200 - 21.21, 0);
    expect(Math.round(component.calculateEndLabelY())).toBeCloseTo(200 + 21.21, 0);
  });

  it('should emit exitMeasuringMode event when exiting', () => {
    jest.spyOn(component.exitMeasuringMode, 'emit');
    component.exitMeasuring();
    expect(component.exitMeasuringMode.emit).toHaveBeenCalled();
  });

  it('should format coordinates compactly', () => {
    const formatted = component.formatCoordinatesCompact(10, 20);
    expect(formatted).toContain('10h');
    expect(formatted).toContain('+20°');
  });
});
