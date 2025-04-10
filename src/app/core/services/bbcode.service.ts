import { isPlatformBrowser } from "@angular/common";
import type { Renderer2 } from "@angular/core";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import type { CKEditorService } from "@core/services/ckeditor.service";
import type { WindowRefService } from "@core/services/window-ref.service";

@Injectable({ providedIn: "root" })
export class BBCodeService {
  private readonly _isBrowser: boolean;
  private _transformPromise: Promise<void> | null = null;

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    private readonly windowRefService: WindowRefService,
    private readonly ckEditorService: CKEditorService
  ) {
    this._isBrowser = isPlatformBrowser(this.platformId);
  }

  /**
   * Transforms BBCode to HTML asynchronously, loading CKEditor first if needed
   * @param code BBCode string to transform
   * @param renderer Optional Renderer2 instance
   * @returns Promise with HTML string result
   */
  async transformBBCodeToHtml(code: string, renderer?: Renderer2): Promise<string> {
    // For server-side rendering, just return the original code
    if (!this._isBrowser || !code) {
      return code;
    }

    try {
      // Use our cached promise if we have one, otherwise create a new one
      if (!this._transformPromise) {
        this._transformPromise = this.ckEditorService.loadCKEditor();
      }

      // Wait for CKEditor to load
      await this._transformPromise;

      // Now perform the transformation using private method
      return this._performTransform(code, renderer);
    } catch (error) {
      console.warn("Failed to load CKEditor for BBCode transformation:", error);
      // Return original code if loading or transformation fails
      return code;
    }
  }

  /**
   * Strips all BBCode tags from a string, leaving only the plain text
   * This is useful for meta tags and other scenarios where you want
   * readable text without any markup
   *
   * @param code BBCode string to strip
   * @returns Plain text with BBCode tags removed
   */
  stripBBCode(code: string): string {
    if (!code) {
      return "";
    }

    // Replace common BBCode tags with either nothing or appropriate spaces
    return (
      code
        // Remove [url=...] and similar tags with attributes
        .replace(/\[\w+=[^\]]*\]/g, "")
        // Remove simple opening and closing tags like [b], [i], [/b], [/i], etc.
        .replace(/\[\/?\w+\]/g, "")
        // Handle quote tags more specifically to preserve readability
        .replace(/\[quote(?:=[^\]]*)?\]/g, "")
        .replace(/\[\/quote\]/g, "")
        // Convert list items to have dashes for better readability
        .replace(/\[\*\]/g, "- ")
        // Add spacing where needed to avoid words running together
        .replace(/\n{3,}/g, "\n\n")
        .trim()
    );
  }

  /**
   * Performs the actual BBCode to HTML transformation
   * @param code BBCode string to transform
   * @param renderer Optional Renderer2 instance
   * @returns The transformed HTML
   * @private
   */
  private _performTransform(code: string, renderer?: Renderer2): string {
    // Early exit for SSR or empty content
    if (!this._isBrowser || !code) {
      return code;
    }

    const win = this.windowRefService.nativeWindow as any;
    const CKEDITOR = win.CKEDITOR;

    if (!CKEDITOR || !CKEDITOR.htmlParser) {
      return code;
    }

    try {
      const fragment = CKEDITOR.htmlParser.fragment.fromBBCode(code);
      const writer = new CKEDITOR.htmlParser.basicWriter();
      const bbcodeFilter = this.ckEditorService.setupBBCodeFilter(renderer);

      fragment.writeHtml(writer, bbcodeFilter);
      return writer.getHtml(true);
    } catch (error) {
      console.warn("Error transforming BBCode to HTML:", error);
      return code;
    }
  }
}
