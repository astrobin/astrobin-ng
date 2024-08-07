import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchDateAcquiredFilterComponent } from "./search-date-acquired-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

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
