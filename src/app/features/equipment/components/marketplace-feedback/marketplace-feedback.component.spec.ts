import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MarketplaceFeedbackComponent } from "./marketplace-feedback.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";

describe("MarketplaceFeedbackComponent", () => {
  let component: MarketplaceFeedbackComponent;
  let fixture: ComponentFixture<MarketplaceFeedbackComponent>;

  beforeEach(async () => {
    await MockBuilder(MarketplaceFeedbackComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);

    fixture = TestBed.createComponent(MarketplaceFeedbackComponent);
    component = fixture.componentInstance;
    component.feedback = { hash: "123" } as any;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
