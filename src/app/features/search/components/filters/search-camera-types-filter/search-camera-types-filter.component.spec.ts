import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { SearchCameraTypesFilterComponent } from "./search-camera-types-filter.component";

describe("CameraTypesFilterComponent", () => {
  let component: SearchCameraTypesFilterComponent;
  let fixture: ComponentFixture<SearchCameraTypesFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchCameraTypesFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchCameraTypesFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
