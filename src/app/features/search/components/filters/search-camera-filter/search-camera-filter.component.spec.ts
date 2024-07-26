import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchCameraFilterComponent } from "./search-camera-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

describe("SearchCameraFilterComponent", () => {
  let component: SearchCameraFilterComponent;
  let fixture: ComponentFixture<SearchCameraFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchCameraFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchCameraFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
