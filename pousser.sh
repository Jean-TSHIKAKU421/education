#!/bin/bash
RED='\033[0;31m';GREEN='\033[0;32m';YELLOW='\033[1;33m';BLUE='\033[0;34m';CYAN='\033[0;36m';WHITE='\033[1;37m';NC='\033[0m';BOLD='\033[1m'
CHECK="✓";CROSS="✗";ARROW="→";GIT="🔀";CLOUD="☁️";SUCCESS="✨"
clear
echo ""
echo -e "${BLUE}${BOLD}  ╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}${BOLD}  ║${NC}  ${WHITE}${BOLD}EduManage - Mise à jour du dépôt${NC}${BLUE}${BOLD}      ║${NC}"
echo -e "${BLUE}${BOLD}  ╚════════════════════════════════════════════╝${NC}"
echo ""
command -v git &> /dev/null || { echo -e "${RED}  ${CROSS} Git non installé${NC}";exit 1; }
git rev-parse --git-dir > /dev/null 2>&1 || { echo -e "${RED}  ${CROSS} Pas dans un dépôt Git${NC}";exit 1; }
BRANCH=$(git branch --show-current)
REMOTE=$(git remote | head -1)
echo -e "${CYAN}  ${ARROW} Branche : ${BOLD}$BRANCH${NC}"
echo -e "${CYAN}  ${ARROW} Remote  : ${BOLD}$REMOTE${NC}"
echo ""
echo -e "${YELLOW}${GIT}  Ajout des fichiers...${NC}"
git add . 2>&1 | while IFS= read -r line; do echo -e "  $line"; done
ADDED=$(git diff --cached --name-only 2>/dev/null | wc -l)
[ $? -eq 0 ] && echo -e "${GREEN}  ${CHECK} $ADDED fichier(s) ajouté(s)${NC}" || { echo -e "${RED}  ${CROSS} Erreur${NC}";exit 1; }
echo ""
echo -e "${YELLOW}${GIT}  Création du commit...${NC}"
DATE_HEURE=$(date +"%Y-%m-%d %H:%M:%S")
git commit -m "Mise à jour - $DATE_HEURE" > /tmp/git-commit-output.txt 2>&1
COMMIT_RESULT=$?
if [ $COMMIT_RESULT -eq 0 ]; then
    COMMIT_HASH=$(git rev-parse --short HEAD)
    echo -e "${GREEN}  ${CHECK} Commit : ${BOLD}$COMMIT_HASH${NC}"
elif grep -q "nothing to commit" /tmp/git-commit-output.txt; then
    echo -e "${YELLOW}  ${WARNING} Rien à commiter${NC}"
else
    cat /tmp/git-commit-output.txt | while IFS= read -r line; do echo -e "  $line"; done
fi
rm -f /tmp/git-commit-output.txt
echo ""
if [ -n "$REMOTE" ]; then
    echo -e "${YELLOW}${CLOUD}  Envoi vers le dépôt distant...${NC}"
    git push origin "$BRANCH" > /tmp/git-push-output.txt 2>&1
    PUSH_EXIT=$?
    if [ $PUSH_EXIT -eq 0 ]; then
        while IFS= read -r line; do [[ $line == *"https"* ]] && echo -e "${CYAN}  ${ARROW} $line${NC}" || echo -e "${GREEN}  ${CHECK} $line${NC}"; done < /tmp/git-push-output.txt
    else
        while IFS= read -r line; do echo -e "${RED}  ${CROSS} $line${NC}"; done < /tmp/git-push-output.txt
    fi
    rm -f /tmp/git-push-output.txt
else
    echo -e "${YELLOW}  ${WARNING} Aucun remote configuré${NC}"
fi
echo ""
echo -e "${BLUE}${BOLD}  ─────────────────────────────────────────${NC}"
echo -e "${GREEN}${SUCCESS}${BOLD}  Dépôt synchronisé !${NC}"
echo -e "${BLUE}${BOLD}  ─────────────────────────────────────────${NC}"
echo ""