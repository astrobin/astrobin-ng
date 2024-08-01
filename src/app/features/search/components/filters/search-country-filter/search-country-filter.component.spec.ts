import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchCountryFilterComponent } from "./search-country-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

describe("CountryFilterComponent", () => {
  let component: SearchCountryFilterComponent;
  let fixture: ComponentFixture<SearchCountryFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchCountryFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchCountryFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
