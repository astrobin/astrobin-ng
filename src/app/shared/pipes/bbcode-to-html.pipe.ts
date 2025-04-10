import { isPlatformServer } from "@angular/common";
import { PipeTransform, Renderer2, Pipe, SecurityContext, Inject, PLATFORM_ID } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { BBCodeService } from "@core/services/bbcode.service";
import { Observable, from, of } from "rxjs";
import { catchError, map } from "rxjs/operators";

@Pipe({
  name: "BBCodeToHtml",
  pure: true
})
export class BBCodeToHtmlPipe implements PipeTransform {
  private readonly _isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    public readonly bbCodeService: BBCodeService,
    public readonly domSanitizer: DomSanitizer
  ) {
    this._isBrowser = !isPlatformServer(this.platformId);
  }

  transform(value: string, renderer?: Renderer2): Observable<string> {
    if (!value) {
      return of("");
    }

    // On the server, just return the original value to avoid loading CKEditor
    if (!this._isBrowser) {
      return of(value);
    }

    // Convert the Promise from transformBBCodeToHtml to Observable
    // The service method handles SSR safety again, but we check here too for clarity
    return from(this.bbCodeService.transformBBCodeToHtml(value, renderer)).pipe(
      // Sanitize the HTML content
      map(html => this.domSanitizer.sanitize(SecurityContext.HTML, html) || ""),
      // Handle any errors and return the original value as fallback
      catchError(error => {
        console.warn("Error transforming BBCode to HTML:", error);
        return of(value);
      })
    );
  }
}
