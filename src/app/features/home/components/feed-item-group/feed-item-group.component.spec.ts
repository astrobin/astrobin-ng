import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedItemGroupComponent } from './feed-item-group.component';
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";

describe('FeedItemGroupComponent', () => {
  let component: FeedItemGroupComponent;
  let fixture: ComponentFixture<FeedItemGroupComponent>;

  beforeEach(async () => {
    await MockBuilder(FeedItemGroupComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ])
    fixture = TestBed.createComponent(FeedItemGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
