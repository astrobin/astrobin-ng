import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedItemMarketplaceListingComponent } from './feed-item-marketplace-listing.component';
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { FeedItemGenerator } from "@shared/generators/feed-item.generator";

describe('FeedItemMarketplaceListingComponent', () => {
  let component: FeedItemMarketplaceListingComponent;
  let fixture: ComponentFixture<FeedItemMarketplaceListingComponent>;

  beforeEach(async () => {
    await MockBuilder(FeedItemMarketplaceListingComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ])
    fixture = TestBed.createComponent(FeedItemMarketplaceListingComponent);
    component = fixture.componentInstance;
    component.feedItem = FeedItemGenerator.marketplaceListingItem();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
