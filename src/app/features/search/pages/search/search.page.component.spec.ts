import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchPageComponent } from "./search.page.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

describe("SearchPageComponent", () => {
  let component: SearchPageComponent;
  let fixture: ComponentFixture<SearchPageComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchPageComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);
    fixture = TestBed.createComponent(SearchPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
