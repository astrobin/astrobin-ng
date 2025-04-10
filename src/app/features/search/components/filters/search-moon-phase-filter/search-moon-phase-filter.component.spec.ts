import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { SearchMoonPhaseFilterComponent } from "./search-moon-phase-filter.component";

describe("IntegrationTimeSizeFilterComponent", () => {
  let component: SearchMoonPhaseFilterComponent;
  let fixture: ComponentFixture<SearchMoonPhaseFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchMoonPhaseFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchMoonPhaseFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
