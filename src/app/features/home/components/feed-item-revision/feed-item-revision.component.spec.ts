import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedItemRevisionComponent } from './feed-item-revision.component';
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";

describe('FeedItemRevisionComponent', () => {
  let component: FeedItemRevisionComponent;
  let fixture: ComponentFixture<FeedItemRevisionComponent>;

  beforeEach(async () => {
    await MockBuilder(FeedItemRevisionComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ])
    fixture = TestBed.createComponent(FeedItemRevisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
