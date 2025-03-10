import { Injectable, TemplateRef } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

export interface MobilePageMenuConfig {
  titleTemplate: TemplateRef<any>;
  descriptionTemplate?: TemplateRef<any>;
  iconsTemplate?: TemplateRef<any>;
  template?: TemplateRef<any>;
  templateContext?: any;
  position?: "start" | "end" | "top" | "bottom";
  offcanvasClass?: string;
  offcanvasBackdropClass?: string;
}

@Injectable({
  providedIn: "root"
})
export class MobilePageMenuService {
  private menuConfigSubject = new BehaviorSubject<MobilePageMenuConfig | null>(null);
  public menuConfig$ = this.menuConfigSubject.asObservable();

  private menuOpenStateSubject = new BehaviorSubject<boolean>(false);
  public menuOpenState$ = this.menuOpenStateSubject.asObservable();

  constructor() {
  }

  /**
   * Register a page-specific menu configuration
   * @param config The menu configuration to register
   */
  registerMenu(config: MobilePageMenuConfig): void {
    this.menuConfigSubject.next(config);
  }

  /**
   * Clear the registered menu configuration
   */
  clearMenu(): void {
    this.menuConfigSubject.next(null);
  }

  /**
   * Open the menu
   */
  openMenu(): void {
    this.menuOpenStateSubject.next(true);
  }

  /**
   * Close the menu
   */
  closeMenu(): void {
    this.menuOpenStateSubject.next(false);
  }

  /**
   * Get the current menu open state
   */
  getMenuOpenState(): Observable<boolean> {
    return this.menuOpenState$;
  }

  /**
   * Get the current menu configuration
   */
  getMenuConfig(): Observable<MobilePageMenuConfig | null> {
    return this.menuConfig$;
  }
}
