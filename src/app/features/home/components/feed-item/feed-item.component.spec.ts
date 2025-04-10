import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { FeedItemComponent } from "./feed-item.component";

describe("FeedItemComponent", () => {
  let component: FeedItemComponent;
  let fixture: ComponentFixture<FeedItemComponent>;

  beforeEach(async () => {
    await MockBuilder(FeedItemComponent, AppModule).provide([provideMockStore({ initialState: initialMainState })]);
    fixture = TestBed.createComponent(FeedItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
