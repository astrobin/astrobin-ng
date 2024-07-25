import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchTelescopeFilterComponent } from "./search-telescope-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

describe("TelescopeFilterComponent", () => {
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
