import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './pages/home/home.component';
import { FeedComponent } from './components/feed/feed.component';
import { SharedModule } from "@shared/shared.module";
import { FeedItemComponent } from './components/feed-item/feed-item.component';
import { FeedItemImageComponent } from './components/feed-item-image/feed-item-image.component';
import { FeedItemRevisionComponent } from "@features/home/components/feed-item-revision/feed-item-revision.component";
import { FeedItemDisplayTextComponent } from './components/feed-item-display-text/feed-item-display-text.component';
import { SearchModule } from "@features/search/search.module";
import { FeedItemMarketplaceListingComponent } from "@features/home/components/feed-item-marketplace-listing/feed-item-marketplace-listing.component";
import { FeedItemGroupComponent } from "@features/home/components/feed-item-group/feed-item-group.component";
import { IotdComponent } from './components/iotd/iotd.component';


@NgModule({
  declarations: [
    HomeComponent,
    FeedComponent,
    FeedItemComponent,
    FeedItemImageComponent,
    FeedItemRevisionComponent,
    FeedItemDisplayTextComponent,
    FeedItemMarketplaceListingComponent,
    FeedItemGroupComponent,
    IotdComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedModule,
    SearchModule
  ]
})
export class HomeModule { }
