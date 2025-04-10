import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { SearchAnimatedFilterComponent } from "./search-animated-filter.component";

describe("AnimatedFilterComponent", () => {
  let component: SearchAnimatedFilterComponent;
  let fixture: ComponentFixture<SearchAnimatedFilterComponent>;

  beforeEach(async () => {
    await MockBuilder(SearchAnimatedFilterComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(SearchAnimatedFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
