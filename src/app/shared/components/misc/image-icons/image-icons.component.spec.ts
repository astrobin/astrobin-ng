import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageIconsComponent } from './image-icons.component';
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";

describe('ImageBadgesComponent', () => {
  let component: ImageIconsComponent;
  let fixture: ComponentFixture<ImageIconsComponent>;

  beforeEach(async() => {
    await MockBuilder(ImageIconsComponent, AppModule);
    fixture = TestBed.createComponent(ImageIconsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
