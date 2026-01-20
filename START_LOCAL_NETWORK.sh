#!/bin/bash

# Script pour démarrer le serveur sur le réseau local
# Remplacez 192.168.0.14 par votre adresse IP locale si nécessaire

echo "🚀 Démarrage de Emploi Connect en mode réseau local..."
echo "📍 IP locale: 192.168.0.14"
echo ""
echo "Accès:"
echo "  Frontend: http://192.168.0.14:5173"
echo "  Backend: http://192.168.0.14:5000"
echo ""

# Démarrer les deux serveurs
npm run dev --workspace backend &
BACKEND_PID=$!

npm run dev &
FRONTEND_PID=$!

echo "✅ Serveurs démarrés!"
echo "   Backend PID: $BACKEND_PID"
echo "   Frontend PID: $FRONTEND_PID"
echo ""
echo "Appuyez sur Ctrl+C pour arrêter les serveurs"

# Attendre l'interruption
wait
