import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageIconsComponent } from './image-icons.component';
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { provideMockStore } from "@ngrx/store/testing";
import { initialMainState } from "@app/store/state";
import { ImageGenerator } from "@shared/generators/image.generator";

describe('ImageBadgesComponent', () => {
  let component: ImageIconsComponent;
  let fixture: ComponentFixture<ImageIconsComponent>;

  beforeEach(async() => {
    await MockBuilder(ImageIconsComponent, AppModule).provide([
      provideMockStore({ initialState: initialMainState })
    ]);
    fixture = TestBed.createComponent(ImageIconsComponent);
    component = fixture.componentInstance;
    component.image = ImageGenerator.image();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
