#!/bin/bash

# Git aliases
git config --global alias.s "status"
git config --global alias.ss "status --short"

# Shell aliases
echo 'alias cls="clear; ls"' >> ~/.bashrc
source ~/.bashrc
