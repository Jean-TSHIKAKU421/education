#!/bin/bash
RED='\033[0;31m';GREEN='\033[0;32m';YELLOW='\033[1;33m';BLUE='\033[0;34m';CYAN='\033[0;36m';WHITE='\033[1;37m';NC='\033[0m';BOLD='\033[1m'
CHECK="✓";CROSS="✗";ARROW="→";GEAR="⚙";DATABASE="🗄";PACKAGE="📦";ROCKET="🚀";WARNING="⚠";KEY="🔑";DB="📋";OS_ICON="💻"

clear
echo ""
echo -e "${BLUE}${BOLD}  ╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}${BOLD}  ║${NC}  ${WHITE}${BOLD}EduManage - Démarrage Automatique${NC}${BLUE}${BOLD}       ║${NC}"
echo -e "${BLUE}${BOLD}  ╚════════════════════════════════════════════╝${NC}"
echo ""

# Détection OS
echo -e "${YELLOW}${OS_ICON}  Détection du système...${NC}"
OS="unknown";PKG_MANAGER="";IS_WINDOWS=false
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]] || [[ -n "$WINDIR" ]]; then OS="windows";IS_WINDOWS=true
elif [ -f /etc/os-release ]; then . /etc/os-release;OS=$ID
    case $ID in ubuntu|debian|kali|parrot|linuxmint|elementary|pop|zorin|mx|deepin) PKG_MANAGER="apt";;fedora|centos|rhel|rocky|alma) PKG_MANAGER="dnf";;arch|manjaro|endeavouros|garuda) PKG_MANAGER="pacman";;opensuse*) PKG_MANAGER="zypper";;esac
elif [[ "$OSTYPE" == "darwin"* ]]; then OS="macos";PKG_MANAGER="brew";fi
echo -e "${GREEN}  ${CHECK} $OS${NC}"
echo ""

# Node.js
echo -e "${YELLOW}${GEAR}  Vérification Node.js...${NC}"
command -v node &> /dev/null || { echo -e "${RED}  ${CROSS} Node.js requis${NC}";exit 1;}
echo -e "${GREEN}  ${CHECK} Node.js $(node -v)${NC}"
echo ""

# Dépendances backend
echo -e "${YELLOW}${PACKAGE}  Dépendances backend...${NC}"
cd backend 2>/dev/null || { echo -e "${RED}  ${CROSS} Dossier backend introuvable${NC}";exit 1;}
[ ! -d "node_modules" ] && { npm install;[ $? -ne 0 ] && { echo -e "${RED}  ${CROSS} Échec${NC}";cd ..;exit 1;};}
echo -e "${GREEN}  ${CHECK} Packages OK${NC}"
cd ..
echo ""

# MySQL - Tentative rapide
echo -e "${YELLOW}${DATABASE}  Base de données...${NC}"
MYSQL_CMD=""
DB_OK=false

# Chercher MySQL/MariaDB/XAMPP
if [ -f "/opt/lampp/bin/mysql" ]; then
    echo -e "${CYAN}  ${ARROW} Démarrage XAMPP...${NC}"
    sudo /opt/lampp/lampp start 2>/dev/null &
    sleep 3
    MYSQL_CMD="sudo /opt/lampp/bin/mysql"
elif command -v mariadb &> /dev/null; then
    sudo systemctl start mariadb 2>/dev/null || sudo service mariadb start 2>/dev/null
    sleep 2
    MYSQL_CMD="sudo mariadb"
elif command -v mysql &> /dev/null; then
    sudo systemctl start mysql 2>/dev/null || sudo service mysql start 2>/dev/null
    sleep 2
    MYSQL_CMD="sudo mysql"
else
    echo -e "${YELLOW}  ${WARNING} MySQL/MariaDB non trouvé - installation...${NC}"
    case $PKG_MANAGER in
        apt) sudo apt install -y mariadb-server 2>/dev/null;;
        dnf) sudo dnf install -y mysql-server 2>/dev/null;;
        pacman) sudo pacman -S --noconfirm mysql 2>/dev/null;;
        brew) brew install mysql 2>/dev/null;;
    esac
    command -v mariadb &> /dev/null && MYSQL_CMD="sudo mariadb" || MYSQL_CMD="sudo mysql"
    sudo systemctl start mariadb 2>/dev/null || sudo systemctl start mysql 2>/dev/null
    sleep 2
fi

# Test connexion rapide (max 2 tentatives)
if [ -n "$MYSQL_CMD" ]; then
    for i in 1 2; do
        if $MYSQL_CMD -e "SELECT 1;" &>/dev/null 2>&1; then DB_OK=true;break;fi
        sleep 2
    done
fi

if [ "$DB_OK" = true ]; then
    echo -e "${GREEN}  ${CHECK} MySQL connecté${NC}"
    DB_NAME="education"
    DB_EXISTS=$($MYSQL_CMD -e "SHOW DATABASES LIKE '$DB_NAME';" 2>/dev/null | grep "$DB_NAME")
    if [ -z "$DB_EXISTS" ]; then
        echo -e "${CYAN}  ${ARROW} Création base...${NC}"
        $MYSQL_CMD -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;" 2>/dev/null
        for sql in "shema.sql" "seed.sql"; do
            [ -f "../database/$sql" ] && $MYSQL_CMD "$DB_NAME" < "../database/$sql" 2>/dev/null
        done
        echo -e "${GREEN}  ${CHECK} Base prête${NC}"
    fi
    # Migration regime
    $MYSQL_CMD "$DB_NAME" -e "SHOW COLUMNS FROM institutions LIKE 'regime';" 2>/dev/null | grep -q "regime" || $MYSQL_CMD "$DB_NAME" -e "ALTER TABLE institutions ADD COLUMN regime ENUM('ANGLAIS','FRANCAIS') DEFAULT 'ANGLAIS' AFTER niveau;" 2>/dev/null
else
    echo -e "${YELLOW}  ${WARNING} MySQL inaccessible - le serveur démarrera en mode dégradé${NC}"
fi
echo ""

# SSL
echo -e "${YELLOW}${KEY}  Certificats SSL...${NC}"
cd backend
if [ ! -f "key.pem" ] || [ ! -f "cert.pem" ]; then
    openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost" 2>/dev/null
    echo -e "${GREEN}  ${CHECK} SSL généré${NC}"
else echo -e "${GREEN}  ${CHECK} SSL présent${NC}";fi
echo ""

# Démarrage
echo -e "${YELLOW}${ROCKET}  Démarrage du serveur...${NC}"
echo -e "${CYAN}  ${ARROW} https://localhost:3443${NC}"
echo -e "${BLUE}${BOLD}  ─────────────────────────────────────────${NC}"
echo ""
npm run dev