import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { SearchMinimumDataFilterComponent } from "./search-minimum-data-filter.component";

describe("MinimumDataFilterComponent", () => {
  let component: SearchMinimumDataFilterComponent;
  let fixture: ComponentFixture<SearchMinimumDataFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchMinimumDataFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchMinimumDataFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
