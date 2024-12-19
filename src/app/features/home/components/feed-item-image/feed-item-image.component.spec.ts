import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedItemImageComponent } from './feed-item-image.component';
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { FeedItemGenerator } from "@shared/generators/feed-item.generator";

describe('FeedItemImageComponent', () => {
  let component: FeedItemImageComponent;
  let fixture: ComponentFixture<FeedItemImageComponent>;

  beforeEach(async () => {
    await MockBuilder(FeedItemImageComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ])
    fixture = TestBed.createComponent(FeedItemImageComponent);
    component = fixture.componentInstance;
    component.feedItem = FeedItemGenerator.imageItem();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
