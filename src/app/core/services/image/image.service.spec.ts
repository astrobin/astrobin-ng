import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { StateGenerator } from "@app/store/generators/state.generator";
import type { MainState } from "@app/store/state";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { ImageService } from "./image.service";

describe("ImageService", () => {
  let service: ImageService;
  let store: MockStore;
  const initialState: MainState = StateGenerator.default();

  beforeEach(async () => {
    await MockBuilder(ImageService, AppModule)
      .provide(provideMockStore({ initialState }))
      .replace(HttpClientModule, HttpClientTestingModule);

    store = TestBed.inject(MockStore);
    service = TestBed.inject(ImageService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("formatIntegration", () => {
    describe("HTML mode (default)", () => {
      it("should format seconds only", () => {
        expect(service.formatIntegration(30)).toBe(`30<span class='symbol'>&Prime;</span>`);
        expect(service.formatIntegration(1)).toBe(`1<span class='symbol'>&Prime;</span>`);
        expect(service.formatIntegration(5.5)).toBe(`5.5<span class='symbol'>&Prime;</span>`);
      });

      it("should format minutes and seconds", () => {
        expect(service.formatIntegration(90)).toBe(
          `1<span class='symbol'>&prime;</span> 30<span class='symbol'>&Prime;</span>`
        );
        expect(service.formatIntegration(65)).toBe(
          `1<span class='symbol'>&prime;</span> 5<span class='symbol'>&Prime;</span>`
        );
        expect(service.formatIntegration(120)).toBe(`2<span class='symbol'>&prime;</span>`);
      });

      it("should format hours, minutes, and seconds", () => {
        expect(service.formatIntegration(3661)).toBe(
          `1<span class='symbol'>h</span> 1<span class='symbol'>&prime;</span> 1<span class='symbol'>&Prime;</span>`
        );
        expect(service.formatIntegration(3600)).toBe(`1<span class='symbol'>h</span>`);
        expect(service.formatIntegration(7200)).toBe(`2<span class='symbol'>h</span>`);
      });

      it("should format hours and seconds (no minutes)", () => {
        expect(service.formatIntegration(3630)).toBe(
          `1<span class='symbol'>h</span> 30<span class='symbol'>&Prime;</span>`
        );
      });

      it("should format hours and minutes (no seconds)", () => {
        expect(service.formatIntegration(3720)).toBe(
          `1<span class='symbol'>h</span> 2<span class='symbol'>&prime;</span>`
        );
      });

      it("should handle zero integration time", () => {
        expect(service.formatIntegration(0)).toBe(`0<span class='symbol'>&Prime;</span>`);
      });

      it("should remove trailing zeros in seconds", () => {
        expect(service.formatIntegration(3661.0)).toBe(
          `1<span class='symbol'>h</span> 1<span class='symbol'>&prime;</span> 1<span class='symbol'>&Prime;</span>`
        );
      });

      it("should keep decimal points in seconds when needed", () => {
        expect(service.formatIntegration(3661.25)).toBe(
          `1<span class='symbol'>h</span> 1<span class='symbol'>&prime;</span> 1.25<span class='symbol'>&Prime;</span>`
        );
      });
    });

    describe("Plain text mode", () => {
      it("should format seconds only", () => {
        expect(service.formatIntegration(30, false)).toBe("30s");
        expect(service.formatIntegration(1, false)).toBe("1s");
        expect(service.formatIntegration(5.5, false)).toBe("5.5s");
      });

      it("should format minutes and seconds", () => {
        expect(service.formatIntegration(90, false)).toBe("1m 30s");
        expect(service.formatIntegration(65, false)).toBe("1m 5s");
        expect(service.formatIntegration(120, false)).toBe("2m");
      });

      it("should format hours, minutes, and seconds", () => {
        expect(service.formatIntegration(3661, false)).toBe("1h 1m 1s");
        expect(service.formatIntegration(3600, false)).toBe("1h");
        expect(service.formatIntegration(7200, false)).toBe("2h");
      });

      it("should format hours and seconds (no minutes)", () => {
        expect(service.formatIntegration(3630, false)).toBe("1h 30s");
      });

      it("should format hours and minutes (no seconds)", () => {
        expect(service.formatIntegration(3720, false)).toBe("1h 2m");
      });

      it("should handle zero integration time", () => {
        expect(service.formatIntegration(0, false)).toBe("0s");
      });

      it("should remove trailing zeros in seconds", () => {
        expect(service.formatIntegration(3661.0, false)).toBe("1h 1m 1s");
      });

      it("should keep decimal points in seconds when needed", () => {
        expect(service.formatIntegration(3661.25, false)).toBe("1h 1m 1.25s");
      });
    });

    describe("Edge cases", () => {
      it("should handle very large values", () => {
        // 100 hours
        expect(service.formatIntegration(360000, false)).toBe("100h");
        expect(service.formatIntegration(360000)).toBe(`100<span class='symbol'>h</span>`);
      });

      it("should handle fractional seconds", () => {
        expect(service.formatIntegration(0.5, false)).toBe("0.5s");
        expect(service.formatIntegration(0.5)).toBe(`0.5<span class='symbol'>&Prime;</span>`);
      });

      it("should handle negative values", () => {
        // Negative values aren't technically valid for integration time, but testing for robustness
        expect(service.formatIntegration(-30, false)).toBe("-30s");
        expect(service.formatIntegration(-30)).toBe(`-30<span class='symbol'>&Prime;</span>`);
      });

      it("should handle NaN and return '0s'", () => {
        expect(service.formatIntegration(NaN, false)).toBe("0s");
        expect(service.formatIntegration(NaN)).toBe(`0<span class='symbol'>&Prime;</span>`);
      });
    });

    describe("Boundary cases", () => {
      it("should handle exactly 60 seconds", () => {
        expect(service.formatIntegration(60, false)).toBe("1m");
        expect(service.formatIntegration(60)).toBe(`1<span class='symbol'>&prime;</span>`);
      });

      it("should handle exactly 60 minutes", () => {
        expect(service.formatIntegration(3600, false)).toBe("1h");
        expect(service.formatIntegration(3600)).toBe(`1<span class='symbol'>h</span>`);
      });

      it("should handle exactly 59 minutes and 59 seconds", () => {
        expect(service.formatIntegration(3599, false)).toBe("59m 59s");
        expect(service.formatIntegration(3599)).toBe(
          `59<span class='symbol'>&prime;</span> 59<span class='symbol'>&Prime;</span>`
        );
      });
    });
  });
});
