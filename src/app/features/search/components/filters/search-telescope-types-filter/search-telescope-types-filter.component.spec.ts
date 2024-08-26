import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchTelescopeTypesFilterComponent } from "./search-telescope-types-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

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
