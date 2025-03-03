import { Injectable, PLATFORM_ID, Inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { TranslateService } from "@ngx-translate/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { Observable, from, of } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { JsonApiService } from "@core/services/api/classic/json/json-api.service";

export interface ContentTranslationPreference {
  translated: boolean;
  content: string;
  language: string;
  timestamp: number;
}

export interface ContentTranslateOptions {
  text: string;
  sourceLanguage?: string;
  format: "html" | "bbcode";
  itemType: string;
  itemId: string;
}

@Injectable({
  providedIn: "root"
})
export class ContentTranslateService {
  private readonly STORAGE_KEY = "astrobin_translations";
  private readonly _isBrowser: boolean;

  constructor(
    private readonly translateService: TranslateService,
    private readonly jsonApiService: JsonApiService,
    private readonly sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this._isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Translate content with localStorage caching
   */
  public translate(options: ContentTranslateOptions): Observable<SafeHtml> {
    const { text, format, itemType, itemId } = options;

    // Check if we have a cached translation first (only in browser)
    if (this._isBrowser) {
      const savedTranslations = this._getTranslations(itemType);
      const savedTranslation = savedTranslations[itemId];

      if (savedTranslation?.translated) {
        // Return cached translation if we have one
        return of(this._sanitizeContent(savedTranslation.content, format));
      }
    }

    // Otherwise perform new translation
    return from(
      this.jsonApiService.translate(
        text,
        options.sourceLanguage,
        this.translateService.currentLang,
        { format }
      )
    ).pipe(
      map(response => {
        // Save the translation in localStorage (only in browser)
        if (this._isBrowser) {
          this._saveTranslation(
            itemType,
            itemId,
            true,
            response.translation,
            options.sourceLanguage
          );
        }

        return this._sanitizeContent(response.translation, format);
      }),
      catchError(error => {
        console.error("Translation failed:", error);
        throw error;
      })
    );
  }

  /**
   * Clear translation for an item (when "See original" is clicked)
   */
  public clearTranslation(itemType: string, itemId: string): void {
    if (this._isBrowser) {
      this._saveTranslation(itemType, itemId, false, null, null);
    }
  }

  /**
   * Check if an item's translation is available in the cache
   */
  public hasTranslation(itemType: string, itemId: string): boolean {
    if (!this._isBrowser) {
      return false;
    }

    const savedTranslations = this._getTranslations(itemType);
    return !!savedTranslations[itemId]?.translated;
  }

  /**
   * Sanitize content based on format
   */
  public sanitizeContent(content: string, format: string): SafeHtml {
    if (format === "html" || format === "bbcode") {
      return this.sanitizer.bypassSecurityTrustHtml(content);
    }
    return content;
  }

  /**
   * Internal sanitize method used by the service
   */
  private _sanitizeContent(content: string, format: string): SafeHtml {
    return this.sanitizeContent(content, format);
  }

  /**
   * Save translation preference to localStorage
   */
  private _saveTranslation(
    itemType: string,
    itemId: string,
    translated: boolean,
    translatedContent: string,
    detectedLanguage: string
  ): void {
    if (!this._isBrowser || !window.localStorage) {
      return; // Not in browser or localStorage not supported
    }

    try {
      // Get existing preferences or create new object
      let translationPrefs = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');

      // Initialize container for this type if needed
      if (!translationPrefs[itemType]) {
        translationPrefs[itemType] = {};
      }

      if (translated) {
        // Save translation data
        translationPrefs[itemType][itemId] = {
          translated: true,
          content: translatedContent,
          language: detectedLanguage,
          timestamp: new Date().getTime()
        };
      } else {
        // Remove preference if not translated
        if (translationPrefs[itemType][itemId]) {
          delete translationPrefs[itemType][itemId];
        }
      }

      // Try to save to localStorage
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(translationPrefs));
      } catch (storageError) {
        // Check if we hit the storage quota
        if (storageError.name === 'QuotaExceededError' ||
            // For some browsers
            storageError.code === 22 ||
            // For others
            storageError.code === 1014) {

          console.warn('Storage quota exceeded. Pruning older translations...');

          // Flatten all entries with type and id info for sorting
          const allEntries = [];
          for (const type in translationPrefs) {
            for (const id in translationPrefs[type]) {
              allEntries.push({
                type: type,
                id: id,
                timestamp: translationPrefs[type][id].timestamp
              });
            }
          }

          // Sort by timestamp (oldest first)
          allEntries.sort((a, b) => a.timestamp - b.timestamp);

          // Remove 20% of the oldest entries
          const removeCount = Math.max(1, Math.floor(allEntries.length * 0.2));

          for (let i = 0; i < removeCount; i++) {
            if (allEntries[i]) {
              const entry = allEntries[i];
              delete translationPrefs[entry.type][entry.id];

              // If the type container is empty, remove it
              if (Object.keys(translationPrefs[entry.type]).length === 0) {
                delete translationPrefs[entry.type];
              }
            }
          }

          console.log(`Removed ${removeCount} old translations to free up space`);

          // Try saving again with reduced data
          try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(translationPrefs));
          } catch (retryError) {
            // If still failing, clear everything except the current translation
            console.warn('Still cannot save. Clearing all translations except current one.');

            if (translated) {
              const currentTranslation = translationPrefs[itemType]?.[itemId];
              translationPrefs = {};
              translationPrefs[itemType] = {};
              translationPrefs[itemType][itemId] = currentTranslation;

              try {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(translationPrefs));
              } catch (finalError) {
                console.error('Cannot save translations at all. Local storage may be disabled.');
              }
            }
          }
        } else {
          // Some other error occurred
          console.error("Error saving translation preference:", storageError);
        }
      }
    } catch (e) {
      console.error("Error processing translation preference:", e);
    }
  }

  /**
   * Get translations for a specific type (e.g., 'comment', 'image')
   */
  private _getTranslations(itemType: string): Record<string, ContentTranslationPreference> {
    if (!this._isBrowser || !window.localStorage) {
      return {}; // Not in browser or localStorage not supported
    }

    try {
      // Get saved preferences
      const translationPrefs = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
      const currentTime = new Date().getTime();
      const expirationTime = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
      let changed = false;

      // If no translations for this type, return empty object
      if (!translationPrefs[itemType]) {
        return {};
      }

      // Check for expired items
      const typePrefs = translationPrefs[itemType];
      for (const itemId in typePrefs) {
        if (currentTime - typePrefs[itemId].timestamp > expirationTime) {
          delete typePrefs[itemId];
          changed = true;
        }
      }

      // If we removed expired items, save the updated prefs
      if (changed) {
        // Clean up empty type containers
        if (Object.keys(typePrefs).length === 0) {
          delete translationPrefs[itemType];
        }

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(translationPrefs));
      }

      return typePrefs || {};
    } catch (e) {
      console.error("Error loading translation preferences:", e);
      return {};
    }
  }
}
