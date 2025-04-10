import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { SearchSizeFilterComponent } from "./search-size-filter.component";

describe("SizeFilterComponent", () => {
  let component: SearchSizeFilterComponent;
  let fixture: ComponentFixture<SearchSizeFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchSizeFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchSizeFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
