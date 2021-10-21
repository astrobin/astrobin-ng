import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";

export class ContentTypeGenerator {
  static contentType(source: Partial<ContentTypeInterface> = {}): ContentTypeInterface {
    return {
      id: source.id || 1,
      appLabel: source.appLabel || "astrobin",
      model: source.model || "foo"
    };
  }
}
