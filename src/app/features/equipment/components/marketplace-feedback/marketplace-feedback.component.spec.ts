import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { MockBuilder } from "ng-mocks";

import { MarketplaceFeedbackComponent } from "./marketplace-feedback.component";

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
