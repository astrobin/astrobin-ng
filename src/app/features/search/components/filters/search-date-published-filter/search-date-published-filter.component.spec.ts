import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { SearchDatePublishedFilterComponent } from "./search-date-published-filter.component";

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
