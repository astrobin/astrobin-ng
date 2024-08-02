import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchTelescopeWeightFilterComponent } from "./search-telescope-weight-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

describe("TelescopeWeightFilterComponent", () => {
  let component: SearchTelescopeWeightFilterComponent;
  let fixture: ComponentFixture<SearchTelescopeWeightFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchTelescopeWeightFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchTelescopeWeightFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
