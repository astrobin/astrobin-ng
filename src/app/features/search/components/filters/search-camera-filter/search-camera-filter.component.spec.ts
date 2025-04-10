import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { SearchCameraFilterComponent } from "./search-camera-filter.component";

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
