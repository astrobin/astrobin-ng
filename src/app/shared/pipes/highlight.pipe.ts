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
    if (!search) {
      return value;
    }

    // Remove punctuation from search string and split into words
    const sanitizedSearch = search.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').trim();
    const words = sanitizedSearch.split(' ')
      .filter(word => word.length > 1 && !this.stopWords.has(word.toLowerCase())); // Exclude single characters and stop words

    if (words.length === 0) {
      return value;
    }

    // Create a regex to match any of the words
    const regex = new RegExp(`(${words.join('|')})`, 'gi');

    // Replace matches with highlighted span
    return value.replace(regex, '<span class="highlight">$1</span>');
  }
}
