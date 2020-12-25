import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AppModule } from "@app/app.module";
import { initialState } from "@app/store/state";
import { provideMockStore } from "@ngrx/store/testing";
import { ComponentsModule } from "@shared/components/components.module";
import { ImageGenerator } from "@shared/generators/image.generator";
import { MockBuilder } from "ng-mocks";
import { FullscreenImageViewerComponent } from "./fullscreen-image-viewer.component";

describe("FullscreenImageViewerComponent", () => {
  let component: FullscreenImageViewerComponent;
  let fixture: ComponentFixture<FullscreenImageViewerComponent>;

  beforeEach(async () => {
    await MockBuilder(FullscreenImageViewerComponent, AppModule).provide(provideMockStore({ initialState }));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FullscreenImageViewerComponent);
    component = fixture.componentInstance;
    component.image = ImageGenerator.image();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
