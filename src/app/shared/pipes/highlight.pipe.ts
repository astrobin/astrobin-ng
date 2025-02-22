import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlight'
})
export class HighlightPipe implements PipeTransform {
  // Combined stop words for multiple languages
  private stopWords: Set<string> = new Set([
    // English stop words
    "the", "a", "an", "and", "or", "but", "if", "then", "else", "when", "at", "by", "from", "on", "with", "without", "about",
    // German stop words
    "der", "die", "das", "ein", "eine", "einen", "und", "oder", "aber", "wenn", "dann", "sonst", "wann", "bei", "von", "auf", "mit", "ohne", "über",
    // French stop words
    "le", "la", "les", "un", "une", "des", "et", "ou", "mais", "si", "alors", "sinon", "quand", "à", "par", "de", "sur", "avec", "sans", "environ",
    // Italian stop words
    "il", "lo", "la", "un", "una", "uno", "e", "o", "ma", "se", "allora", "altrimenti", "quando", "a", "da", "su", "con", "senza", "circa",
    // Spanish stop words
    "el", "la", "los", "un", "una", "unos", "y", "o", "pero", "si", "entonces", "sino", "cuando", "a", "por", "de", "en", "con", "sin", "acerca"
  ]);

  transform(value: string, search: string): string {
    if (!search || !value) {
      return value;
    }

    // Extract quoted phrases and individual words
    const searchTerms: string[] = [];
    let currentTerm = '';
    let inQuotes = false;

    for (let i = 0; i < search.length; i++) {
      const char = search[i];

      if (char === '"') {
        if (inQuotes) {
          // End of quoted phrase
          if (currentTerm.trim()) {
            searchTerms.push(currentTerm.trim());
          }
          currentTerm = '';
        }
        inQuotes = !inQuotes;
      } else if (char === ' ' && !inQuotes) {
        // Space outside quotes
        if (currentTerm.trim()) {
          searchTerms.push(currentTerm.trim());
        }
        currentTerm = '';
      } else {
        currentTerm += char;
      }
    }

    // Add the last term if exists
    if (currentTerm.trim()) {
      searchTerms.push(currentTerm.trim());
    }

    // Filter out stop words and single characters (unless they're in quotes)
    const filteredTerms = searchTerms
      .filter(term => {
        const isQuoted = search.includes(`"${term}"`);
        return isQuoted || (term.length > 1 && !this.stopWords.has(term.toLowerCase()));
      });

    if (filteredTerms.length === 0) {
      return value;
    }

    // Escape special regex characters in the search terms
    const escapedTerms = filteredTerms.map(term =>
      term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    );

    // Create a regex to match any of the terms
    const regex = new RegExp(`(${escapedTerms.join('|')})`, 'gi');

    // Replace matches with highlighted span
    return value.replace(regex, '<span class="highlight">$1</span>');
  }
}
