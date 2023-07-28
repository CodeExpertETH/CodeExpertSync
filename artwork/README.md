# App artwork

Generate Tauri icons from the source files available in [Figma](https://www.figma.com/file/Acv2pItP2cBiQb8m0clonp/App-Icons?type=design&node-id=3-195&mode=design&t=FyqG64wLyP65cCy7-0).

See the [Tauri icon documentation](https://tauri.app/v1/guides/features/icons/) for more info.

## Filetypes

- icon.icns = macOS
- icon.ico = Windows
- *.png = Linux

## Update the files

1. Export the files from Figma into the `/artwork` folder (Figma handles creating the subfolders),
2. Run `make` on macOS to update the icons and link them.

At the moment, this is macOS only due to the `.icns` generation.
