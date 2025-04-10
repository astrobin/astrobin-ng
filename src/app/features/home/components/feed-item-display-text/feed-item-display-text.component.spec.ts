import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";

import { FeedItemDisplayTextComponent } from "./feed-item-display-text.component";

describe("FeedItemDisplayTextComponent", () => {
  let component: FeedItemDisplayTextComponent;
  let fixture: ComponentFixture<FeedItemDisplayTextComponent>;

  beforeEach(async () => {
    await MockBuilder(FeedItemDisplayTextComponent, AppModule);
    fixture = TestBed.createComponent(FeedItemDisplayTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
