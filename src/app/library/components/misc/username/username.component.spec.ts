import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { UsernameService } from "@lib/components/misc/username/username.service";
import { UsernameServiceMock } from "@lib/components/misc/username/username.service-mock";
import { UsernameComponent } from "./username.component";

describe("UsernameComponent", () => {
  let component: UsernameComponent;
  let fixture: ComponentFixture<UsernameComponent>;

  beforeEach(async(() => {
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
