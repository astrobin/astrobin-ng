import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialMainState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { ImageGenerator } from "@shared/generators/image.generator";
import { MockBuilder } from "ng-mocks";

import { ImageIconsComponent } from "./image-icons.component";

describe("ImageBadgesComponent", () => {
  let component: ImageIconsComponent;
  let fixture: ComponentFixture<ImageIconsComponent>;

  beforeEach(async () => {
    await MockBuilder(ImageIconsComponent, AppModule).provide([provideMockStore({ initialState: initialMainState })]);
    fixture = TestBed.createComponent(ImageIconsComponent);
    component = fixture.componentInstance;
    component.image = ImageGenerator.image();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
