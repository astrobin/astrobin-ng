import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageHoverComponent } from './image-hover.component';

describe('ImageHoverComponent', () => {
  let component: ImageHoverComponent;
  let fixture: ComponentFixture<ImageHoverComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImageHoverComponent]
    });
    fixture = TestBed.createComponent(ImageHoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
