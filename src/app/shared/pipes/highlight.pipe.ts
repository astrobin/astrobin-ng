import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'highlight'
})
export class HighlightPipe implements PipeTransform {
  transform(value: string, search: string): string {
    if (!search) {
      return value;
    }

    // Remove punctuation from search string and split into words
    const sanitizedSearch = search.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').trim();
    const words = sanitizedSearch.split(' ').filter(word => word);

    if (words.length === 0) {
      return value;
    }

    // Create a regex to match any of the words
    const regex = new RegExp(`(${words.join('|')})`, 'gi');

    // Replace matches with highlighted span
    return value.replace(regex, '<span class="highlight">$1</span>');
  }
}
