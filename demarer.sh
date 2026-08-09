#!/bin/bash
RED='\033[0;31m';GREEN='\033[0;32m';YELLOW='\033[1;33m';BLUE='\033[0;34m';PURPLE='\033[0;35m';CYAN='\033[0;36m';WHITE='\033[1;37m';NC='\033[0m';BOLD='\033[1m'
CHECK="✓";CROSS="✗";ARROW="→";GEAR="⚙";DATABASE="🗄";PACKAGE="📦";ROCKET="🚀";WARNING="⚠";KEY="🔑";DB="📋";OS_ICON="💻"
clear
echo ""
echo -e "${BLUE}${BOLD}  ╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}${BOLD}  ║${NC}  ${WHITE}${BOLD}EduManage - Démarrage Automatique${NC}${BLUE}${BOLD}       ║${NC}"
echo -e "${BLUE}${BOLD}  ╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}${OS_ICON}  Détection du système...${NC}"
OS="unknown";PKG_MANAGER="";MYSQL_CMD="";IS_WINDOWS=false;XAMPP_INSTALLED=false
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "win32" ]] || [[ -n "$WINDIR" ]]; then OS="windows";IS_WINDOWS=true
elif [ -f /etc/os-release ]; then . /etc/os-release;OS=$ID;case $ID in ubuntu|debian|kali|parrot|linuxmint|elementary|pop|zorin|mx|deepin) PKG_MANAGER="apt";;fedora|centos|rhel|rocky|alma) PKG_MANAGER="dnf";;arch|manjaro|endeavouros|garuda) PKG_MANAGER="pacman";;opensuse*) PKG_MANAGER="zypper";;esac
elif [[ "$OSTYPE" == "darwin"* ]]; then OS="macos";PKG_MANAGER="brew";fi
echo -e "${GREEN}  ${CHECK} $OS${NC}"
echo ""
echo -e "${YELLOW}${GEAR}  Vérification Node.js...${NC}"
command -v node &> /dev/null || { echo -e "${RED}  ${CROSS} Node.js requis${NC}";exit 1;}
echo -e "${GREEN}  ${CHECK} Node.js $(node -v)${NC}"
echo ""
echo -e "${YELLOW}${PACKAGE}  Dépendances backend...${NC}"
cd backend 2>/dev/null || { echo -e "${RED}  ${CROSS} Dossier backend introuvable${NC}";exit 1;}
[ ! -d "node_modules" ] && { npm install 2>&1 | while IFS= read -r line; do echo -e "  $line"; done;[ ${PIPESTATUS[0]} -ne 0 ] && { echo -e "${RED}  ${CROSS} Échec${NC}";cd ..;exit 1;};}
echo -e "${GREEN}  ${CHECK} Packages OK${NC}"
cd ..
echo ""
echo -e "${YELLOW}${DATABASE}  Configuration base de données...${NC}"
if [ -f "/opt/lampp/lampp" ]; then
    echo -e "${GREEN}  ${CHECK} XAMPP trouvé${NC}"
    echo -e "${CYAN}  ${ARROW} Démarrage XAMPP...${NC}"
    sudo /opt/lampp/lampp start > /tmp/xampp-output.txt 2>&1
    sleep 3
    grep -q "already running" /tmp/xampp-output.txt && echo -e "${CYAN}     XAMPP déjà en cours d'exécution${NC}"
    grep -q "Starting Apache" /tmp/xampp-output.txt && echo -e "${GREEN}     Apache démarré${NC}"
    grep -q "Starting MySQL" /tmp/xampp-output.txt && echo -e "${GREEN}     MySQL démarré${NC}"
    grep -q "Starting ProFTPD" /tmp/xampp-output.txt && echo -e "${GREEN}     ProFTPD démarré${NC}"
    rm -f /tmp/xampp-output.txt
    MYSQL_CMD="sudo /opt/lampp/bin/mysql";XAMPP_INSTALLED=true
elif command -v mariadb &> /dev/null; then MYSQL_CMD="sudo mariadb"
elif command -v mysql &> /dev/null; then MYSQL_CMD="sudo mysql"
else
    echo -e "${YELLOW}  ${WARNING} Installation MariaDB...${NC}"
    case $PKG_MANAGER in apt) sudo apt install -y mariadb-server 2>&1 | while IFS= read -r line; do echo -e "     $line"; done;;dnf) sudo dnf install -y mysql-server 2>&1 | while IFS= read -r line; do echo -e "     $line"; done;;pacman) sudo pacman -S --noconfirm mysql 2>&1 | while IFS= read -r line; do echo -e "     $line"; done;;brew) brew install mysql 2>&1 | while IFS= read -r line; do echo -e "     $line"; done;;esac
    command -v mariadb &> /dev/null && MYSQL_CMD="sudo mariadb" || MYSQL_CMD="sudo mysql"
fi
if [ "$XAMPP_INSTALLED" != true ]; then echo -e "${CYAN}  ${ARROW} Démarrage MySQL...${NC}";sudo systemctl start mariadb 2>/dev/null || sudo systemctl start mysql 2>/dev/null || sudo service mysql start 2>/dev/null;sleep 3;fi
CONNECTED=false;for i in 1 2; do if $MYSQL_CMD -e "SELECT 1;" &>/dev/null 2>&1; then CONNECTED=true;echo -e "${GREEN}  ${CHECK} MySQL connecté${NC}";break;fi;sleep 2;done
[ "$CONNECTED" = false ] && { echo -e "${YELLOW}  ${WARNING} MySQL inaccessible - mode dégradé${NC}"; }
echo ""
if [ "$CONNECTED" = true ]; then
    echo -e "${YELLOW}${DB}  Base de données...${NC}";DB_NAME="education"
    DB_EXISTS=$($MYSQL_CMD -e "SHOW DATABASES LIKE '$DB_NAME';" 2>/dev/null | grep "$DB_NAME")
    if [ -z "$DB_EXISTS" ]; then echo -e "${CYAN}  ${ARROW} Création '$DB_NAME'...${NC}";$MYSQL_CMD -e "CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;" 2>/dev/null;[ $? -eq 0 ] && echo -e "${GREEN}  ${CHECK} Base créée${NC}";for sql in "shema.sql" "seed.sql"; do [ -f "../database/$sql" ] && $MYSQL_CMD "$DB_NAME" < "../database/$sql" 2>/dev/null && echo -e "${GREEN}  ${CHECK} $sql importé${NC}"; done
    else echo -e "${GREEN}  ${CHECK} Base existante${NC}";fi
    $MYSQL_CMD "$DB_NAME" -e "SHOW COLUMNS FROM institutions LIKE 'regime';" 2>/dev/null | grep -q "regime" || { $MYSQL_CMD "$DB_NAME" -e "ALTER TABLE institutions ADD COLUMN regime ENUM('ANGLAIS','FRANCAIS') DEFAULT 'ANGLAIS' AFTER niveau;" 2>/dev/null;echo -e "${GREEN}  ${CHECK} Colonne regime à jour${NC}"; }
fi
echo ""
echo -e "${YELLOW}${KEY}  Certificats SSL...${NC}"
cd backend
if [ ! -f "key.pem" ] || [ ! -f "cert.pem" ]; then openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost" 2>/dev/null;echo -e "${GREEN}  ${CHECK} SSL généré${NC}";else echo -e "${GREEN}  ${CHECK} SSL présent${NC}";fi
echo ""
echo -e "${YELLOW}${ROCKET}  Démarrage du serveur...${NC}"
echo ""
LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}');[ -z "$LOCAL_IP" ] && LOCAL_IP="localhost"
npm run dev 2>&1 | while IFS= read -r line; do
    [ -z "$line" ] && continue
    [[ $line == *"education-backend"* ]] && continue
    [[ $line == *"nodemon"* && $line == *"watching"* ]] && continue
    [[ $line == *"nodemon"* && $line == *"extensions"* ]] && continue
    [[ $line == *"nodemon"* && $line == *"restart"* ]] && continue
    [[ $line == *"nodemon"* && $line == *"starting"* ]] && { echo -e "${CYAN}  ${ARROW} Nodemon prêt${NC}";continue; }
    [[ $line == *"nodemon"* ]] && continue
    if [[ $line == *"Connecté à la base de données"* ]]; then echo -e "${GREEN}  ${CHECK} Base de données connectée${NC}"
    elif [[ $line == *"non disponible"* ]] || [[ $line == *"mode dégradé"* ]]; then echo -e "${YELLOW}  ${WARNING} Base de données non disponible${NC}"
    elif [[ $line == *"SSL chargé"* ]] || [[ $line == *"Certificat SSL"* ]]; then echo -e "${GREEN}  ${CHECK} SSL activé${NC}"
    elif [[ $line == *"app crashed"* ]]; then echo -e "${RED}  ${CROSS} Application crashée - redémarrage...${NC}"
    elif [[ $line == *"Serveur HTTPS démarré"* ]] || [[ $line == *"Serveur HTTP démarré"* ]]; then
        PORT=$(echo "$line" | grep -o '[0-9]\+' | tail -1)
        echo "";echo -e "${GREEN}${BOLD}  ╔════════════════════════════════════════════╗${NC}";echo -e "${GREEN}${BOLD}  ║${NC}  ${WHITE}${BOLD}✅ Serveur démarré avec succès !${NC}${GREEN}${BOLD}       ║${NC}";echo -e "${GREEN}${BOLD}  ╚════════════════════════════════════════════╝${NC}";echo ""
        echo -e "${CYAN}  🌐 Local       : ${WHITE}https://localhost:${PORT}${NC}";echo -e "${CYAN}  📡 Réseau      : ${WHITE}https://${LOCAL_IP}:${PORT}${NC}";echo -e "${CYAN}  📚 API         : ${WHITE}https://localhost:${PORT}/api${NC}";echo -e "${CYAN}  🔑 Connexion   : ${WHITE}https://localhost:${PORT}/login.html${NC}";echo "";echo -e "${PURPLE}  Ctrl+C pour arrêter${NC}";echo ""
    elif [[ $line == *"Erreur"* ]] || [[ $line == *"error"* ]] || [[ $line == *"Échec"* ]] || [[ $line == *"crashed"* ]]; then echo -e "${RED}  ${CROSS} $line${NC}"
    elif [[ $line == *"⚠️"* ]] || [[ $line == *"warning"* ]] || [[ $line == *"WARN"* ]]; then echo -e "${YELLOW}  ${WARNING} $line${NC}"
    elif [[ $line == *"GET"* ]] || [[ $line == *"POST"* ]] || [[ $line == *"PUT"* ]] || [[ $line == *"DELETE"* ]]; then echo -e "${CYAN}  ${ARROW} $line${NC}"
    else echo -e "  $line";fi
done