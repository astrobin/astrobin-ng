import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchCameraPixelSizeFilterComponent } from "./search-camera-pixel-size-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

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
