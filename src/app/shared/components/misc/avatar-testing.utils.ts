import { NgModule, Pipe, PipeTransform } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { Store } from "@ngrx/store";
import { of } from "rxjs";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { TranslateModule, TranslatePipe } from "@ngx-translate/core";
import { Router } from "@angular/router";

// Create shared mock for store
export const createMockStore = () => ({
  dispatch: jest.fn(),
  select: jest.fn().mockReturnValue(of({})),
  pipe: jest.fn().mockReturnValue(of({}))
});

// Mock TranslatePipe for all components that might need it
@Pipe({ name: 'translate' })
export class MockTranslatePipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

// Create a shared testing module for all avatar components
@NgModule({
  declarations: [
    MockTranslatePipe
  ],
  imports: [
    BrowserAnimationsModule
  ],
  providers: [
    { provide: Store, useFactory: createMockStore },
    { provide: Router, useValue: { navigate: jest.fn() } }
  ],
  exports: [
    MockTranslatePipe
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class AvatarTestingModule { }

// Helper function to configure TestBed with our common settings
export function configureAvatarTestingModule(declarations: any[] = [], providers: any[] = []) {
  TestBed.configureTestingModule({
    declarations: [
      ...declarations
    ],
    imports: [
      AvatarTestingModule
    ],
    providers: [
      ...providers
    ],
    schemas: [NO_ERRORS_SCHEMA]
  });
}