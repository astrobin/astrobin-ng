import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { AppState } from "@app/store/app.states";
import { AppGenerator } from "@app/store/generators/app.generator";
import { AuthGenerator } from "@features/account/store/auth.generator";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { MockBuilder } from "ng-mocks";
import { ImageService } from "./image.service";

describe("ImageService", () => {
  let service: ImageService;
  let store: MockStore;
  const initialState: AppState = {
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

  describe("getPlaceholder", () => {
    it("should get the right URL", () => {
      expect(service.getPlaceholder({ width: 200, height: 100 })).toEqual(
        "https://via.placeholder.com/200x100/222/e0e0e0?text=Loading..."
      );
    });
  });

  describe("getSize", () => {
    it("should return the same size if both width and height are defined in the alias", done => {
      service.getSize$({ width: 1000, height: 1000 }, ImageAlias.GALLERY).subscribe(size => {
        expect(size).toEqual({ width: 130, height: 130 });
        done();
      });
    });

    it("should return the correct size if only the width is defined in the alias", done => {
      service.getSize$({ width: 1000, height: 1000 }, ImageAlias.REGULAR).subscribe(size => {
        expect(size).toEqual({ width: 620, height: 384 });
        done();
      });
    });
  });
});
