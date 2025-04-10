import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { SearchSoftwareFilterComponent } from "./search-software-filter.component";

describe("SearchSoftwareFilterComponent", () => {
  let component: SearchSoftwareFilterComponent;
  let fixture: ComponentFixture<SearchSoftwareFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchSoftwareFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchSoftwareFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
