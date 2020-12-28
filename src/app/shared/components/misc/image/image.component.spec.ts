import { ComponentFixture, TestBed } from "@angular/core/testing";

import { initialState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { ComponentsModule } from "@shared/components/components.module";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { ImageGenerator } from "@shared/generators/image.generator";
import { MockBuilder } from "ng-mocks";
import { ImageComponent } from "./image.component";

describe("ImageComponent", () => {
  let component: ImageComponent;
  let fixture: ComponentFixture<ImageComponent>;

  beforeEach(async () => {
    await MockBuilder(ImageComponent, ComponentsModule).provide(provideMockStore({ initialState }));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ImageComponent);
    component = fixture.componentInstance;

    const image = ImageGenerator.image();
    component.id = image.pk;
    component.alias = ImageAlias.GALLERY;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
