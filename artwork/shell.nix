let
  pkgs = import (fetchTarball "https://channels.nixos.org/nixpkgs-23.05-darwin/nixexprs.tar.xz") { };

in pkgs.mkShell {
  buildInputs = [
    pkgs.imagemagick
  ];
}
