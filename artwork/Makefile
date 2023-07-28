SHELL := /bin/bash

TAURI_ICONS_PATH := $(or $(TAURI_ICONS_PATH),"../src-tauri/icons")
WEB_ICONS_PATH := $(or $(WEB_ICONS_PATH),"../src/assets")

.PHONY: all build link clean

all: link

build: \
	build/icon.icns \
	build/icon.ico \
	build/icon.png \
	build/32x32.png \
	build/128x128.png \
	build/128x128@2x.png

link: build
	rsync --delete -a build/ $(TAURI_ICONS_PATH)
	rsync -a web/ $(WEB_ICONS_PATH)

clean:
	rm -rf ./build

# ---

# macOS icons file
build/icon.icns: icon.iconset/*.png
	@mkdir -p $(dir $@)
	iconutil -c icns $(dir $<) -o $@

# Linux icons
build/%.png: %.png
	cp $^ $@

# Windows ICO file
# The 32x32 size should come first for optimal display of the ICO image during development
build/icon.ico: ico/32.png ico/*.png
	@mkdir -p $(dir $@)
	convert $^ $@
