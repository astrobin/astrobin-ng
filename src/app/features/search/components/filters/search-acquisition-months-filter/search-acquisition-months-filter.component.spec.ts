import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { SearchAcquisitionMonthsFilterComponent } from "./search-acquisition-months-filter.component";

describe("AcquisitionMonthsFilterComponent", () => {
  let component: SearchAcquisitionMonthsFilterComponent;
  let fixture: ComponentFixture<SearchAcquisitionMonthsFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchAcquisitionMonthsFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchAcquisitionMonthsFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
