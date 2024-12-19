import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedItemRevisionComponent } from './feed-item-revision.component';
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { FeedItemGenerator } from "@shared/generators/feed-item.generator";

describe('FeedItemRevisionComponent', () => {
  let component: FeedItemRevisionComponent;
  let fixture: ComponentFixture<FeedItemRevisionComponent>;

  beforeEach(async () => {
    await MockBuilder(FeedItemRevisionComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ])
    fixture = TestBed.createComponent(FeedItemRevisionComponent);
    component = fixture.componentInstance;
    component.feedItem = FeedItemGenerator.revisionItem();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
