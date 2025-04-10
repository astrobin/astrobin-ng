import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { MarketplaceGenerator } from "@features/equipment/generators/marketplace.generator";
import { provideMockStore } from "@ngrx/store/testing";
import { UserGenerator } from "@shared/generators/user.generator";
import { MockBuilder } from "ng-mocks";

import { MarketplaceFeedbackWidgetComponent } from "./marketplace-feedback-widget.component";

describe("MarketplaceFeedbackWidgetComponent", () => {
  let component: MarketplaceFeedbackWidgetComponent;
  let fixture: ComponentFixture<MarketplaceFeedbackWidgetComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceFeedbackWidgetComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState }),
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            fragment: null
          }
        }
      }
    ]);

    fixture = TestBed.createComponent(MarketplaceFeedbackWidgetComponent);
    component = fixture.componentInstance;
    component.user = UserGenerator.user();
    component.listing = MarketplaceGenerator.listing();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
