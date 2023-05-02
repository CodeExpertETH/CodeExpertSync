# Code Expert Desktop

Code Expert Desktop allows syncing projects to a local file system. This allows students and lecturers to edit code with their own IDE and create local backups.

## Installation

### Linux
- Gnome requires the [Tray Icons: Reloaded](https://extensions.gnome.org/extension/2890/tray-icons-reloaded/) extension to show system trays.

## Development

### Prerequisites

- [Tauri environment](https://tauri.app/v1/guides/getting-started/prerequisites)
- [Node.js](https://nodejs.org/en)
- [Yarn](https://yarnpkg.com/getting-started/install)

### Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

### Run locally

Install or update dependencies

```shell
  yarn
```

Start the app

```shell
  yarn dev
```

### Tests

Run unit tests during development

```shell
  yarn watch:test
```

Lint the project

```shell
  yarn lint
```

Run all tests

```shell
  yarn test
```
