import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { SearchCameraPixelSizeFilterComponent } from "./search-camera-pixel-size-filter.component";

describe("CameraPixelSizeFilterComponent", () => {
  let component: SearchCameraPixelSizeFilterComponent;
  let fixture: ComponentFixture<SearchCameraPixelSizeFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchCameraPixelSizeFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchCameraPixelSizeFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
