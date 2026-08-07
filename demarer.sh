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
GEAR="⚙"
DATABASE="🗄"
PACKAGE="📦"
ROCKET="🚀"
WARNING="⚠"
KEY="🔑"
DB="📋"
OS_ICON="💻"

clear
echo ""
echo -e "${BLUE}${BOLD}  ╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}${BOLD}  ║${NC}  ${WHITE}${BOLD}EduManage - Démarrage Automatique${NC}${BLUE}${BOLD}       ║${NC}"
echo -e "${BLUE}${BOLD}  ╚════════════════════════════════════════════╝${NC}"
echo ""

# Étape 0 : Détection du système
echo -e "${YELLOW}${OS_ICON}  Détection du système d'exploitation...${NC}"
OS="unknown"
PKG_MANAGER=""
MYSQL_CMD="mysql"
IS_WINDOWS=false
XAMPP_INSTALLED=false

if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]] || [[ -n "$WINDIR" ]]; then
    OS="windows"
    IS_WINDOWS=true
elif [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    # Détection des dérivés Debian
    case $ID in
        kali|parrot|linuxmint|elementary|pop|zorin|mx|deepin) PKG_MANAGER="apt" ;;
        ubuntu|debian) PKG_MANAGER="apt" ;;
        fedora|centos|rhel|rocky|alma) PKG_MANAGER="dnf" ;;
        arch|manjaro|endeavouros|garuda) PKG_MANAGER="pacman" ;;
        opensuse*) PKG_MANAGER="zypper" ;;
    esac
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
    PKG_MANAGER="brew"
fi

case $OS in
    ubuntu|debian|kali|parrot|linuxmint|elementary|pop|zorin|mx|deepin)
        echo -e "${GREEN}  ${CHECK} Linux ($OS - Debian/Ubuntu based)${NC}"
        ;;
    fedora|centos|rhel|rocky|alma)
        echo -e "${GREEN}  ${CHECK} Linux ($OS - RedHat based)${NC}"
        ;;
    arch|manjaro|endeavouros|garuda)
        echo -e "${GREEN}  ${CHECK} Linux ($OS - Arch based)${NC}"
        ;;
    opensuse*)
        echo -e "${GREEN}  ${CHECK} Linux ($OS - OpenSUSE)${NC}"
        ;;
    macos)
        echo -e "${GREEN}  ${CHECK} macOS${NC}"
        ;;
    windows)
        echo -e "${GREEN}  ${CHECK} Windows${NC}"
        ;;
    *)
        echo -e "${YELLOW}  ${WARNING} Système : $OS (tentative avec apt)${NC}"
        PKG_MANAGER="apt"
        ;;
esac
echo ""

# Étape 1 : Vérification Node.js
echo -e "${YELLOW}${GEAR}  Vérification de Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}  ${CROSS} Node.js non installé${NC}"
    if [ "$IS_WINDOWS" = true ]; then
        echo -e "${CYAN}  ${ARROW} Installation silencieuse de Node.js...${NC}"
        NODE_URL="https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi"
        curl -o "$TEMP/node-installer.msi" "$NODE_URL" 2>/dev/null
        msiexec /i "$TEMP/node-installer.msi" /quiet /norestart 2>/dev/null
        export PATH="$PATH:/c/Program Files/nodejs"
    else
        echo -e "${YELLOW}  ${ARROW} Installez Node.js : https://nodejs.org${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}  ${CHECK} Node.js $(node -v)${NC}"
echo ""

# Étape 2 : Dépendances backend
echo -e "${YELLOW}${PACKAGE}  Dépendances backend...${NC}"
cd backend 2>/dev/null || { echo -e "${RED}  ${CROSS} Dossier backend introuvable${NC}"; exit 1; }
if [ ! -d "node_modules" ]; then
    echo -e "${CYAN}  ${ARROW} Installation des packages...${NC}"
    npm install
    [ $? -eq 0 ] && echo -e "${GREEN}  ${CHECK} Packages installés${NC}" || { echo -e "${RED}  ${CROSS} Échec${NC}"; cd ..; exit 1; }
else
    echo -e "${GREEN}  ${CHECK} Déjà installés${NC}"
fi
cd ..
echo ""

# Étape 3 : Installation MySQL
echo -e "${YELLOW}${DATABASE}  Configuration MySQL...${NC}"

install_mysql_linux() {
    case $PKG_MANAGER in
        apt)
            echo -e "${CYAN}  ${ARROW} Installation via apt...${NC}"
            sudo apt update -qq 2>/dev/null
            sudo apt install -y mysql-server mariadb-server 2>/dev/null
            sudo systemctl start mysql 2>/dev/null || sudo systemctl start mariadb 2>/dev/null
            ;;
        dnf)
            sudo dnf install -y mysql-server 2>/dev/null
            sudo systemctl start mysqld 2>/dev/null
            ;;
        pacman)
            sudo pacman -S --noconfirm mysql 2>/dev/null
            sudo systemctl start mysqld 2>/dev/null
            ;;
        zypper)
            sudo zypper install -y mysql-server 2>/dev/null
            sudo systemctl start mysql 2>/dev/null
            ;;
    esac
}

install_mysql_macos() {
    if ! command -v brew &> /dev/null; then
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)" 2>/dev/null
    fi
    brew install mysql 2>/dev/null
    brew services start mysql 2>/dev/null
}

install_mysql_windows() {
    echo -e "${CYAN}  ${ARROW} Installation de MySQL portable...${NC}"
    MYSQL_URL="https://dev.mysql.com/get/Downloads/MySQL-8.0/mysql-8.0.36-winx64.zip"
    MYSQL_DIR="$USERPROFILE/mysql"
    if [ ! -d "$MYSQL_DIR/bin" ]; then
        mkdir -p "$MYSQL_DIR"
        curl -L -o "$TEMP/mysql.zip" "$MYSQL_URL" 2>/dev/null
        unzip -o "$TEMP/mysql.zip" -d "$TEMP/mysql_extract" 2>/dev/null
        mv "$TEMP/mysql_extract"/*/* "$MYSQL_DIR/" 2>/dev/null
        rm -rf "$TEMP/mysql.zip" "$TEMP/mysql_extract"
        "$MYSQL_DIR/bin/mysqld" --initialize-insecure --datadir="$MYSQL_DIR/data" 2>/dev/null
    fi
    "$MYSQL_DIR/bin/mysqld" --datadir="$MYSQL_DIR/data" --port=3306 &
    sleep 3
    MYSQL_CMD="$MYSQL_DIR/bin/mysql"
}

# Vérifier si MySQL/MariaDB existe
MYSQL_FOUND=false
if command -v mysql &> /dev/null; then
    MYSQL_FOUND=true
elif command -v mariadb &> /dev/null; then
    MYSQL_CMD="mariadb"
    MYSQL_FOUND=true
elif [ -f "/opt/lampp/bin/mysql" ]; then
    MYSQL_CMD="/opt/lampp/bin/mysql"
    MYSQL_FOUND=true
    XAMPP_INSTALLED=true
elif [ -f "/usr/local/mysql/bin/mysql" ]; then
    MYSQL_CMD="/usr/local/mysql/bin/mysql"
    MYSQL_FOUND=true
elif [ "$IS_WINDOWS" = true ] && [ -f "$USERPROFILE/mysql/bin/mysql" ]; then
    MYSQL_CMD="$USERPROFILE/mysql/bin/mysql"
    MYSQL_FOUND=true
fi

if [ "$MYSQL_FOUND" = false ]; then
    echo -e "${YELLOW}  ${WARNING} MySQL non trouvé, installation...${NC}"
    case $PKG_MANAGER in
        apt|dnf|pacman|zypper) install_mysql_linux ;;
        brew) install_mysql_macos ;;
    esac
    [ "$IS_WINDOWS" = true ] && install_mysql_windows
else
    echo -e "${GREEN}  ${CHECK} MySQL/MariaDB trouvé${NC}"
fi

# Démarrage MySQL
echo -e "${CYAN}  ${ARROW} Démarrage de MySQL...${NC}"
MYSQL_STARTED=false

if [ "$XAMPP_INSTALLED" = true ]; then
    sudo /opt/lampp/lampp start 2>/dev/null &
    sleep 3
elif [ "$IS_WINDOWS" = true ] && [ -f "$USERPROFILE/mysql/bin/mysqld" ]; then
    "$USERPROFILE/mysql/bin/mysqld" --datadir="$USERPROFILE/mysql/data" --port=3306 &
    sleep 2
else
    # Essayer plusieurs méthodes
    sudo systemctl start mysql 2>/dev/null && MYSQL_STARTED=true
    [ "$MYSQL_STARTED" = false ] && sudo systemctl start mariadb 2>/dev/null && MYSQL_STARTED=true
    [ "$MYSQL_STARTED" = false ] && sudo service mysql start 2>/dev/null && MYSQL_STARTED=true
    [ "$MYSQL_STARTED" = false ] && sudo service mariadb start 2>/dev/null && MYSQL_STARTED=true
    [ "$MYSQL_STARTED" = false ] && sudo mysqld_safe --skip-grant-tables &
    sleep 3
fi

# Test connexion avec plusieurs tentatives
echo -e "${CYAN}  ${ARROW} Test de connexion...${NC}"
MAX_RETRIES=5
RETRY=0
while [ $RETRY -lt $MAX_RETRIES ]; do
    if $MYSQL_CMD -u root -e "SELECT 1;" &>/dev/null 2>&1; then
        echo -e "${GREEN}  ${CHECK} MySQL en ligne${NC}"
        break
    fi
    # Essayer avec sudo si nécessaire
    if sudo $MYSQL_CMD -u root -e "SELECT 1;" &>/dev/null 2>&1; then
        MYSQL_CMD="sudo $MYSQL_CMD"
        echo -e "${GREEN}  ${CHECK} MySQL en ligne (sudo)${NC}"
        break
    fi
    RETRY=$((RETRY+1))
    if [ $RETRY -lt $MAX_RETRIES ]; then
        echo -e "${YELLOW}  ${WARNING} Tentative $RETRY/$MAX_RETRIES...${NC}"
        sleep 2
    fi
done

if [ $RETRY -ge $MAX_RETRIES ]; then
    echo -e "${RED}  ${CROSS} Impossible de se connecter à MySQL${NC}"
    echo -e "${YELLOW}  Vérifiez que MySQL est installé et démarré${NC}"
    echo -e "${CYAN}  Sur Kali/Ubuntu : sudo systemctl start mysql${NC}"
    echo -e "${CYAN}  Ou : sudo service mysql start${NC}"
    exit 1
fi
echo ""

# Étape 4 : Base de données
echo -e "${YELLOW}${DB}  Base de données...${NC}"
DB_NAME="education"
DB_EXISTS=$($MYSQL_CMD -u root -e "SHOW DATABASES LIKE '$DB_NAME';" 2>/dev/null | grep "$DB_NAME")

if [ -z "$DB_EXISTS" ]; then
    echo -e "${CYAN}  ${ARROW} Création de '$DB_NAME'...${NC}"
    $MYSQL_CMD -u root -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}  ${CHECK} Base créée${NC}"
        for sql in "shema.sql" "seed.sql"; do
            if [ -f "../database/$sql" ]; then
                echo -e "${CYAN}  ${ARROW} Import $sql...${NC}"
                $MYSQL_CMD -u root "$DB_NAME" < "../database/$sql" 2>/dev/null
                [ $? -eq 0 ] && echo -e "${GREEN}  ${CHECK} $sql importé${NC}" || echo -e "${RED}  ${CROSS} Erreur $sql${NC}"
            fi
        done
    fi
else
    echo -e "${GREEN}  ${CHECK} Base existante${NC}"
fi

# Migration regime
REGIME_EXISTS=$($MYSQL_CMD -u root "$DB_NAME" -e "SHOW COLUMNS FROM institutions LIKE 'regime';" 2>/dev/null | grep "regime")
[ -z "$REGIME_EXISTS" ] && {
    echo -e "${CYAN}  ${ARROW} Ajout colonne regime...${NC}"
    $MYSQL_CMD -u root "$DB_NAME" -e "ALTER TABLE institutions ADD COLUMN regime ENUM('ANGLAIS','FRANCAIS') DEFAULT 'ANGLAIS' AFTER niveau;" 2>/dev/null
    echo -e "${GREEN}  ${CHECK} Colonne ajoutée${NC}"
}
echo ""

# Étape 5 : SSL
echo -e "${YELLOW}${KEY}  Certificats SSL...${NC}"
cd backend
if [ ! -f "key.pem" ] || [ ! -f "cert.pem" ]; then
    echo -e "${CYAN}  ${ARROW} Génération SSL...${NC}"
    openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost" 2>/dev/null
    [ $? -eq 0 ] && echo -e "${GREEN}  ${CHECK} SSL généré${NC}" || echo -e "${YELLOW}  ${WARNING} Mode HTTP${NC}"
else
    echo -e "${GREEN}  ${CHECK} SSL présent${NC}"
fi
echo ""

# Étape 6 : Démarrage
echo -e "${YELLOW}${ROCKET}  Démarrage du serveur...${NC}"
echo -e "${CYAN}  ${ARROW} https://localhost:3443${NC}"
echo -e "${CYAN}  ${ARROW} https://localhost:3443/api${NC}"
echo ""
echo -e "${BLUE}${BOLD}  ─────────────────────────────────────────${NC}"
echo ""

npm run dev
[ $? -ne 0 ] && { echo -e "${RED}${CROSS} Erreur démarrage${NC}"; exit 1; }