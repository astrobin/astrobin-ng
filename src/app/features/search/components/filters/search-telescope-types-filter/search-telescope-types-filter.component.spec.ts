import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { SearchTelescopeTypesFilterComponent } from "./search-telescope-types-filter.component";

describe("TelescopeTypesFilterComponent", () => {
  let component: SearchTelescopeTypesFilterComponent;
  let fixture: ComponentFixture<SearchTelescopeTypesFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchTelescopeTypesFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchTelescopeTypesFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
