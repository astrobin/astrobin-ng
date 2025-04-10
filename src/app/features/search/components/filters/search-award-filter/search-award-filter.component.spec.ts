import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { SearchAwardFilterComponent } from "./search-award-filter.component";

describe("AwardFilterComponent", () => {
  let component: SearchAwardFilterComponent;
  let fixture: ComponentFixture<SearchAwardFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchAwardFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchAwardFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
