import { Injectable, NgZone } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class ImageService extends BaseService {
  public constructor(
    public readonly loadingService: LoadingService,
    public readonly windowRef: WindowRefService,
    public readonly zone: NgZone) {
    super(loadingService);
  }

  loadImageFile(url: string, progressCallback: (progress: number) => void): Observable<string> {
    return new Observable<string>(observer => {
      const xhr = new XMLHttpRequest();
      const nativeWindow = this.windowRef.nativeWindow;
      let notifiedNotComputable = false;

      xhr.open("GET", url, true);
      xhr.responseType = "arraybuffer";

      xhr.onprogress = event => {
        this.zone.run(() => {
          if (event.lengthComputable) {
            const progress: number = (event.loaded / event.total) * 100;
            progressCallback(progress);
          } else {
            if (!notifiedNotComputable) {
              notifiedNotComputable = true;
              progressCallback(-1);
            }
          }
        });
      };

      xhr.onloadend = () => {
        this.zone.run(() => {
          if (!xhr.status.toString().match(/^2/)) {
            // Try a more traditional approach.
            const image = new Image();
            image.onload = () => {
              observer.next(url);
              observer.complete();
            };
            image.src = url;
            return;
          }

          if (!notifiedNotComputable) {
            progressCallback(100);
          }

          const options: any = {};
          const headers = xhr.getAllResponseHeaders();
          const m = headers.match(/^Content-Type:\s*(.*?)$/im);

          if (m && m[1]) {
            options.type = m[1];
          }

          const blob = new Blob([xhr.response], options);

          observer.next((nativeWindow as any).URL.createObjectURL(blob));
          observer.complete();
        });
      };

      xhr.send();
    });
  }
}
