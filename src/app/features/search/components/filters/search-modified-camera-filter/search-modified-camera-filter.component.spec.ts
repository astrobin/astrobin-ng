import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { SearchModifiedCameraFilterComponent } from "./search-modified-camera-filter.component";

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
