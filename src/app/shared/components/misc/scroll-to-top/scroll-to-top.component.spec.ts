import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ScrollToTopComponent } from "./scroll-to-top.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

describe("ScrollToTopComponent", () => {
  let component: ScrollToTopComponent;
  let fixture: ComponentFixture<ScrollToTopComponent>;

  beforeEach(async () => {
    await MockBuilder(ScrollToTopComponent, AppModule).provide(provideMockStore({ initialState: initialMainState }));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScrollToTopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
