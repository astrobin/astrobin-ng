import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchCameraTypeFilterComponent } from "./search-camera-type-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

describe("CameraTypeFilterComponent", () => {
  let component: SearchCameraTypeFilterComponent;
  let fixture: ComponentFixture<SearchCameraTypeFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchCameraTypeFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchCameraTypeFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
