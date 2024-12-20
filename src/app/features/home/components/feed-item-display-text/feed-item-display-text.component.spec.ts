import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FeedItemDisplayTextComponent } from "./feed-item-display-text.component";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";

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
