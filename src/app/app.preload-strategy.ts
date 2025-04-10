import { Injectable } from "@angular/core";
import { PreloadingStrategy, Route } from "@angular/router";
import { Observable, of } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class CustomPreloadStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    if (route.data?.preload === true || route.data?.["preload"] === true) {
      return load();
    }

    // If we have child routes, check them too
    if (route.children) {
      for (const childRoute of route.children) {
        if (childRoute.data?.preload === true || childRoute.data?.["preload"] === true) {
          return load();
        }
      }
    }

    return of(null);
  }
}
