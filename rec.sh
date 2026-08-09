#!/bin/bash
RED='\033[0;31m';GREEN='\033[0;32m';YELLOW='\033[1;33m';BLUE='\033[0;34m';CYAN='\033[0;36m';WHITE='\033[1;37m';NC='\033[0m';BOLD='\033[1m'
CHECK="✓";CROSS="✗";ARROW="→";DOWNLOAD="📥";CLOUD="☁️";SYNC="🔄";SUCCESS="✨"
clear
echo ""
echo -e "${BLUE}${BOLD}  ╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}${BOLD}  ║${NC}  ${WHITE}${BOLD}EduManage - Mise à jour du projet${NC}${BLUE}${BOLD}      ║${NC}"
echo -e "${BLUE}${BOLD}  ╚════════════════════════════════════════════╝${NC}"
echo ""
command -v git &> /dev/null || { echo -e "${RED}  ${CROSS} Git non installé${NC}";exit 1; }
git rev-parse --git-dir > /dev/null 2>&1 || { echo -e "${RED}  ${CROSS} Pas dans un dépôt Git${NC}";exit 1; }
echo -e "${GREEN}  ${CHECK} Git prêt${NC}"
echo ""
git config pull.rebase false
BRANCH=$(git branch --show-current)
REMOTE=$(git remote | head -1)
echo -e "${CYAN}  ${ARROW} Remote  : ${BOLD}$REMOTE${NC}"
echo -e "${CYAN}  ${ARROW} Branche : ${BOLD}$BRANCH${NC}"
echo ""
echo -e "${YELLOW}${CLOUD}  Vérification des mises à jour...${NC}"
git fetch origin "$BRANCH" > /tmp/git-fetch-output.txt 2>&1
LOCAL=$(git rev-parse HEAD)
REMOTE_HASH=$(git rev-parse "origin/$BRANCH" 2>/dev/null)
if [ "$LOCAL" = "$REMOTE_HASH" ]; then
    echo -e "${GREEN}  ${CHECK} Projet déjà à jour !${NC}"
    echo "";echo -e "${GREEN}${SUCCESS}  Aucune mise à jour disponible${NC}";echo ""
    rm -f /tmp/git-fetch-output.txt;exit 0
fi
BEHIND=$(git rev-list HEAD..origin/"$BRANCH" --count 2>/dev/null)
[ "$BEHIND" -gt 0 ] 2>/dev/null && echo -e "${YELLOW}  ${WARNING} ${BOLD}$BEHIND${NC}${YELLOW} commit(s) en retard${NC}"
echo ""
echo -e "${YELLOW}${DOWNLOAD}  Téléchargement des mises à jour...${NC}"
echo ""
git pull origin "$BRANCH" > /tmp/git-pull-output.txt 2>&1
PULL_EXIT=$?
while IFS= read -r line; do
    [[ $line == *"Updating"* ]] && echo -e "${GREEN}  ${CHECK} $line${NC}" && continue
    [[ $line == *"Fast-forward"* ]] && echo -e "${GREEN}  ${CHECK} $line${NC}" && continue
    [[ $line == *"Already up to date"* ]] && echo -e "${GREEN}  ${CHECK} $line${NC}" && continue
    [[ $line == *"CONFLICT"* ]] || [[ $line == *"error"* ]] || [[ $line == *"fatal"* ]] && echo -e "${RED}  ${CROSS} $line${NC}" && continue
    echo -e "${CYAN}     $line${NC}"
done < /tmp/git-pull-output.txt
rm -f /tmp/git-fetch-output.txt /tmp/git-pull-output.txt
echo ""
if [ $PULL_EXIT -eq 0 ]; then
    NEW_HASH=$(git rev-parse --short HEAD)
    echo -e "${GREEN}${SUCCESS}${BOLD}  Projet mis à jour !${NC}"
    echo -e "${CYAN}  ${ARROW} Commit : ${BOLD}$NEW_HASH${NC}"
    echo ""
    echo -e "${CYAN}${BOLD}  Derniers changements :${NC}"
    git log --oneline -3 2>/dev/null | while read line; do echo -e "${CYAN}     • $line${NC}"; done
    git diff --name-only HEAD@{1} HEAD 2>/dev/null | grep -q "package.json" && echo -e "${YELLOW}  ${WARNING} package.json modifié → cd backend && npm install${NC}"
else
    echo -e "${RED}${CROSS}${BOLD}  Échec de la mise à jour${NC}"
    echo -e "${YELLOW}  Vérifiez votre connexion ou vos droits${NC}"
fi
echo ""