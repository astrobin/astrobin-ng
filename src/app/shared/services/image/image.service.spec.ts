import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { AppGenerator } from "@app/store/generators/app.generator";
import { State } from "@app/store/state";
import { AuthGenerator } from "@features/account/store/auth.generator";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";
import { ImageService } from "./image.service";

describe("ImageService", () => {
  let service: ImageService;
  let store: MockStore;
  const initialState: State = {
    app: AppGenerator.default(),
    auth: AuthGenerator.default()
  };

  beforeEach(async () => {
    await MockBuilder(ImageService, AppModule).provide(provideMockStore({ initialState }));

    store = TestBed.inject(MockStore);
    service = TestBed.inject(ImageService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("calculateDisplayHeight", () => {
    describe("when the alias specifies a height", () => {
      it("should work when element width == image width", () => {
        expect(service.calculateDisplayHeight([100, 100], [100, 100], [100, 100])).toBe(100);
        expect(service.calculateDisplayHeight([100, 200], [100, 200], [100, 100])).toBe(200);
      });

      it("should work when element width > image width", () => {
        expect(service.calculateDisplayHeight([200, 100], [200, 100], [300, 100])).toBe(100);
      });

      it("should work when element width < image width", () => {
        expect(service.calculateDisplayHeight([200, 100], [200, 100], [100, 100])).toBe(50);
      });
    });

    describe("when the alias does not specify a height", () => {
      it("should work when element width == image width", () => {
        expect(service.calculateDisplayHeight([200, 0], [200, 200], [200, 100])).toBe(100);
        expect(service.calculateDisplayHeight([200, 0], [200, 400], [200, 100])).toBe(100);
      });

      it("should work when element width > image width", () => {
        expect(service.calculateDisplayHeight([200, 0], [200, 100], [300, 100])).toBe(100);
      });

      it("should work when element width < image width", () => {
        expect(service.calculateDisplayHeight([200, 0], [200, 100], [100, 100])).toBe(50);
      });
    });
  });
});
