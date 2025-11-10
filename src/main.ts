import { MarkdownView, Notice, Plugin, TFile, requestUrl } from 'obsidian';

import { LegoSearchModal } from '@views/book_search_modal';
import { LegoSuggestModal } from '@views/book_suggest_modal';
import { CursorJumper } from '@utils/cursor_jumper';
import { LegoSet } from '@models/lego.model';
import { LegoSearchSettingTab, LegoSearchPluginSettings, DEFAULT_SETTINGS } from '@settings/settings';
import {
  getTemplateContents,
  applyTemplateTransformations,
  useTemplaterPluginInFile,
  executeInlineScriptsTemplates,
} from '@utils/template';
import { replaceVariableSyntax, makeFileName, applyDefaultFrontMatter, toStringFrontMatter } from '@utils/utils';

export default class LegoSearchPlugin extends Plugin {
  settings: LegoSearchPluginSettings;

  async onload() {
    await this.loadSettings();

    // This creates an icon in the left ribbon.
    const ribbonIconEl = this.addRibbonIcon('blocks', 'Create new LEGO set note', () => this.createNewLegoNote());
    // Perform additional things with the ribbon
    ribbonIconEl.addClass('obsidian-lego-search-plugin-ribbon-class');

    // This adds a simple command that can be triggered anywhere
    this.addCommand({
      id: 'open-lego-search-modal',
      name: 'Create new LEGO set note',
      callback: () => this.createNewLegoNote(),
    });

    this.addCommand({
      id: 'open-lego-search-modal-to-insert',
      name: 'Insert the metadata',
      callback: () => this.insertMetadata(),
    });

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new LegoSearchSettingTab(this.app, this));

    console.log(`LEGO Set Search: version ${this.manifest.version} (requires obsidian ${this.manifest.minAppVersion})`);
  }

  showNotice(message: unknown) {
    try {
      new Notice(message?.toString());
    } catch {
      // eslint-disable
    }
  }

  // open modal for LEGO set search
  async searchLegoSetMetadata(query?: string): Promise<LegoSet> {
    const searchedSets = await this.openLegoSearchModal(query);
    return await this.openLegoSuggestModal(searchedSets);
  }

  async getRenderedContents(legoSet: LegoSet) {
    const {
      templateFile,
      useDefaultFrontmatter,
      defaultFrontmatterKeyType,
      enableCoverImageSave,
      coverImagePath,
      frontmatter, // @deprecated
      content, // @deprecated
    } = this.settings;

    let contentBody = '';

    if (enableCoverImageSave) {
      const boxArtUrl = legoSet.set_img_url;
      if (boxArtUrl) {
        const imageName = makeFileName(legoSet, this.settings.fileNameFormat, 'jpg');
        legoSet.localCoverImage = await this.downloadAndSaveImage(imageName, coverImagePath, boxArtUrl);
      }
    }

    if (templateFile) {
      const templateContents = await getTemplateContents(this.app, templateFile);
      const replacedVariable = replaceVariableSyntax(legoSet, applyTemplateTransformations(templateContents));
      contentBody += executeInlineScriptsTemplates(legoSet, replacedVariable);
    } else {
      let replacedVariableFrontmatter = replaceVariableSyntax(legoSet, frontmatter); // @deprecated
      if (useDefaultFrontmatter) {
        replacedVariableFrontmatter = toStringFrontMatter(
          applyDefaultFrontMatter(legoSet, replacedVariableFrontmatter, defaultFrontmatterKeyType),
        );
      }
      const replacedVariableContent = replaceVariableSyntax(legoSet, content);
      contentBody += replacedVariableFrontmatter
        ? `---\n${replacedVariableFrontmatter}\n---\n${replacedVariableContent}`
        : replacedVariableContent;
    }

    return contentBody;
  }

  async downloadAndSaveImage(imageName: string, directory: string, imageUrl: string): Promise<string> {
    const { enableCoverImageSave } = this.settings;
    if (!enableCoverImageSave) {
      console.warn('Box art saving is not enabled.');
      return '';
    }

    try {
      // Use Obsidian's requestUrl method to fetch the image data:
      const response = await requestUrl({
        url: imageUrl,
        method: 'GET',
        headers: {
          Accept: 'image/*',
        },
      });

      if (response.status !== 200) {
        throw new Error(`Failed to download image: ${response.status}`);
      }

      const imageData = response.arrayBuffer;
      const filePath = `${directory}/${imageName}`;
      await this.app.vault.adapter.writeBinary(filePath, imageData);
      return filePath;
    } catch (error) {
      console.error('Error downloading or saving image:', error);
      return '';
    }
  }

  async insertMetadata(): Promise<void> {
    try {
      const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
      if (!markdownView) {
        console.warn('Can not find an active markdown view');
        return;
      }

      // TODO: Try using a search query on the selected text
      const legoSet = await this.searchLegoSetMetadata(markdownView.file.basename);

      if (!markdownView.editor) {
        console.warn('Can not find editor from the active markdown view');
        return;
      }

      const renderedContents = await this.getRenderedContents(legoSet);
      markdownView.editor.replaceRange(renderedContents, { line: 0, ch: 0 });
    } catch (err) {
      console.warn(err);
      this.showNotice(err);
    }
  }

  async createNewLegoNote(): Promise<void> {
    try {
      const legoSet = await this.searchLegoSetMetadata();
      const renderedContents = await this.getRenderedContents(legoSet);

      // TODO: If the same file exists, it asks if you want to overwrite it.
      // create new File
      const fileName = makeFileName(legoSet, this.settings.fileNameFormat);
      const filePath = `${this.settings.folder}/${fileName}`;
      const targetFile = await this.app.vault.create(filePath, renderedContents);

      // if use Templater plugin
      await useTemplaterPluginInFile(this.app, targetFile);
      this.openNewLegoNote(targetFile);
    } catch (err) {
      console.warn(err);
      this.showNotice(err);
    }
  }

  async openNewLegoNote(targetFile: TFile) {
    if (!this.settings.openPageOnCompletion) return;

    // open file
    const activeLeaf = this.app.workspace.getLeaf();
    if (!activeLeaf) {
      console.warn('No active leaf');
      return;
    }

    await activeLeaf.openFile(targetFile, { state: { mode: 'source' } });
    activeLeaf.setEphemeralState({ rename: 'all' });
    // cursor focus
    await new CursorJumper(this.app).jumpToNextCursorLocation();
  }

  async openLegoSearchModal(query = ''): Promise<LegoSet[]> {
    return new Promise((resolve, reject) => {
      return new LegoSearchModal(this, query, (error, results) => {
        return error ? reject(error) : resolve(results);
      }).open();
    });
  }

  async openLegoSuggestModal(legoSets: LegoSet[]): Promise<LegoSet> {
    return new Promise((resolve, reject) => {
      return new LegoSuggestModal(this.app, this.settings.showCoverImageInSearch, legoSets, (error, selectedSet) => {
        return error ? reject(error) : resolve(selectedSet);
      }).open();
    });
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
