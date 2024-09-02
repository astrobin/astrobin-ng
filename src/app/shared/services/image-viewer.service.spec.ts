import { TestBed } from '@angular/core/testing';

import { ImageViewerService } from './image-viewer.service';
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";
import { provideMockActions } from "@ngrx/effects/testing";
import { of } from "rxjs";

describe('ImageViewerService', () => {
  let service: ImageViewerService;

  beforeEach(async () => {
    await MockBuilder(ImageViewerService, AppModule).provide([
      provideMockStore({ initialState: initialMainState }),
      provideMockActions(() => of())
    ]);
    service = TestBed.inject(ImageViewerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
