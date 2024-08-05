import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchMoonPhaseFilterComponent } from "./search-moon-phase-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

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
