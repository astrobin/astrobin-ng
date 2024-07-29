import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchTelescopeTypeFilterComponent } from "./search-telescope-type-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

describe("TelescopeTypeFilterComponent", () => {
  let component: SearchTelescopeTypeFilterComponent;
  let fixture: ComponentFixture<SearchTelescopeTypeFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchTelescopeTypeFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchTelescopeTypeFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
