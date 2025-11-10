import { BaseLegoApiImpl, factoryServiceProvider } from '@apis/base_api';
import { LegoSet } from '@models/lego.model';
import { ButtonComponent, Modal, Notice, Setting, TextComponent } from 'obsidian';

export class LegoSearchModal extends Modal {
  private readonly SEARCH_BUTTON_TEXT = 'Search';
  private readonly REQUESTING_BUTTON_TEXT = 'Requesting...';
  private isBusy = false;
  private okBtnRef?: ButtonComponent;
  private serviceProvider: BaseLegoApiImpl;

  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private plugin: any,
    private query: string,
    private callback: (error: Error | null, result?: LegoSet[]) => void,
  ) {
    super(plugin.app);
    this.serviceProvider = factoryServiceProvider(plugin.settings);
  }

  setBusy(busy: boolean): void {
    this.isBusy = busy;
    this.okBtnRef?.setDisabled(busy).setButtonText(busy ? this.REQUESTING_BUTTON_TEXT : this.SEARCH_BUTTON_TEXT);
  }

  async searchLegoSet(): Promise<void> {
    if (!this.query) return void new Notice('No query entered.');
    if (this.isBusy) return;

    this.setBusy(true);
    try {
      const searchResults = await this.serviceProvider.getByQuery(this.query);
      if (!searchResults?.length) return void new Notice(`No results found for "${this.query}"`);
      this.callback(null, searchResults);
    } catch (err) {
      this.callback(err as Error);
    } finally {
      this.setBusy(false);
      this.close();
    }
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.createEl('h2', { text: 'Search LEGO Set' });
    contentEl.createDiv({ cls: 'lego-search-plugin__search-modal--input' }, el => {
      new TextComponent(el)
        .setValue(this.query)
        .setPlaceholder('Search by set number, name, or theme')
        .onChange(value => (this.query = value))
        .inputEl.addEventListener(
          'keydown',
          event => event.key === 'Enter' && !event.isComposing && this.searchLegoSet(),
        );
    });
    new Setting(this.contentEl).addButton(btn => {
      this.okBtnRef = btn
        .setButtonText(this.SEARCH_BUTTON_TEXT)
        .setCta()
        .onClick(() => this.searchLegoSet());
    });
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }
}
