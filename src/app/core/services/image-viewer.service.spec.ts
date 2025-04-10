import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockActions } from "@ngrx/effects/testing";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";
import { EMPTY, of } from "rxjs";

import { ImageViewerService } from "./image-viewer.service";

describe("ImageViewerService", () => {
  let service: ImageViewerService;

  beforeEach(async () => {
    await MockBuilder(ImageViewerService, AppModule).provide([
      provideMockStore({ initialState: initialMainState }),
      provideMockActions(() => of()),
      {
        provide: Router,
        useValue: {
          events: EMPTY
        }
      }
    ]);
    service = TestBed.inject(ImageViewerService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
