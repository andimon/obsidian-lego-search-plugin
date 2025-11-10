import { replaceDateInString } from '@utils/utils';
import { App, Notice, PluginSettingTab, Setting } from 'obsidian';

import { ServiceProvider } from '@src/constants';
import { FileNameFormatSuggest } from './suggesters/FileNameFormatSuggester';
import { FileSuggest } from './suggesters/FileSuggester';
import { FolderSuggest } from './suggesters/FolderSuggester';

const docUrl = 'https://github.com/anpigon/obsidian-lego-search-plugin';

export enum DefaultFrontmatterKeyType {
  snakeCase = 'Snake Case',
  camelCase = 'Camel Case',
}

export interface LegoSearchPluginSettings {
  folder: string; // new file location
  fileNameFormat: string; // new file name format
  frontmatter: string; // frontmatter that is inserted into the file
  content: string; // what is automatically written to the file.
  useDefaultFrontmatter: boolean;
  defaultFrontmatterKeyType: DefaultFrontmatterKeyType;
  templateFile: string;
  serviceProvider: ServiceProvider;
  rebrickableApiKey: string;
  openPageOnCompletion: boolean;
  showCoverImageInSearch: boolean;
  enableCoverImageSave: boolean;
  coverImagePath: string;
}

export const DEFAULT_SETTINGS: LegoSearchPluginSettings = {
  folder: '',
  fileNameFormat: '',
  frontmatter: '',
  content: '',
  useDefaultFrontmatter: true,
  defaultFrontmatterKeyType: DefaultFrontmatterKeyType.camelCase,
  templateFile: '',
  serviceProvider: ServiceProvider.rebrickable,
  rebrickableApiKey: '',
  openPageOnCompletion: true,
  showCoverImageInSearch: false,
  enableCoverImageSave: false,
  coverImagePath: '',
};

export class LegoSearchSettingTab extends PluginSettingTab {
  constructor(
    app: App,
    private plugin: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  ) {
    super(app, plugin);
  }

  private createGeneralSettings(containerEl) {
    this.createHeader('General Settings', containerEl);
    this.createFileLocationSetting(containerEl);
    this.createFileNameFormatSetting(containerEl);
  }

  private createHeader(title, containerEl) {
    const header = document.createDocumentFragment();
    header.createEl('h2', { text: title });
    return new Setting(containerEl).setHeading().setName(header);
  }

  private createFileLocationSetting(containerEl) {
    new Setting(containerEl)
      .setName('New file location')
      .setDesc('New LEGO set notes will be placed here.')
      .addSearch(cb => {
        try {
          new FolderSuggest(this.app, cb.inputEl);
        } catch (e) {
          console.error(e); // Improved error handling
        }
        cb.setPlaceholder('Example: folder1/folder2')
          .setValue(this.plugin.settings.folder)
          .onChange(new_folder => {
            this.plugin.settings.folder = new_folder;
            this.plugin.saveSettings();
          });
      });
  }

  private createFileNameFormatSetting(containerEl) {
    const newFileNameHint = document.createDocumentFragment().createEl('code', {
      text: replaceDateInString(this.plugin.settings.fileNameFormat) || '{{set_num}} - {{name}}',
    });
    new Setting(containerEl)
      .setClass('lego-search-plugin__settings--new_file_name')
      .setName('New file name')
      .setDesc('Enter the file name format.')
      .addSearch(cb => {
        try {
          new FileNameFormatSuggest(this.app, cb.inputEl);
        } catch (e) {
          console.error(e); // Improved error handling
        }
        cb.setPlaceholder('Example: {{set_num}} - {{name}}')
          .setValue(this.plugin.settings.fileNameFormat)
          .onChange(newValue => {
            this.plugin.settings.fileNameFormat = newValue?.trim();
            this.plugin.saveSettings();

            newFileNameHint.innerHTML = replaceDateInString(newValue) || '{{set_num}} - {{name}}';
          });
      });
    containerEl
      .createEl('div', {
        cls: ['setting-item-description', 'lego-search-plugin__settings--new_file_name_hint'],
      })
      .append(newFileNameHint);
  }

  private createTemplateFileSetting(containerEl: HTMLElement) {
    const templateFileDesc = document.createDocumentFragment();
    templateFileDesc.createDiv({ text: 'Files will be available as templates.' });
    templateFileDesc.createEl('a', {
      text: 'Example Template',
      href: `${docUrl}#example-template`,
    });
    new Setting(containerEl)
      .setName('Template file')
      .setDesc(templateFileDesc)
      .addSearch(cb => {
        try {
          new FileSuggest(this.app, cb.inputEl);
        } catch {
          // eslint-disable
        }
        cb.setPlaceholder('Example: templates/template-file')
          .setValue(this.plugin.settings.templateFile)
          .onChange(newTemplateFile => {
            this.plugin.settings.templateFile = newTemplateFile;
            this.plugin.saveSettings();
          });
      });
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.classList.add('lego-search-plugin__settings');

    this.createGeneralSettings(containerEl);
    this.createTemplateFileSetting(containerEl);

    // Rebrickable API Settings
    this.createHeader('Rebrickable API Settings', containerEl);

    const rebrickableDesc = document.createDocumentFragment();
    rebrickableDesc.createDiv({ text: 'Get your free API key from Rebrickable.' });
    rebrickableDesc.createEl('a', {
      text: 'Get API Key',
      href: 'https://rebrickable.com/api/',
    });

    new Setting(containerEl)
      .setName('Rebrickable API Key')
      .setDesc(rebrickableDesc)
      .addText(text => {
        text.inputEl.type = 'password';
        text
          .setPlaceholder('Enter your Rebrickable API key')
          .setValue(this.plugin.settings.rebrickableApiKey ? '••••••••' : '')
          .onChange(async value => {
            if (value && value !== '••••••••') {
              this.plugin.settings.rebrickableApiKey = value.trim();
              await this.plugin.saveSettings();
            }
          });
      });

    new Setting(containerEl)
      .setName('API Key Status')
      .setDesc('Check whether API key is saved.')
      .addButton(button => {
        button.setButtonText('Check API Key').onClick(async () => {
          if (this.plugin.settings.rebrickableApiKey.length) {
            new Notice('API key exists.');
          } else {
            new Notice('API key not set. Please add your Rebrickable API key.');
          }
        });
      });

    new Setting(containerEl)
      .setName('Open New LEGO Set Note')
      .setDesc('Enable or disable the automatic opening of the note on creation.')
      .addToggle(toggle =>
        toggle.setValue(this.plugin.settings.openPageOnCompletion).onChange(async value => {
          this.plugin.settings.openPageOnCompletion = value;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName('Show Box Art in Search')
      .setDesc('Toggle to show or hide box art images in the search results.')
      .addToggle(toggle =>
        toggle.setValue(this.plugin.settings.showCoverImageInSearch).onChange(async value => {
          this.plugin.settings.showCoverImageInSearch = value;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName('Enable Box Art Save')
      .setDesc('Toggle to enable or disable saving box art images in notes.')
      .addToggle(toggle =>
        toggle.setValue(this.plugin.settings.enableCoverImageSave).onChange(async value => {
          this.plugin.settings.enableCoverImageSave = value;
          await this.plugin.saveSettings();
        }),
      );

    new Setting(containerEl)
      .setName('Box Art Image Path')
      .setDesc('Specify the path where box art images should be saved.')
      .addSearch(cb => {
        try {
          new FolderSuggest(this.app, cb.inputEl);
        } catch {
          // eslint-disable
        }
        cb.setPlaceholder('Enter the path (e.g., Images/LEGO)')
          .setValue(this.plugin.settings.coverImagePath)
          .onChange(async value => {
            this.plugin.settings.coverImagePath = value.trim();
            await this.plugin.saveSettings();
          });
      });
  }
}
