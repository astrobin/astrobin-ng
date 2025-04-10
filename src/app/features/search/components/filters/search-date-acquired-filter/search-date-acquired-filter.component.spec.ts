import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { SearchDateAcquiredFilterComponent } from "./search-date-acquired-filter.component";

describe("DateAcquiredSizeFilterComponent", () => {
  let component: SearchDateAcquiredFilterComponent;
  let fixture: ComponentFixture<SearchDateAcquiredFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchDateAcquiredFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchDateAcquiredFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
