import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { FeedItemDisplayTextComponent } from "@features/home/components/feed-item-display-text/feed-item-display-text.component";
import { provideMockStore } from "@ngrx/store/testing";
import { FeedItemGenerator } from "@shared/generators/feed-item.generator";
import { MockBuilder } from "ng-mocks";

import { FeedItemImageComponent } from "./feed-item-image.component";

describe("FeedItemImageComponent", () => {
  let component: FeedItemImageComponent;
  let fixture: ComponentFixture<FeedItemImageComponent>;

  beforeEach(async () => {
    await MockBuilder(FeedItemImageComponent, AppModule)
      .mock(FeedItemDisplayTextComponent, { export: true })
      .provide([provideMockStore({ initialState: initialMainState })]);
    fixture = TestBed.createComponent(FeedItemImageComponent);
    component = fixture.componentInstance;
    component.feedItem = FeedItemGenerator.imageItem();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
