import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { SearchAcquisitionTypeFilterComponent } from "./search-acquisition-type-filter.component";

describe("AcquisitionTypeFilterComponent", () => {
  let component: SearchAcquisitionTypeFilterComponent;
  let fixture: ComponentFixture<SearchAcquisitionTypeFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchAcquisitionTypeFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchAcquisitionTypeFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
