#!/bin/bash

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'
BOLD='\033[1m'

# Symboles
CHECK="✓"
CROSS="✗"
ARROW="→"
DOWNLOAD="📥"
CLOUD="☁️"
SYNC="🔄"
SUCCESS="✨"

clear
echo ""
echo -e "${BLUE}${BOLD}  ╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}${BOLD}  ║${NC}  ${WHITE}${BOLD}EduManage - Mise à jour du projet${NC}${BLUE}${BOLD}      ║${NC}"
echo -e "${BLUE}${BOLD}  ╚════════════════════════════════════════════╝${NC}"
echo ""

# Vérification git
echo -e "${YELLOW}${SYNC}  Vérification de Git...${NC}"
if ! command -v git &> /dev/null; then
    echo -e "${RED}  ${CROSS} Git n'est pas installé${NC}"
    exit 1
fi

if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}  ${CROSS} Pas dans un dépôt Git${NC}"
    exit 1
fi
echo -e "${GREEN}  ${CHECK} Git prêt${NC}"
echo ""

# Configuration pull
echo -e "${YELLOW}${GEAR:=⚙}  Configuration du pull...${NC}"
git config pull.rebase false
echo -e "${GREEN}  ${CHECK} Mode merge configuré${NC}"
echo ""

# Branche et remote
BRANCH=$(git branch --show-current)
REMOTE=$(git remote | head -1)
echo -e "${CYAN}  ${ARROW} Remote  : ${BOLD}$REMOTE${NC}"
echo -e "${CYAN}  ${ARROW} Branche : ${BOLD}$BRANCH${NC}"
echo ""

# Étape 1 : Vérifier les changements distants
echo -e "${YELLOW}${CLOUD}  Vérification des mises à jour...${NC}"
git fetch origin "$BRANCH" 2>/dev/null

LOCAL=$(git rev-parse HEAD)
REMOTE_HASH=$(git rev-parse "origin/$BRANCH" 2>/dev/null)

if [ "$LOCAL" = "$REMOTE_HASH" ]; then
    echo -e "${GREEN}  ${CHECK} Projet déjà à jour !${NC}"
    echo ""
    echo -e "${BLUE}${BOLD}  ─────────────────────────────────────────${NC}"
    echo -e "${GREEN}${SUCCESS}${BOLD}  Aucune mise à jour disponible${NC}"
    echo -e "${BLUE}${BOLD}  ─────────────────────────────────────────${NC}"
    echo ""
    sleep 1
    exit 0
fi

# Compter les commits de retard
BEHIND=$(git rev-list HEAD..origin/"$BRANCH" --count 2>/dev/null)
if [ "$BEHIND" -gt 0 ] 2>/dev/null; then
    echo -e "${YELLOW}  ${WARNING} ${BOLD}$BEHIND${NC}${YELLOW} commit(s) en retard${NC}"
fi
echo ""

# Étape 2 : git pull
echo -e "${YELLOW}${DOWNLOAD}  Téléchargement des mises à jour...${NC}"
echo ""

# Animation pull
git pull origin "$BRANCH" 2>&1 | while IFS= read -r line; do
    if [[ $line == *"Updating"* ]] || [[ $line == *"Fast-forward"* ]]; then
        echo -e "${GREEN}  ${CHECK} $line${NC}"
    elif [[ $line == *"Already up to date"* ]]; then
        echo -e "${GREEN}  ${CHECK} $line${NC}"
    elif [[ $line == *"CONFLICT"* ]] || [[ $line == *"error"* ]] || [[ $line == *"fatal"* ]]; then
        echo -e "${RED}  ${CROSS} $line${NC}"
    else
        echo -e "${CYAN}     $line${NC}"
    fi
done
PULL_EXIT=${PIPESTATUS[0]}

echo ""

# Résultat
if [ $PULL_EXIT -eq 0 ]; then
    NEW_HASH=$(git rev-parse --short HEAD)
    echo -e "${BLUE}${BOLD}  ─────────────────────────────────────────${NC}"
    echo -e "${GREEN}${SUCCESS}${BOLD}  Projet mis à jour avec succès !${NC}"
    echo -e "${CYAN}  ${ARROW} Nouveau commit : ${BOLD}$NEW_HASH${NC}"
    
    # Afficher les derniers commits récupérés
    echo ""
    echo -e "${CYAN}${BOLD}  Derniers changements :${NC}"
    git log --oneline -3 origin/"$BRANCH" 2>/dev/null | while read line; do
        echo -e "${CYAN}     • $line${NC}"
    done
    
    echo -e "${BLUE}${BOLD}  ─────────────────────────────────────────${NC}"
    echo ""
    
    # Vérifier si npm install est nécessaire
    if git diff --name-only HEAD@{1} HEAD 2>/dev/null | grep -q "package.json"; then
        echo -e "${YELLOW}  ${WARNING} package.json modifié${NC}"
        echo -e "${YELLOW}  ${ARROW} Pensez à faire : cd backend && npm install${NC}"
        echo ""
    fi
else
    echo -e "${RED}${BOLD}  ─────────────────────────────────────────${NC}"
    echo -e "${RED}${CROSS}${BOLD}  Échec de la mise à jour${NC}"
    echo -e "${RED}${BOLD}  ─────────────────────────────────────────${NC}"
    echo ""
    echo -e "${YELLOW}  Conseils :${NC}"
    echo -e "${CYAN}     • Vérifiez votre connexion internet${NC}"
    echo -e "${CYAN}     • Vérifiez vos droits d'accès${NC}"
    echo -e "${CYAN}     • En cas de conflit : git mergetool${NC}"
    echo ""
    exit 1
fi

sleep 1