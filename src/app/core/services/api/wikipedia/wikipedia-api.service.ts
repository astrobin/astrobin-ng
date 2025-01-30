import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

export interface WikipediaPageImageInterface {
  source: string;
  width: number;
  height: number;
}

export interface WikipediaPageSummaryInterface {
  type: string;
  title: string;
  displaytitle: string;
  thumbnail: WikipediaPageImageInterface;
  originalimage: WikipediaPageImageInterface;
  land: string;
  content_urls: {
    desktop: {
      page: string;
    };
    mobile: {
      page: string;
    };
  };
  extract: string;
  extract_html: string;
}

@Injectable({
  providedIn: "root"
})
export class WikipediaApiService {
  constructor(public readonly http: HttpClient) {
  }

  getPageSummary(title: string, language: string): Observable<WikipediaPageSummaryInterface> {
    return this.http.get<WikipediaPageSummaryInterface>(
      `https://${language}.wikipedia.org/api/rest_v1/page/summary/${title}`
    );
  }
}
