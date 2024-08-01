import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchModifiedCameraFilterComponent } from "./search-modified-camera-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

describe("ModifiedCameraFilterComponent", () => {
  let component: SearchModifiedCameraFilterComponent;
  let fixture: ComponentFixture<SearchModifiedCameraFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchModifiedCameraFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchModifiedCameraFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
