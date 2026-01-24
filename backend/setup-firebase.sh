#!/bin/bash
# ============================================================================
# Firebase Setup Guide for Push Notifications
# ============================================================================
#
# This script helps you configure Firebase Cloud Messaging (FCM) for
# sending push notifications to millions of users in Emploi+
#
# Prerequisites:
#   - Google Cloud Project with billing enabled
#   - Firebase Console access: https://console.firebase.google.com
#   - Backend running on Node.js
#
# Steps:
#   1. Create Firebase Project
#   2. Generate Service Account Key
#   3. Set Environment Variables
#   4. Install Firebase Admin SDK
#   5. Test Push Notifications

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Firebase Push Notifications Setup${NC}"
echo -e "${BLUE}========================================${NC}\n"

# ============================================================================
# STEP 1: Create Firebase Project
# ============================================================================

echo -e "${YELLOW}[1] Firebase Project Creation${NC}"
echo -e "
Go to: https://console.firebase.google.com
Click: + Create a new project
Name: emploi-connect (or your project name)
Enable Google Analytics: Optional
Click: Create Project

Wait for project to be ready...
"

read -p "Press Enter when Firebase project is created... "

# ============================================================================
# STEP 2: Generate Service Account Key
# ============================================================================

echo -e "\n${YELLOW}[2] Generate Service Account Key${NC}"
echo -e "
In Firebase Console:
  1. Click: Settings ⚙️ (top-left)
  2. Go to: Service Accounts
  3. Click: Generate New Private Key
  4. Save JSON file to: /app/firebase-service-account.json
  
The JSON will contain:
  - type: \"service_account\"
  - project_id: \"emploi-connect\"
  - private_key: \"-----BEGIN PRIVATE KEY-----...\"
  - client_email: \"firebase-adminsdk-xxx@project.iam.gserviceaccount.com\"
"

read -p "Press Enter when you've saved the JSON file... "

# ============================================================================
# STEP 3: Create backend/.env Configuration
# ============================================================================

echo -e "\n${YELLOW}[3] Update backend/.env${NC}"

if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ backend/.env not found${NC}"
    echo "Create it with these variables:"
else
    echo -e "${GREEN}✅ backend/.env found${NC}"
fi

cat << 'EOF'

Add these variables to backend/.env:

# Firebase Configuration
FIREBASE_PROJECT_ID=emploi-connect
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIB...
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@project.iam.gserviceaccount.com
FIREBASE_SERVICE_ACCOUNT_PATH=/app/firebase-service-account.json

# Or encode the entire JSON as base64:
FIREBASE_CONFIG_BASE64=$(base64 < /path/to/service-account.json)

Note: Use the values from the JSON file you downloaded

EOF

read -p "Press Enter when you've updated backend/.env... "

# ============================================================================
# STEP 4: Install Firebase Admin SDK
# ============================================================================

echo -e "\n${YELLOW}[4] Install Firebase Admin SDK${NC}"

if grep -q '"firebase-admin"' backend/package.json; then
    echo -e "${GREEN}✅ firebase-admin already installed${NC}"
else
    echo -e "Installing firebase-admin..."
    cd backend
    npm install firebase-admin --save
    cd ..
    echo -e "${GREEN}✅ firebase-admin installed${NC}"
fi

# ============================================================================
# STEP 5: Enable FCM API
# ============================================================================

echo -e "\n${YELLOW}[5] Enable Firebase Cloud Messaging API${NC}"
echo -e "
In Google Cloud Console:
  1. Go to: https://console.cloud.google.com
  2. Select your project
  3. Search for: Cloud Messaging
  4. Click: ENABLE
  
This allows your backend to send push notifications
"

read -p "Press Enter when FCM API is enabled... "

# ============================================================================
# STEP 6: Test Firebase Connection
# ============================================================================

echo -e "\n${YELLOW}[6] Test Firebase Connection${NC}"

# Create temporary test script
cat > /tmp/test-firebase.js << 'EOF'
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

if (!serviceAccountPath) {
  console.error('❌ FIREBASE_SERVICE_ACCOUNT_PATH not set');
  process.exit(1);
}

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Service account file not found:', serviceAccountPath);
  process.exit(1);
}

try {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
  
  console.log('✅ Firebase initialized successfully');
  console.log('✅ Project ID:', serviceAccount.project_id);
  console.log('✅ Service Account Email:', serviceAccount.client_email);
  
  process.exit(0);
} catch (error) {
  console.error('❌ Firebase initialization error:', error.message);
  process.exit(1);
}
EOF

# Run test if in backend directory
if [ -f "backend/package.json" ]; then
    cd backend
    node /tmp/test-firebase.js
    cd ..
fi

# ============================================================================
# STEP 7: Configure Topic Subscriptions
# ============================================================================

echo -e "\n${YELLOW}[7] Topic-Based Delivery (Recommended)${NC}"
echo -e "
For scalable delivery to millions of users:

Topics are like \"channels\" that users subscribe to:
  - all_candidates: Send job offers to all candidates
  - senior_developers: Send to senior developers only
  - paris_location: Send to Paris-based candidates
  - react_skills: Send to React developers

Example subscription (from frontend):
  
  const messaging = firebase.messaging();
  await messaging.subscribeToTopic(token, 'all_candidates');
  await messaging.subscribeToTopic(token, 'react_skills');

Example sending (from backend):

  const message = {
    notification: {
      title: 'New Job Offer',
      body: 'Senior React Developer at TechCorp'
    },
    data: {
      jobId: 'job-123',
      companyName: 'TechCorp'
    }
  };
  
  const result = await admin.messaging().sendToTopic('react_skills', message);
  console.log('Sent to', result.successCount, 'devices');
"

# ============================================================================
# STEP 8: Generate Test Token (Web)
# ============================================================================

echo -e "\n${YELLOW}[8] Test Push Notifications${NC}"
echo -e "
To test push notifications:

1. From frontend (get registration token):
  
  const messaging = firebase.messaging();
  const token = await messaging.getToken();
  console.log('Device Token:', token);
  
  // Send this token to backend
  await fetch('/api/register-device', {
    method: 'POST',
    body: JSON.stringify({ token })
  });

2. From backend (send test notification):
  
  curl -X POST http://localhost:5000/api/notify/test \
    -H 'Content-Type: application/json' \
    -d '{
      \"tokens\": [\"device-token-from-frontend\"],
      \"title\": \"Test Notification\",
      \"body\": \"Hello from Emploi+!\"
    }'

3. Check result:
  
  {
    \"success\": true,
    \"sentCount\": 1,
    \"failedCount\": 0
  }
"

# ============================================================================
# STEP 9: Configure Web Push Manifest
# ============================================================================

echo -e "\n${YELLOW}[9] Web Push Manifest (for Web App)${NC}"
echo -e "
Create public/firebase-messaging-sw.js:

${GREEN}"

cat << 'EOF'
// Service Worker for Firebase Cloud Messaging
importScripts('https://www.gstatic.com/firebaseapps-compat.js');
importScripts('https://www.gstatic.com/firebase/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebase/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSy...',
  projectId: 'emploi-connect',
  messagingSenderId: '123456789',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);
  
  const { title, body, icon } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: icon || '/logo.png',
    badge: '/badge.png',
  });
});
EOF

echo -e "${NC}"

# ============================================================================
# STEP 10: Success Summary
# ============================================================================

echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Firebase Setup Complete!${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${GREEN}Configured Services:${NC}"
echo "  ✅ Firebase Project: emploi-connect"
echo "  ✅ Service Account Key: /app/firebase-service-account.json"
echo "  ✅ FCM API: Enabled"
echo "  ✅ Admin SDK: Installed"
echo "  ✅ Topic-based delivery: Ready"
echo "  ✅ Device token tracking: Ready"
echo ""

echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Deploy backend to Render"
echo "  2. Configure frontend to get device tokens"
echo "  3. Subscribe users to relevant topics"
echo "  4. Send push notifications via /api/notify endpoint"
echo ""

echo -e "${BLUE}Architecture:${NC}"
echo "  Backend → Firebase Admin SDK"
echo "  ↓"
echo "  Topics: all_candidates, react_skills, paris_location, etc."
echo "  ↓"
echo "  Firebase Cloud Messaging"
echo "  ↓"
echo "  Push to millions of devices (iOS, Android, Web)"
echo ""

echo -e "${YELLOW}Documentation:${NC}"
echo "  - Firebase Cloud Messaging: https://firebase.google.com/docs/cloud-messaging"
echo "  - Admin SDK: https://firebase.google.com/docs/admin/setup"
echo "  - Topics: https://firebase.google.com/docs/cloud-messaging/manage-topics"
echo ""

echo -e "${GREEN}Ready to deploy! 🚀${NC}\n"
