import { App, SuggestModal } from 'obsidian';
import { LegoSet } from '@models/lego.model';

export class LegoSuggestModal extends SuggestModal<LegoSet> {
  showCoverImageInSearch: boolean;

  constructor(
    app: App,
    showCoverImageInSearch: boolean,
    private readonly suggestion: LegoSet[],
    private onChoose: (error: Error | null, result?: LegoSet) => void,
  ) {
    super(app);
    this.showCoverImageInSearch = showCoverImageInSearch;
  }

  // Returns all available suggestions.
  getSuggestions(query: string): LegoSet[] {
    return this.suggestion.filter(legoSet => {
      const searchQuery = query?.toLowerCase();
      return (
        legoSet.name?.toLowerCase().includes(searchQuery) ||
        legoSet.set_num?.toLowerCase().includes(searchQuery) ||
        legoSet.theme?.toLowerCase().includes(searchQuery)
      );
    });
  }

  // Renders each suggestion item.
  renderSuggestion(legoSet: LegoSet, el: HTMLElement) {
    el.addClass('lego-suggestion-item');

    const boxArtUrl = legoSet.set_img_url;

    if (this.showCoverImageInSearch && boxArtUrl) {
      el.createEl('img', {
        cls: 'lego-box-art-image',
        attr: {
          src: boxArtUrl,
          alt: `Box Art for ${legoSet.name}`,
        },
      });
    }

    const textContainer = el.createEl('div', { cls: 'lego-text-info' });
    textContainer.createEl('div', { text: legoSet.name });

    const theme = legoSet.theme ? `${legoSet.theme}` : '';
    const year = legoSet.year ? `(${legoSet.year})` : '';
    const pieces = legoSet.num_parts ? `, ${legoSet.num_parts} pieces` : '';
    const subtitle = `${legoSet.set_num} - ${theme}${year}${pieces}`;
    textContainer.createEl('small', { text: subtitle });
  }

  // Perform action on the selected suggestion.
  onChooseSuggestion(legoSet: LegoSet) {
    this.onChoose(null, legoSet);
  }
}
