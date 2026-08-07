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
GIT="🔀"
CLOUD="☁️"
SUCCESS="✨"

clear
echo ""
echo -e "${BLUE}${BOLD}  ╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}${BOLD}  ║${NC}  ${WHITE}${BOLD}EduManage - Mise à jour du dépôt${NC}${BLUE}${BOLD}      ║${NC}"
echo -e "${BLUE}${BOLD}  ╚════════════════════════════════════════════╝${NC}"
echo ""

# Vérification git
echo -e "${YELLOW}${GIT}  Vérification de Git...${NC}"
if ! command -v git &> /dev/null; then
    echo -e "${RED}  ${CROSS} Git n'est pas installé${NC}"
    exit 1
fi
echo -e "${GREEN}  ${CHECK} Git $(git --version | cut -d' ' -f3)${NC}"

# Vérification dépôt
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}  ${CROSS} Pas dans un dépôt Git${NC}"
    echo -e "${YELLOW}  Initialisez avec : git init && git remote add origin <url>${NC}"
    exit 1
fi
echo ""

# Branche actuelle
BRANCH=$(git branch --show-current)
echo -e "${CYAN}  ${ARROW} Branche actuelle : ${BOLD}$BRANCH${NC}"
echo ""

# Étape 1 : git add
echo -e "${YELLOW}${GIT}  Ajout des fichiers...${NC}"
git add .
if [ $? -eq 0 ]; then
    # Compter les fichiers modifiés
    ADDED=$(git diff --cached --name-only | wc -l)
    echo -e "${GREEN}  ${CHECK} $ADDED fichier(s) ajouté(s)${NC}"
else
    echo -e "${RED}  ${CROSS} Erreur lors de l'ajout${NC}"
    exit 1
fi
echo ""

# Étape 2 : git commit
echo -e "${YELLOW}${GIT}  Création du commit...${NC}"
DATE_HEURE=$(date +"%Y-%m-%d %H:%M:%S")
COMMIT_MSG="Mise à jour - $DATE_HEURE"
git commit -m "$COMMIT_MSG" 2>/dev/null
COMMIT_RESULT=$?

if [ $COMMIT_RESULT -eq 0 ]; then
    COMMIT_HASH=$(git rev-parse --short HEAD)
    echo -e "${GREEN}  ${CHECK} Commit créé : ${BOLD}$COMMIT_HASH${NC}"
    echo -e "${CYAN}     ${COMMIT_MSG}${NC}"
elif [ $COMMIT_RESULT -eq 1 ]; then
    echo -e "${YELLOW}  ${WARNING} Rien à commiter (pas de changements)${NC}"
else
    echo -e "${RED}  ${CROSS} Erreur lors du commit${NC}"
    exit 1
fi
echo ""

# Étape 3 : git push
if [ $COMMIT_RESULT -eq 0 ] || [ $COMMIT_RESULT -eq 1 ]; then
    echo -e "${YELLOW}${CLOUD}  Envoi vers le dépôt distant...${NC}"
    
    # Vérifier si un remote existe
    REMOTE=$(git remote | head -1)
    if [ -z "$REMOTE" ]; then
        echo -e "${RED}  ${CROSS} Aucun dépôt distant configuré${NC}"
        echo -e "${YELLOW}  ${ARROW} Ajoutez un remote : git remote add origin <url>${NC}"
        exit 1
    fi
    
    echo -e "${CYAN}  ${ARROW} Remote : ${BOLD}$REMOTE${NC}"
    echo -e "${CYAN}  ${ARROW} Branche : ${BOLD}$BRANCH${NC}"
    echo ""
    
    # Animation push
    echo -ne "${CYAN}  Envoi en cours...${NC}"
    git push origin "$BRANCH" 2>&1 | while IFS= read -r line; do
        printf "\r${CYAN}  %s${NC}" "$line"
    done
    PUSH_EXIT=${PIPESTATUS[0]}
    printf "\r"
    
    if [ $PUSH_EXIT -eq 0 ]; then
        echo -e "${GREEN}  ${CHECK} Push réussi !${NC}"
    else
        echo -e "${RED}  ${CROSS} Échec du push${NC}"
        echo -e "${YELLOW}  Vérifiez votre connexion ou vos droits d'accès${NC}"
        exit 1
    fi
fi
echo ""

# Résumé
echo -e "${BLUE}${BOLD}  ─────────────────────────────────────────${NC}"
echo -e "${GREEN}${SUCCESS}${BOLD}  Dépôt synchronisé avec succès !${NC}"
echo -e "${CYAN}  ${ARROW} Branche : ${BOLD}$BRANCH${NC}"
echo -e "${CYAN}  ${ARROW} Remote  : ${BOLD}$REMOTE${NC}"
echo -e "${BLUE}${BOLD}  ─────────────────────────────────────────${NC}"
echo ""