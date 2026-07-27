echo "Mise à jour du dépôt distant..."
git add .
sleep 1
clear
date_heure = $(date +"%Y-%m-%d %H:%M:%S")
git commit -m "Mise à jour du dépôt distant - $date_heure"
sleep 1
clear
git push origin main
echo "Dépôt distant mis à jour avec succès."
sleep 1
clear