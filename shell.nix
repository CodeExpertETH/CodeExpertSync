let
  pkgs = import (fetchTarball "https://channels.nixos.org/nixpkgs-unstable/nixexprs.tar.xz") { };
  nodejs = pkgs.nodejs-18_x;
  yarn = pkgs.yarn.override { inherit nodejs; };
  buildInputsDarwin = if pkgs.stdenv.isDarwin then [
    pkgs.darwin.apple_sdk.frameworks.Carbon
    pkgs.darwin.apple_sdk.frameworks.Cocoa
    pkgs.darwin.apple_sdk.frameworks.WebKit
  ] else [ ];

in pkgs.mkShell {
  buildInputs = [
    pkgs.rustc
    pkgs.cargo
    pkgs.libiconv
    nodejs
    yarn
  ] ++ buildInputsDarwin;
}

