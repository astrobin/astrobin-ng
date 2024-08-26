import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchTextFilterComponent } from "./search-text-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

describe("TextFilterComponent", () => {
  let component: SearchTextFilterComponent;
  let fixture: ComponentFixture<SearchTextFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchTextFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchTextFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
