import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchCameraTypesFilterComponent } from "./search-camera-types-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

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
