import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { SearchTelescopeFilterComponent } from "./search-telescope-filter.component";

describe("SearchTelescopeFilterComponent", () => {
  let component: SearchTelescopeFilterComponent;
  let fixture: ComponentFixture<SearchTelescopeFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchTelescopeFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchTelescopeFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
