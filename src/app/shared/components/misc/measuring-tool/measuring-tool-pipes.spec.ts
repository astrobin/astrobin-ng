import { TestBed } from "@angular/core/testing";
import { MockBuilder, MockProvider } from "ng-mocks";

import {
  CalculateDistancePipe,
  FormatCoordinatesCompactPipe,
  GetCelestialDistancePipe,
  MathMinPipe,
  MathMaxPipe,
  MathAbsPipe,
  GetMidpointPipe,
  CalculateLabelPositionPipe
} from "./measuring-tool-pipes";
import { MeasuringToolModule } from "./measuring-tool.module";
import { MeasurementPoint } from "./measuring-tool.component";

describe("MeasuringToolPipes", () => {
  beforeEach(() => {
    return MockBuilder()
      .provide([
        CalculateDistancePipe,
        FormatCoordinatesCompactPipe,
        GetCelestialDistancePipe,
        MathMinPipe,
        MathMaxPipe,
        MathAbsPipe,
        GetMidpointPipe,
        CalculateLabelPositionPipe
      ])
      .mock(MeasuringToolModule);
  });

  describe("CalculateDistancePipe", () => {
    let pipe: CalculateDistancePipe;

    beforeEach(() => {
      pipe = TestBed.inject(CalculateDistancePipe);
    });

    it("should calculate the distance between two points", () => {
      // Test horizontal distance
      expect(pipe.transform(0, 0, 3, 0)).toBe(3);
      
      // Test vertical distance
      expect(pipe.transform(0, 0, 0, 4)).toBe(4);
      
      // Test diagonal distance (Pythagorean theorem)
      expect(pipe.transform(0, 0, 3, 4)).toBe(5);
      
      // Test negative values
      expect(pipe.transform(-1, -1, 2, 3)).toBe(5);
    });
  });

  describe("FormatCoordinatesCompactPipe", () => {
    let pipe: FormatCoordinatesCompactPipe;

    beforeEach(() => {
      pipe = TestBed.inject(FormatCoordinatesCompactPipe);
    });

    it("should return empty string for null coordinates", () => {
      expect(pipe.transform(null, 10)).toBe("");
      expect(pipe.transform(10, null)).toBe("");
      expect(pipe.transform(null, null)).toBe("");
    });

    it("should format RA and Dec coordinates correctly", () => {
      // Test simple values
      const result = pipe.transform(10, 20);
      expect(result).toContain("10h");
      expect(result).toContain("+20°");

      // Test decimal values
      const result2 = pipe.transform(15.5, -30.25);
      expect(result2).toContain("15h 30m");
      expect(result2).toContain("-30° 15'");
      
      // Test zero padding
      const result3 = pipe.transform(5.125, 8.75);
      expect(result3).toContain("05h 07m 30s");
      expect(result3).toContain("+08° 45'");
    });
  });

  describe("MathMinPipe", () => {
    let pipe: MathMinPipe;

    beforeEach(() => {
      pipe = TestBed.inject(MathMinPipe);
    });

    it("should return the minimum of two numbers", () => {
      expect(pipe.transform(5, 10)).toBe(5);
      expect(pipe.transform(10, 5)).toBe(5);
      expect(pipe.transform(-5, 5)).toBe(-5);
      expect(pipe.transform(5, 5)).toBe(5);
    });
  });

  describe("MathMaxPipe", () => {
    let pipe: MathMaxPipe;

    beforeEach(() => {
      pipe = TestBed.inject(MathMaxPipe);
    });

    it("should return the maximum of two numbers", () => {
      expect(pipe.transform(5, 10)).toBe(10);
      expect(pipe.transform(10, 5)).toBe(10);
      expect(pipe.transform(-5, 5)).toBe(5);
      expect(pipe.transform(5, 5)).toBe(5);
    });
  });

  describe("MathAbsPipe", () => {
    let pipe: MathAbsPipe;

    beforeEach(() => {
      pipe = TestBed.inject(MathAbsPipe);
    });

    it("should return the absolute value of a number", () => {
      expect(pipe.transform(5)).toBe(5);
      expect(pipe.transform(-5)).toBe(5);
      expect(pipe.transform(0)).toBe(0);
    });
  });

  describe("GetMidpointPipe", () => {
    let pipe: GetMidpointPipe;

    beforeEach(() => {
      pipe = TestBed.inject(GetMidpointPipe);
    });

    it("should calculate the midpoint between two numbers", () => {
      expect(pipe.transform(0, 10)).toBe(5);
      expect(pipe.transform(-10, 10)).toBe(0);
      expect(pipe.transform(5, 5)).toBe(5);
    });
  });

  describe("GetCelestialDistancePipe", () => {
    let pipe: GetCelestialDistancePipe;

    beforeEach(() => {
      pipe = TestBed.inject(GetCelestialDistancePipe);
    });

    it("should return empty string if advancedSolutionMatrix is null", () => {
      const points = {
        startX: 100, startY: 100, 
        endX: 200, endY: 200,
        startRa: 10, startDec: 20,
        endRa: 11, endDec: 21,
        distance: "100px"
      };
      
      expect(pipe.transform(
        points, 
        'horizontal', 
        null, 
        jest.fn(), 
        jest.fn(), 
        jest.fn()
      )).toBe("");
    });

    it("should return empty string if advancedSolutionMatrix is missing properties", () => {
      const points = {
        startX: 100, startY: 100, 
        endX: 200, endY: 200,
        startRa: 10, startDec: 20,
        endRa: 11, endDec: 21,
        distance: "100px"
      };
      
      const invalidMatrix = {
        matrixRect: "rect",
        // missing properties
      };
      
      expect(pipe.transform(
        points, 
        'horizontal', 
        invalidMatrix, 
        jest.fn(), 
        jest.fn(), 
        jest.fn()
      )).toBe("");
    });

    it("should calculate horizontal celestial distance", () => {
      const points = {
        startX: 100, startY: 100, 
        endX: 200, endY: 100,
        startRa: 10, startDec: 20,
        endRa: 11, endDec: 20,
        distance: "100px"
      };
      
      const validMatrix = {
        matrixRect: "rect",
        matrixDelta: 0.1,
        raMatrix: "ra",
        decMatrix: "dec"
      };
      
      const calculateCoordinatesAtPointMock = jest.fn()
        .mockReturnValueOnce({ ra: 10, dec: 20 })
        .mockReturnValueOnce({ ra: 11, dec: 20 });
      
      const calculateAngularDistanceMock = jest.fn().mockReturnValue(1);
      const formatAstronomicalAngleMock = jest.fn().mockReturnValue("1°");
      
      const result = pipe.transform(
        points, 
        'horizontal', 
        validMatrix, 
        calculateCoordinatesAtPointMock, 
        calculateAngularDistanceMock, 
        formatAstronomicalAngleMock
      );
      
      expect(calculateCoordinatesAtPointMock).toHaveBeenCalledTimes(2);
      expect(calculateAngularDistanceMock).toHaveBeenCalledWith(10, 20, 11, 20);
      expect(formatAstronomicalAngleMock).toHaveBeenCalledWith(3600); // 1 degree = 3600 arcsec
      expect(result).toBe("1°");
    });

    it("should calculate vertical celestial distance", () => {
      const points = {
        startX: 100, startY: 100, 
        endX: 100, endY: 200,
        startRa: 10, startDec: 20,
        endRa: 10, endDec: 21,
        distance: "100px"
      };
      
      const validMatrix = {
        matrixRect: "rect",
        matrixDelta: 0.1,
        raMatrix: "ra",
        decMatrix: "dec"
      };
      
      const calculateCoordinatesAtPointMock = jest.fn()
        .mockReturnValueOnce({ ra: 10, dec: 20 })
        .mockReturnValueOnce({ ra: 10, dec: 21 });
      
      const calculateAngularDistanceMock = jest.fn().mockReturnValue(1);
      const formatAstronomicalAngleMock = jest.fn().mockReturnValue("1°");
      
      const result = pipe.transform(
        points, 
        'vertical', 
        validMatrix, 
        calculateCoordinatesAtPointMock, 
        calculateAngularDistanceMock, 
        formatAstronomicalAngleMock
      );
      
      expect(calculateCoordinatesAtPointMock).toHaveBeenCalledTimes(2);
      expect(calculateAngularDistanceMock).toHaveBeenCalledWith(10, 20, 10, 21);
      expect(formatAstronomicalAngleMock).toHaveBeenCalledWith(3600); // 1 degree = 3600 arcsec
      expect(result).toBe("1°");
    });
  });

  describe("CalculateLabelPositionPipe", () => {
    let pipe: CalculateLabelPositionPipe;

    beforeEach(() => {
      pipe = TestBed.inject(CalculateLabelPositionPipe);
    });

    it("should return default position if points are null", () => {
      expect(pipe.transform(null, { x: 100, y: 100, ra: 10, dec: 20 }, 'start')).toEqual({ x: 0, y: 0 });
      expect(pipe.transform({ x: 100, y: 100, ra: 10, dec: 20 }, null, 'end')).toEqual({ x: 0, y: 0 });
    });

    it("should calculate start label position", () => {
      const startPoint: MeasurementPoint = { x: 100, y: 100, ra: 10, dec: 20 };
      const endPoint: MeasurementPoint = { x: 200, y: 100, ra: 11, dec: 20 };
      
      // For horizontal line going right, start label should be to the left of start point
      const result = pipe.transform(startPoint, endPoint, 'start');
      
      // Should be positioned to the left of the start point
      expect(result.x).toBeLessThan(startPoint.x);
      // Should be around the same y position
      expect(Math.abs(result.y - startPoint.y)).toBeLessThan(10);
    });

    it("should calculate end label position", () => {
      const startPoint: MeasurementPoint = { x: 100, y: 100, ra: 10, dec: 20 };
      const endPoint: MeasurementPoint = { x: 200, y: 100, ra: 11, dec: 20 };
      
      // For horizontal line going right, end label should be to the right of end point
      const result = pipe.transform(startPoint, endPoint, 'end');
      
      // Should be positioned to the right of the end point
      expect(result.x).toBeGreaterThan(endPoint.x);
      // Should be around the same y position
      expect(Math.abs(result.y - endPoint.y)).toBeLessThan(10);
    });

    it("should adjust position for vertical lines", () => {
      const startPoint: MeasurementPoint = { x: 100, y: 100, ra: 10, dec: 20 };
      const endPoint: MeasurementPoint = { x: 100, y: 200, ra: 10, dec: 21 };
      
      // For vertical line going down
      const startResult = pipe.transform(startPoint, endPoint, 'start');
      const endResult = pipe.transform(startPoint, endPoint, 'end');
      
      // Should add horizontal offset to avoid overlap
      expect(Math.abs(startResult.x - startPoint.x)).toBeGreaterThan(10);
      expect(Math.abs(endResult.x - endPoint.x)).toBeGreaterThan(10);
      
      // Start should be above the start point
      expect(startResult.y).toBeLessThan(startPoint.y);
      // End should be below the end point
      expect(endResult.y).toBeGreaterThan(endPoint.y);
    });

    it("should position labels correctly for horizontal lines", () => {
      const startPoint: MeasurementPoint = { x: 100, y: 100, ra: 10, dec: 20 };
      // Create a perfectly horizontal line (no y difference)
      const endPoint: MeasurementPoint = { x: 300, y: 100, ra: 11, dec: 20 };
      
      // For horizontal line
      const startResult = pipe.transform(startPoint, endPoint, 'start');
      const endResult = pipe.transform(startPoint, endPoint, 'end');
      
      // For a horizontal line, the labels should be positioned to the left and right 
      // of their respective points, while vertical position might not change significantly
      // Check that start label is to the left of start point
      expect(startResult.x).toBeLessThan(startPoint.x);
      
      // Check that end label is to the right of end point
      expect(endResult.x).toBeGreaterThan(endPoint.x);
      
      // The horizontal offset should be significant
      expect(Math.abs(startResult.x - startPoint.x)).toBeGreaterThan(20);
      expect(Math.abs(endResult.x - endPoint.x)).toBeGreaterThan(20);
    });
  });
});