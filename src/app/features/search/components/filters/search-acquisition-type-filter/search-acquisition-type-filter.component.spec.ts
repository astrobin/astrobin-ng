import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchAcquisitionTypeFilterComponent } from "./search-acquisition-type-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

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
