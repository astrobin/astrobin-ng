import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageHoverComponent } from './image-hover.component';
import { ImageGenerator } from "@shared/generators/image.generator";

describe('ImageHoverComponent', () => {
  let component: ImageHoverComponent;
  let fixture: ComponentFixture<ImageHoverComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImageHoverComponent]
    });
    fixture = TestBed.createComponent(ImageHoverComponent);
    component = fixture.componentInstance;
    component.image = ImageGenerator.image();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
