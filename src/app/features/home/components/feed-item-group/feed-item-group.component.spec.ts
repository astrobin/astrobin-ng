import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeedItemGroupComponent } from './feed-item-group.component';
import { MockBuilder, MockService } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { FeedItemGenerator } from "@shared/generators/feed-item.generator";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";

describe('FeedItemGroupComponent', () => {
  let component: FeedItemGroupComponent;
  let fixture: ComponentFixture<FeedItemGroupComponent>;
  let mockClassicRoutesService: ClassicRoutesService;

  beforeEach(async () => {
    // Create mock service with the GROUP function
    mockClassicRoutesService = MockService(ClassicRoutesService, {
      GROUP: (id: number) => `/groups/${id}/`
    });

    await MockBuilder(FeedItemGroupComponent, AppModule)
      .provide([
        provideMockStore({ initialState: initialMainState }),
        { provide: ClassicRoutesService, useValue: mockClassicRoutesService }
      ]);

    fixture = TestBed.createComponent(FeedItemGroupComponent);
    component = fixture.componentInstance;
    component.feedItem = FeedItemGenerator.groupItem();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
