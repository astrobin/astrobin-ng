import { Location } from "@angular/common";
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from "@angular/router";
import { EMPTY, Observable } from "rxjs";
import { catchError } from "rxjs/operators";
import { ImageInterface } from "../interfaces/image.interface";
import { ImageApiService } from "../services/api/classic/images-app/image/image-api.service";

@Injectable({
  providedIn: "root"
})
export class ImageResolver implements Resolve<ImageInterface> {
  constructor(private service: ImageApiService, private router: Router, private location: Location) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | Promise<any> | any {
    return this.service.getImage(+route.paramMap.get("imageId")).pipe(
      catchError(err => {
        setTimeout(() => {
          this.router.navigateByUrl("/404", { skipLocationChange: true }).then(() => {
            this.location.replaceState(state.url);
          });
        }, 1);
        return EMPTY;
      })
    );
  }
}
