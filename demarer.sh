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
OS="unknown";PKG_MANAGER="";MYSQL_CMD="";IS_WINDOWS=false;XAMPP_INSTALLED=false
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]] || [[ -n "$WINDIR" ]]; then OS="windows";IS_WINDOWS=true
elif [ -f /etc/os-release ]; then . /etc/os-release;OS=$ID
    case $ID in ubuntu|debian|kali|parrot|linuxmint|elementary|pop|zorin|mx|deepin) PKG_MANAGER="apt";;fedora|centos|rhel|rocky|alma) PKG_MANAGER="dnf";;arch|manjaro|endeavouros|garuda) PKG_MANAGER="pacman";;opensuse*) PKG_MANAGER="zypper";;esac
elif [[ "$OSTYPE" == "darwin"* ]]; then OS="macos";PKG_MANAGER="brew";fi
case $OS in ubuntu|debian|kali|parrot|linuxmint|elementary|pop|zorin|mx|deepin) echo -e "${GREEN}  ${CHECK} Linux ($OS)${NC}";;fedora|centos|rhel|rocky|alma) echo -e "${GREEN}  ${CHECK} Linux ($OS)${NC}";;arch|manjaro|endeavouros|garuda) echo -e "${GREEN}  ${CHECK} Linux ($OS)${NC}";;opensuse*) echo -e "${GREEN}  ${CHECK} Linux ($OS)${NC}";;macos) echo -e "${GREEN}  ${CHECK} macOS${NC}";;windows) echo -e "${GREEN}  ${CHECK} Windows${NC}";;*) echo -e "${YELLOW}  ${WARNING} $OS (fallback apt)${NC}";PKG_MANAGER="apt";;esac
echo ""

# Node.js
echo -e "${YELLOW}${GEAR}  Vérification Node.js...${NC}"
if ! command -v node &> /dev/null; then
    if [ "$IS_WINDOWS" = true ]; then echo -e "${CYAN}  ${ARROW} Installation Node.js...${NC}";curl -o "$TEMP/node-installer.msi" "https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi" 2>/dev/null;msiexec /i "$TEMP/node-installer.msi" /quiet /norestart 2>/dev/null;export PATH="$PATH:/c/Program Files/nodejs"
    else echo -e "${YELLOW}  Installez Node.js : https://nodejs.org${NC}";exit 1;fi
fi
echo -e "${GREEN}  ${CHECK} Node.js $(node -v)${NC}"
echo ""

# Dépendances backend
echo -e "${YELLOW}${PACKAGE}  Dépendances backend...${NC}"
cd backend 2>/dev/null || { echo -e "${RED}  ${CROSS} Dossier backend introuvable${NC}";exit 1;}
[ ! -d "node_modules" ] && { echo -e "${CYAN}  ${ARROW} Installation packages...${NC}";npm install;[ $? -ne 0 ] && { echo -e "${RED}  ${CROSS} Échec${NC}";cd ..;exit 1;};} || echo -e "${GREEN}  ${CHECK} Déjà installés${NC}"
cd ..
echo ""

# MySQL/MariaDB/XAMPP
echo -e "${YELLOW}${DATABASE}  Configuration base de données...${NC}"

if [ -f "/opt/lampp/lampp" ]; then
    echo -e "${GREEN}  ${CHECK} XAMPP trouvé${NC}"
    echo -e "${CYAN}  ${ARROW} Démarrage XAMPP...${NC}"
    sudo /opt/lampp/lampp start 2>/dev/null &
    sleep 3
    MYSQL_CMD="sudo /opt/lampp/bin/mysql"
    XAMPP_INSTALLED=true
elif [ -f "/usr/local/mysql/bin/mysql" ]; then
    MYSQL_CMD="sudo /usr/local/mysql/bin/mysql"
elif [ "$IS_WINDOWS" = true ] && [ -f "$USERPROFILE/mysql/bin/mysql" ]; then
    MYSQL_CMD="$USERPROFILE/mysql/bin/mysql"
else
    if command -v mariadb &> /dev/null; then MYSQL_CMD="sudo mariadb"
    elif command -v mysql &> /dev/null; then MYSQL_CMD="sudo mysql"
    else
        echo -e "${YELLOW}  ${WARNING} Installation MariaDB...${NC}"
        case $PKG_MANAGER in
            apt) sudo apt update -qq 2>/dev/null;sudo apt install -y mariadb-server 2>/dev/null;;
            dnf) sudo dnf install -y mysql-server 2>/dev/null;;
            pacman) sudo pacman -S --noconfirm mysql 2>/dev/null;;
            zypper) sudo zypper install -y mysql-server 2>/dev/null;;
            brew) brew install mysql 2>/dev/null;brew services start mysql 2>/dev/null;;
        esac
        command -v mariadb &> /dev/null && MYSQL_CMD="sudo mariadb" || MYSQL_CMD="sudo mysql"
    fi
    echo -e "${CYAN}  ${ARROW} Démarrage MariaDB/MySQL...${NC}"
    sudo systemctl stop mysql 2>/dev/null;sudo systemctl stop mariadb 2>/dev/null
    sudo killall mysqld 2>/dev/null;sudo killall mariadbd 2>/dev/null
    sleep 1
    sudo systemctl start mariadb 2>/dev/null || sudo systemctl start mysql 2>/dev/null
    sleep 3
    if ! sudo systemctl is-active --quiet mariadb 2>/dev/null && ! sudo systemctl is-active --quiet mysql 2>/dev/null; then
        sudo mkdir -p /var/run/mysqld 2>/dev/null;sudo chown mysql:mysql /var/run/mysqld 2>/dev/null
        sudo mariadbd-safe --skip-grant-tables --skip-networking &>/dev/null &
        sleep 3
    fi
fi

# Test connexion avec délai initial
echo -e "${CYAN}  ${ARROW} Attente démarrage (3s)...${NC}"
sleep 3
echo -e "${CYAN}  ${ARROW} Test connexion...${NC}"
CONNECTED=false
for i in {1..5}; do
    if $MYSQL_CMD -e "SELECT 1;" &>/dev/null 2>&1; then CONNECTED=true;echo -e "${GREEN}  ${CHECK} Connecté${NC}";break;fi
    if $MYSQL_CMD --socket=/var/run/mysqld/mysqld.sock -e "SELECT 1;" &>/dev/null 2>&1; then MYSQL_CMD="$MYSQL_CMD --socket=/var/run/mysqld/mysqld.sock";CONNECTED=true;echo -e "${GREEN}  ${CHECK} Connecté (socket)${NC}";break;fi
    [ $i -lt 5 ] && { echo -e "${YELLOW}  ${WARNING} Tentative $i/5...${NC}";sleep 2;}
done
[ "$CONNECTED" = false ] && { echo -e "${RED}  ${CROSS} Échec connexion. Commandes : sudo systemctl start mariadb${NC}";exit 1;}
echo ""

# Base de données
echo -e "${YELLOW}${DB}  Base de données...${NC}"
DB_NAME="education"
DB_EXISTS=$($MYSQL_CMD -e "SHOW DATABASES LIKE '$DB_NAME';" 2>/dev/null | grep "$DB_NAME")
if [ -z "$DB_EXISTS" ]; then
    echo -e "${CYAN}  ${ARROW} Création '$DB_NAME'...${NC}"
    $MYSQL_CMD -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}  ${CHECK} Base créée${NC}"
        for sql in "shema.sql" "seed.sql"; do
            if [ -f "../database/$sql" ]; then
                echo -e "${CYAN}  ${ARROW} Import $sql...${NC}"
                $MYSQL_CMD "$DB_NAME" < "../database/$sql" 2>/dev/null
                [ $? -eq 0 ] && echo -e "${GREEN}  ${CHECK} $sql importé${NC}" || echo -e "${RED}  ${CROSS} Erreur $sql${NC}"
            fi
        done
    fi
else echo -e "${GREEN}  ${CHECK} Base existante${NC}";fi

# Migration regime
$MYSQL_CMD "$DB_NAME" -e "SHOW COLUMNS FROM institutions LIKE 'regime';" 2>/dev/null | grep -q "regime" || {
    echo -e "${CYAN}  ${ARROW} Ajout colonne regime...${NC}"
    $MYSQL_CMD "$DB_NAME" -e "ALTER TABLE institutions ADD COLUMN regime ENUM('ANGLAIS','FRANCAIS') DEFAULT 'ANGLAIS' AFTER niveau;" 2>/dev/null
    echo -e "${GREEN}  ${CHECK} Colonne ajoutée${NC}"
}
echo ""

# SSL
echo -e "${YELLOW}${KEY}  Certificats SSL...${NC}"
cd backend
if [ ! -f "key.pem" ] || [ ! -f "cert.pem" ]; then
    echo -e "${CYAN}  ${ARROW} Génération SSL...${NC}"
    openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost" 2>/dev/null
    [ $? -eq 0 ] && echo -e "${GREEN}  ${CHECK} SSL généré${NC}" || echo -e "${YELLOW}  ${WARNING} Mode HTTP${NC}"
else echo -e "${GREEN}  ${CHECK} SSL présent${NC}";fi
echo ""

# Démarrage serveur
echo -e "${YELLOW}${ROCKET}  Démarrage du serveur...${NC}"
echo -e "${CYAN}  ${ARROW} https://localhost:3443${NC}"
echo -e "${CYAN}  ${ARROW} https://localhost:3443/api${NC}"
echo -e "${BLUE}${BOLD}  ─────────────────────────────────────────${NC}"
echo ""
npm run dev
[ $? -ne 0 ] && { echo -e "${RED}${CROSS} Erreur démarrage${NC}";exit 1;}