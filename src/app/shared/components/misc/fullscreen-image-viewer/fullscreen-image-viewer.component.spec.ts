import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ComponentsModule } from "@shared/components/components.module";
import { MockBuilder } from "ng-mocks";
import { FullscreenImageViewerComponent } from "./fullscreen-image-viewer.component";

describe("FullscreenImageViewerComponent", () => {
  let component: FullscreenImageViewerComponent;
  let fixture: ComponentFixture<FullscreenImageViewerComponent>;

  beforeEach(async () => {
    await MockBuilder(FullscreenImageViewerComponent, ComponentsModule);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FullscreenImageViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
