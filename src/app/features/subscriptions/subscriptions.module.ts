import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { subscriptionRoutes } from "@features/subscriptions/subscriptions.routing";
import { SharedModule } from "@shared/shared.module";

import { PriceComponent } from "./components/price/price.component";
import { SubscriptionsBuyPageComponent } from "./pages/buy/subscriptions-buy-page.component";
import { SubscriptionsCancelledPageComponent } from "./pages/cancelled-page/subscriptions-cancelled-page.component";
import { SubscriptionsOptionsPageComponent } from "./pages/subscriptions-options-page/subscriptions-options-page.component";
import { SubscriptionsRouterPageComponent } from "./pages/subscriptions-router-page/subscriptions-router-page.component";
import { SubscriptionsViewPaymentsPageComponent } from "./pages/subscriptions-view-payments-page/subscriptions-view-payments-page.component";
import { SubscriptionsViewSubscriptionsPageComponent } from "./pages/subscriptions-view-subscriptions-page/subscriptions-view-subscriptions-page.component";
import { SubscriptionsSuccessPageComponent } from "./pages/success-page/subscriptions-success-page.component";

@NgModule({
  declarations: [
    SubscriptionsBuyPageComponent,
    SubscriptionsSuccessPageComponent,
    SubscriptionsCancelledPageComponent,
    SubscriptionsRouterPageComponent,
    SubscriptionsViewSubscriptionsPageComponent,
    SubscriptionsViewPaymentsPageComponent,
    SubscriptionsOptionsPageComponent,
    PriceComponent
  ],
  imports: [RouterModule.forChild(subscriptionRoutes), SharedModule]
})
export class SubscriptionsModule {}
