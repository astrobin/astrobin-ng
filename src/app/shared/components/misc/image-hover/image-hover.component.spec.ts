import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ImageHoverComponent } from "./image-hover.component";
import { ImageGenerator } from "@shared/generators/image.generator";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";

describe("ImageHoverComponent", () => {
  let component: ImageHoverComponent;
  let fixture: ComponentFixture<ImageHoverComponent>;

  beforeEach(async () => {
    await MockBuilder(ImageHoverComponent, AppModule);
    fixture = TestBed.createComponent(ImageHoverComponent);
    component = fixture.componentInstance;
    component.image = ImageGenerator.image();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
