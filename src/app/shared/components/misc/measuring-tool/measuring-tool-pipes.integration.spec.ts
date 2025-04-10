import { Component } from "@angular/core";
import { ComponentFixture } from "@angular/core/testing";
import { MockBuilder, MockRender, ngMocks } from "ng-mocks";

import {
  CalculateDistancePipe,
  CalculateLabelPositionPipe,
  FormatCoordinatesCompactPipe,
  GetMidpointPipe,
  MathAbsPipe,
  MathMaxPipe,
  MathMinPipe
} from "./measuring-tool-pipes";
import { MeasurementPoint } from "./measuring-tool.component";
import { MeasuringToolModule } from "./measuring-tool.module";

// Create a simple test component that uses the pipes
@Component({
  template: `
    <div>
      <!-- Test CalculateDistance pipe -->
      <div id="distance">{{ 10 | calculateDistance : 10 : 13 : 14 }}</div>

      <!-- Test FormatCoordinatesCompact pipe -->
      <div id="coordinates">{{ 10.5 | formatCoordinatesCompact : 20.25 }}</div>

      <!-- Test Math pipes -->
      <div id="mathMin">{{ 10 | mathMin : 5 }}</div>
      <div id="mathMax">{{ 10 | mathMax : 5 }}</div>
      <div id="mathAbs">{{ -10 | mathAbs }}</div>
      <div id="midpoint">{{ 10 | getMidpoint : 20 }}</div>

      <!-- Test CalculateLabelPosition pipe -->
      <div id="labelPosition">
        {{
          (startPoint | calculateLabelPosition : endPoint : "start").x +
            "," +
            (startPoint | calculateLabelPosition : endPoint : "start").y
        }}
      </div>
    </div>
  `
})
class TestComponent {
  startPoint: MeasurementPoint = { x: 100, y: 100, ra: 10, dec: 20 };
  endPoint: MeasurementPoint = { x: 200, y: 100, ra: 11, dec: 20 };
}

describe("MeasuringToolPipes Integration", () => {
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(() => {
    return MockBuilder(TestComponent)
      .keep(CalculateDistancePipe)
      .keep(FormatCoordinatesCompactPipe)
      .keep(MathMinPipe)
      .keep(MathMaxPipe)
      .keep(MathAbsPipe)
      .keep(GetMidpointPipe)
      .keep(CalculateLabelPositionPipe)
      .mock(MeasuringToolModule);
  });

  beforeEach(() => {
    fixture = MockRender(TestComponent);
    fixture.detectChanges();
  });

  it("should calculate distance correctly", () => {
    const distanceElement = ngMocks.find("#distance").nativeElement;

    // Distance from (10,10) to (13,14) should be 5
    expect(distanceElement.textContent.trim()).toBe("5");
  });

  it("should format coordinates correctly", () => {
    const coordinatesElement = ngMocks.find("#coordinates").nativeElement;

    // Format should be "10h 30m 00s, +20° 15' 00""
    expect(coordinatesElement.textContent.trim()).toContain("10h 30m");
    expect(coordinatesElement.textContent.trim()).toContain("+20° 15'");
  });

  it("should calculate min correctly", () => {
    const minElement = ngMocks.find("#mathMin").nativeElement;
    expect(minElement.textContent.trim()).toBe("5");
  });

  it("should calculate max correctly", () => {
    const maxElement = ngMocks.find("#mathMax").nativeElement;
    expect(maxElement.textContent.trim()).toBe("10");
  });

  it("should calculate abs correctly", () => {
    const absElement = ngMocks.find("#mathAbs").nativeElement;
    expect(absElement.textContent.trim()).toBe("10");
  });

  it("should calculate midpoint correctly", () => {
    const midpointElement = ngMocks.find("#midpoint").nativeElement;
    expect(midpointElement.textContent.trim()).toBe("15");
  });

  it("should calculate label position correctly", () => {
    const labelPositionElement = ngMocks.find("#labelPosition").nativeElement;

    // The position should have x and y coordinates separated by a comma
    expect(labelPositionElement.textContent.trim()).toMatch(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/);

    // For a horizontal line from (100,100) to (200,100), the start label should be to the left
    const [x, y] = labelPositionElement.textContent.trim().split(",");

    // X coordinate should be less than the start point (to the left)
    expect(parseFloat(x)).toBeLessThan(100);

    // Y coordinate should be close to the start point Y
    expect(Math.abs(parseFloat(y) - 100)).toBeLessThan(10);
  });
});
