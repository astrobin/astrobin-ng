import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedComponent } from './feed.component';
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";
import { Router } from "@angular/router";
import { EMPTY, of } from "rxjs";
import { FeedItemGenerator } from "@shared/generators/feed-item.generator";
import { UtilsService } from "@core/services/utils/utils.service";

describe('FeedComponent', () => {
  let component: FeedComponent;
  let fixture: ComponentFixture<FeedComponent>;

  beforeEach(async () => {
    await MockBuilder(FeedComponent, AppModule).provide([
      UtilsService,
      provideMockStore({ initialState: initialMainState }),
      {
        provide: Router,
        useValue: {
          events: EMPTY
        }
      }
    ]);
    fixture = TestBed.createComponent(FeedComponent);
    component = fixture.componentInstance;

    jest.spyOn(component.feedApiService, "getFeed").mockReturnValueOnce(of({
      count: 1,
      next: null,
      prev: null,
      results: [
        FeedItemGenerator.imageItem()
      ]
    }));

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
