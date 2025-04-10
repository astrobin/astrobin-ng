import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FeedItemGroupComponent } from "@features/home/components/feed-item-group/feed-item-group.component";
import { FeedItemMarketplaceListingComponent } from "@features/home/components/feed-item-marketplace-listing/feed-item-marketplace-listing.component";
import { FeedItemRevisionComponent } from "@features/home/components/feed-item-revision/feed-item-revision.component";
import { SharedModule } from "@shared/shared.module";

import { FeedComponent } from "./components/feed/feed.component";
import { FeedItemComponent } from "./components/feed-item/feed-item.component";
import { FeedItemDisplayTextComponent } from "./components/feed-item-display-text/feed-item-display-text.component";
import { FeedItemImageComponent } from "./components/feed-item-image/feed-item-image.component";
import { IotdComponent } from "./components/iotd/iotd.component";
import { HomeRoutingModule } from "./home-routing.module";
import { HomeComponent } from "./pages/home/home.component";

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
  imports: [CommonModule, HomeRoutingModule, SharedModule]
})
export class HomeModule {}
