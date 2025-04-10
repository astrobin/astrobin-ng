import type { HttpClient } from "@angular/common/http";
import { normalizeToSupportedLanguage } from "@app/translate-loader";
import { TranslatePoHttpLoader } from "@tobyodonnell-aiau/ngx-translate-po-http-loader";
import * as fs from "fs";
import { join } from "path";
import { Observable } from "rxjs";

export class TranslateServerLoader extends TranslatePoHttpLoader {
  constructor(
    public readonly http: HttpClient,
    public readonly prefix: string = "i18n",
    public readonly suffix: string = ".po"
  ) {
    super(http);
  }

  public getTranslation(lang: string): Observable<any> {
    return new Observable(observer => {
      const assets_folder = join(process.cwd(), "dist", "frontend", "browser", "assets", this.prefix);

      lang = normalizeToSupportedLanguage(lang);

      const poData = fs.readFileSync(`${assets_folder}/${lang}${this.suffix}`, "utf8");

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

export function translateServerLoaderFactory(http: HttpClient) {
  return new TranslateServerLoader(http);
}
