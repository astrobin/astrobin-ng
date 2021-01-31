import { ComponentFixture, TestBed } from "@angular/core/testing";

import { RedirectionModule } from "@features/redirection/redirection.module";
import { MockBuilder } from "ng-mocks";
import { RedirectionPageComponent } from "./redirection-page.component";

describe("RedirectionPageComponent", () => {
  let component: RedirectionPageComponent;
  let fixture: ComponentFixture<RedirectionPageComponent>;

  beforeEach(async () => {
    await MockBuilder(RedirectionPageComponent, RedirectionModule);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RedirectionPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
