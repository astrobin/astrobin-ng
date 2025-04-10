import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { SearchTelescopeWeightFilterComponent } from "./search-telescope-weight-filter.component";

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
