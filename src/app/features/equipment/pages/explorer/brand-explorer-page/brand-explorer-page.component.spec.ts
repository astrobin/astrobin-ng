import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandExplorerPageComponent } from './brand-explorer-page.component';

describe('BrandExplorerPageComponent', () => {
  let component: BrandExplorerPageComponent;
  let fixture: ComponentFixture<BrandExplorerPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrandExplorerPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrandExplorerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
