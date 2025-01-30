import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { MainState } from "@app/store/state";
import { MockStore, provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";
import { ImageService } from "./image.service";
import { StateGenerator } from "@app/store/generators/state.generator";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { HttpClientModule } from "@angular/common/http";

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
});
