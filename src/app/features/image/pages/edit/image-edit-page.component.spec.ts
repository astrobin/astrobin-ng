import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ActivatedRoute } from "@angular/router";
import { AppModule } from "@app/app.module";
import { ImageGenerator } from "@shared/generators/image.generator";
import { MockBuilder } from "ng-mocks";
import { ImageEditPageComponent } from "./image-edit-page.component";

describe("EditComponent", () => {
  let component: ImageEditPageComponent;
  let fixture: ComponentFixture<ImageEditPageComponent>;

  beforeEach(async () => {
    await MockBuilder(ImageEditPageComponent, AppModule).provide([
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            data: {
              image: ImageGenerator.image()
            }
          }
        }
      }
    ]);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageEditPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
