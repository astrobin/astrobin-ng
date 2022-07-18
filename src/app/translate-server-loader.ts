import { join } from "path";
import { Observable } from "rxjs";
import * as fs from "fs";
import { TranslatePoHttpLoader } from "@fjnr/ngx-translate-po-http-loader";
import { HttpClient } from "@angular/common/http";
import { makeStateKey, StateKey, TransferState } from "@angular/platform-browser";
import { environment } from "@env/environment";

export class TranslateServerLoader extends TranslatePoHttpLoader {
  constructor(
    public readonly http: HttpClient,
    public readonly transferState: TransferState,
    public readonly prefix: string = "i18n",
    public readonly suffix: string = ".po"
  ) {
    super(http);
  }

  public getTranslation(lang: string): Observable<any> {
    return new Observable(observer => {
      const assets_folder = join(process.cwd(), "dist", "frontend", "browser", "assets", this.prefix);

      const poData = fs.readFileSync(`${assets_folder}/${lang}${this.suffix}`, "utf8");

      const key: StateKey<string> = makeStateKey<string>(
        `/assets/i18n/${lang}${this.suffix}?version=${environment.buildVersion}`
      );

      this.transferState.set(key, poData);

      observer.next(this.parse(poData));
      observer.complete();
    });
  }

  public parse(contents: string): any {
    const translations = super.parse(contents);
    const mapped = {};

    Object.keys(translations).forEach(key => {
      const regex = /%\((.*?)\)s/g;
      const replacement = "{{$1}}";
      mapped[key.replace(regex, replacement)] = translations[key].replace(regex, replacement);
    });

    return mapped;
  }
}

export function translateServerLoaderFactory(http: HttpClient, transferState: TransferState) {
  return new TranslateServerLoader(http, transferState);
}
