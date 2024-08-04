import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchDatePublishedFilterComponent } from "./search-date-published-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

describe("DatePublishedSizeFilterComponent", () => {
  let component: SearchDatePublishedFilterComponent;
  let fixture: ComponentFixture<SearchDatePublishedFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchDatePublishedFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchDatePublishedFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
