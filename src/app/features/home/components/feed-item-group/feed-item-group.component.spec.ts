import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { FeedItemDisplayTextComponent } from "@features/home/components/feed-item-display-text/feed-item-display-text.component";
import { provideMockStore } from "@ngrx/store/testing";
import { FeedItemGenerator } from "@shared/generators/feed-item.generator";
import { MockBuilder, MockService } from "ng-mocks";

import { FeedItemGroupComponent } from "./feed-item-group.component";

describe("FeedItemGroupComponent", () => {
  let component: FeedItemGroupComponent;
  let fixture: ComponentFixture<FeedItemGroupComponent>;
  let mockClassicRoutesService: ClassicRoutesService;

  beforeEach(async () => {
    // Create mock service with the GROUP function
    mockClassicRoutesService = MockService(ClassicRoutesService, {
      GROUP: (id: number) => `/groups/${id}/`
    });

    await MockBuilder(FeedItemGroupComponent, AppModule)
      .mock(FeedItemDisplayTextComponent, { export: true })
      .provide([
        provideMockStore({ initialState: initialMainState }),
        { provide: ClassicRoutesService, useValue: mockClassicRoutesService }
      ]);

    fixture = TestBed.createComponent(FeedItemGroupComponent);
    component = fixture.componentInstance;
    component.feedItem = FeedItemGenerator.groupItem();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
