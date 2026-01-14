#!/bin/bash

# Script pour démarrer les serveurs frontend et backend

echo "🚀 Démarrage des serveurs Emploi+..."

# Démarrer le backend en arrière-plan
echo "📡 Démarrage du backend sur le port 5000..."
cd /Applications/XAMPP/xamppfiles/htdocs/Entreprises/emploi-connect-congo-main/backend
npm run dev > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Attendre un peu que le backend se lance
sleep 3

# Démarrer le frontend
echo "🎨 Démarrage du frontend sur le port 3000..."
cd /Applications/XAMPP/xamppfiles/htdocs/Entreprises/emploi-connect-congo-main
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

echo ""
echo "✅ Les deux serveurs sont en cours de démarrage!"
echo "📱 Frontend: http://localhost:3000"
echo "📡 Backend: http://localhost:5000"
echo ""
echo "Pour arrêter les serveurs:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "Logs:"
echo "  Backend:  tail -f /tmp/backend.log"
echo "  Frontend: tail -f /tmp/frontend.log"
