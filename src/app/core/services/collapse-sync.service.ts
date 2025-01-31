import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class CollapseSyncService {
  private collapseState = new Subject<{ componentType: string; isCollapsed: boolean }>();
  collapseState$ = this.collapseState.asObservable();

  emitCollapseState(componentType: string, isCollapsed: boolean): void {
    this.collapseState.next({ componentType, isCollapsed });
  }
}
