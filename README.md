# Code Expert Sync

Code Expert Sync allows syncing projects to a local file system. This allows students and lecturers to edit code with their own IDE and create local backups.

# Documentation

The documentation for Code Expert Sync can be found in the Code Expert Documentation: [Code Expert Documentation](https://docs.expert.ethz.ch/)

# Thanks

Without the following projects, Code Expert Sync would not be possible:

- AppSignal for their Application performance monitoring service: [AppSignal](https://appsignal.com/)
- Tauri for their awesome framework: [Tauri](https://tauri.app/)
- The Rust programming language: [Rust](https://www.rust-lang.org/)

# Installation

## Linux

- Gnome requires the [Tray Icons: Reloaded](https://extensions.gnome.org/extension/2890/tray-icons-reloaded/) extension to show system trays.

# Development

## Prerequisites

- [Tauri environment](https://tauri.app/v1/guides/getting-started/prerequisites)
  - Make sure to install `rustc` 1.74.x: `rustup install 1.74.1 & rustup default 1.74.1`
- [Node.js](https://nodejs.org/en)
- [Yarn](https://yarnpkg.com/getting-started/install)


### Run locally

Install or update dependencies

Create a .env file with the required variables (see .env-template).

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
