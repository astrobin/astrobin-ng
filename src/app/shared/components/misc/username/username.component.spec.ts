import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { UsernameService } from "@shared/components/misc/username/username.service";
import { UsernameServiceMock } from "@shared/components/misc/username/username.service-mock";
import { UsernameComponent } from "./username.component";

describe("UsernameComponent", () => {
  let component: UsernameComponent;
  let fixture: ComponentFixture<UsernameComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: UsernameService, useClass: UsernameServiceMock }],
      declarations: [UsernameComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UsernameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
