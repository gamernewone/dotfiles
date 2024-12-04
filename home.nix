{  pkgs, ... }:

{

 nixpkgs = {
    config = {
      allowUnfree = true;
      allowUnfreePredicate = (_: true);
    };
  };
  
  # Info about the path home manager needs.
  home.username = "dogma";
  home.homeDirectory = "/home/dogma";

  # Don't change this (ever) unless the release notes allows you
  home.stateVersion = "24.05"; # Please read the comment before changing.

  # Packages
  home.packages = [
      pkgs.neovim
      pkgs.gh
      pkgs.unzip
      pkgs.dtrx
      pkgs.devenv
      pkgs.fzf
      pkgs.eza
      pkgs.fd
      pkgs.jq
      pkgs.ripgrep
      pkgs.yazi
      pkgs.lazydocker
      pkgs.glow
      pkgs.dua
      pkgs.btop
      pkgs.pureref

      # pkgs.gcc
      # pkgs.cargo
      # pkgs.cava
      # pkgs.tmux # only works on nixos
      # pkgs.kitty # only works on nixos 
      pkgs.gnupg
      # pkgs.tmux-sessionizer
      pkgs.paru
  ];

  # Dotfiles (manual)
  home.file = {
    ".config/zsh" =  { source = programs/zsh; recursive = true; };
    ".config/tmux" = {source = programs/tmux; recursive = true; };
  };


  # Programs (managed)
  programs.git = {
    enable = true;
    userName = "Fantasy Programming";
    userEmail = "freedominwork@fullmetal.anonaddy.com";
    # signing.key = "ADA372E9F6C2C4E3";
    # signing.signByDefault = true;
  };

  programs.lazygit = {
    enable = true;
    settings = {
      gui = {
        showFileTree = true;
        showListFooter = false;
        showRandomTip = false;
        showBottomLine = false;
        showCommandLog = true;
        showIcons = false;
      };
      disableStartupPopups = true;
      notARepository = "skip";
      os.edit = "nvim";
    };
  };


  programs.zsh = {
    enable = true;
    dotDir = ".config/zsh";
    initExtraFirst = "
while read file
do
  source \"$ZDOTDIR/$file.zsh\"
done <<-EOF
theme
env
aliases
utility
options
plugins
keybinds
prompt
EOF
    ";
  };

  programs.starship = {
    enable = true;
    enableZshIntegration = true;
  };

  programs.zoxide = {
    enable = true;
    enableZshIntegration = true; 
  };

  programs.direnv = {
    enable = true;
    enableZshIntegration = true;
    nix-direnv.enable = true;
  };


  # Services (managed)
  services.gpg-agent = {
    enable = true;
    defaultCacheTtl = 1800;
    enableSshSupport = true;
  };



  # Let Home Manager install and manage itself.
  programs.home-manager.enable = true;
}
