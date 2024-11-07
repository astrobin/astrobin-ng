import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SearchAnimatedFilterComponent } from "./search-animated-filter.component";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

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
