# Obsidian LEGO Set Search Plugin

![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/anpigon/obsidian-lego-search-plugin/release.yml?logo=github)
![GitHub release (latest SemVer)](https://img.shields.io/github/v/release/anpigon/obsidian-lego-search-plugin?sort=semver)
![GitHub Downloads (all assets, all releases)](https://img.shields.io/github/downloads/anpigon/obsidian-lego-search-plugin/total)

Easily create LEGO set notes in Obsidian.

<br>

## Description

Search and create notes for LEGO sets using the Rebrickable API.

Query LEGO sets by:

- Set number (e.g., "75192-1")
- Set name (e.g., "Millennium Falcon")
- Theme (e.g., "Star Wars")

The plugin retrieves comprehensive set information including:
- Set number and name
- Release year
- Theme
- Piece count
- Box art images
- Direct link to Rebrickable

<br>

## How to install

### Prerequisites

**Get a free Rebrickable API key:**
1. Visit [Rebrickable API](https://rebrickable.com/api/)
2. Sign up for a free account
3. Generate your API key
4. Keep it handy for the plugin settings

### Installation

1. Search for "LEGO Set Search" in the Obsidian Community plugins
2. Click Install
3. Enable the plugin
4. Go to plugin settings and enter your Rebrickable API key

<br>

## Features

### Box Art Display in Search Results

Display LEGO set box art alongside search results for easier identification.

**To enable:**
1. Go to plugin settings
2. Find "Show Box Art in Search"
3. Toggle to ON

#### CSS Styling for Box Art

Add this CSS snippet to style the search results with box art:

1. Open Obsidian Settings > Appearance
2. Under CSS Snippets, click "Open snippets folder"
3. Create a new .css file and paste the snippet below
4. Enable the snippet in Obsidian

```css
.lego-suggestion-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.lego-box-art-image {
  max-width: 100px;
  max-height: 100px;
  margin-right: 10px;
  object-fit: cover;
  border-radius: 3px;
}

.lego-text-info {
  flex: 1;
}
```

<br>

## Usage

### Creating a New LEGO Set Note

1. Click the LEGO brick icon in the left ribbon, OR
2. Use command palette (Cmd/Ctrl + P) and search "Create new LEGO set note"
3. Enter set number, name, or theme in the search box
4. Select the desired set from results
5. A new note will be created with the set information

### Template Variables

Use these variables in your templates:

- `{{set_num}}` - Set number (e.g., "75192-1")
- `{{name}}` - Set name
- `{{year}}` - Release year
- `{{theme}}` - Theme name
- `{{num_parts}}` - Number of pieces
- `{{set_img_url}}` - Box art URL
- `{{set_url}}` - Rebrickable URL
- `{{localCoverImage}}` - Local path to saved box art (if enabled)

### Example Template

```markdown
---
set_num: {{set_num}}
name: {{name}}
year: {{year}}
theme: {{theme}}
pieces: {{num_parts}}
tags: [lego, {{theme}}]
---

# {{name}}

**Set Number:** {{set_num}}
**Year:** {{year}}
**Theme:** {{theme}}
**Pieces:** {{num_parts}}

![Box Art]({{set_img_url}})

## Details

[View on Rebrickable]({{set_url}})

## Building Status

- [ ] Not Started
- [ ] In Progress
- [ ] Completed

## Notes

```

### File Naming

Configure file names in settings using variables:
- Default: `{{set_num}} - {{name}}`
- Alternative: `{{year}} {{name}}`
- Theme-based: `{{theme}} - {{name}}`

<br>

## Settings

### Rebrickable API Settings
- **API Key**: Your Rebrickable API key (required)

### General Settings
- **New file location**: Folder where new notes are created
- **New file name**: Template for file names
- **Template file**: Custom template file to use

### Display Settings
- **Open New LEGO Set Note**: Auto-open notes after creation
- **Show Box Art in Search**: Display box art in search results
- **Enable Box Art Save**: Download and save box art locally
- **Box Art Image Path**: Folder for saved box art images

<br>

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

<br>

## License

MIT

<br>

## Credits

Based on the original [Obsidian Book Search Plugin](https://github.com/anpigon/obsidian-book-search-plugin) by anpigon.

Data provided by [Rebrickable](https://rebrickable.com/).
