let
  pkgs = import (fetchTarball "https://channels.nixos.org/nixpkgs-unstable/nixexprs.tar.xz") { };
  nodejs = pkgs.nodejs-18_x;
  yarn = pkgs.yarn.override { inherit nodejs; };
  apple_sdk = pkgs.darwin.apple_sdk_11_0;
  buildInputsDarwin = if pkgs.stdenv.isDarwin then [
    apple_sdk.frameworks.Carbon
    apple_sdk.frameworks.Cocoa
    apple_sdk.frameworks.WebKit
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

