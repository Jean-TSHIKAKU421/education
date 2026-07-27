echo "Démarrage de l'application"
sudo /opt/lampp/lampp start
sleep 1
clear
echo "Base des données démarrée avec succès"
sleep 1
clear
cd backend && npm run dev