import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceFeedbackWidgetComponent } from "./marketplace-feedback-widget.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { initialState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { UserGenerator } from "@shared/generators/user.generator";
import { MarketplaceGenerator } from "@features/equipment/generators/marketplace.generator";
import { ActivatedRoute } from "@angular/router";

describe("MarketplaceFeedbackWidgetComponent", () => {
  let component: MarketplaceFeedbackWidgetComponent;
  let fixture: ComponentFixture<MarketplaceFeedbackWidgetComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceFeedbackWidgetComponent, AppModule).provide([
      provideMockStore({ initialState }),
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
