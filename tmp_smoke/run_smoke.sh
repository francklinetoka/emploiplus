#!/usr/bin/env bash
set -euo pipefail
TS=$(date +%s)
COMP_EMAIL="smokeco+${TS}@example.com"
COMP_PASS='Password123!'
CAND_EMAIL="smokecand+${TS}@example.com"
CAND_PASS='Password123!'
WORKDIR="$(pwd)/tmp_smoke"

# prepare payloads
cat > "$WORKDIR/comp.json" <<JSON
{"email":"$COMP_EMAIL","password":"$COMP_PASS","user_type":"company","full_name":"Smoke Company","company_name":"Smoke Company SARL","country":"Congo"}
JSON

cat > "$WORKDIR/cand.json" <<JSON
{"email":"$CAND_EMAIL","password":"$CAND_PASS","user_type":"candidate","full_name":"Smoke Candidate","country":"Congo"}
JSON

curl -s -X POST -H "Content-Type: application/json" -d @"$WORKDIR/comp.json" http://localhost:5000/api/register -o "$WORKDIR/comp_res.json" || true
curl -s -X POST -H "Content-Type: application/json" -d @"$WORKDIR/cand.json" http://localhost:5000/api/register -o "$WORKDIR/cand_res.json" || true

# extract tokens using node (more likely available than jq)
COMP_TOKEN="$(node -e "const fs=require('fs');try{const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));console.log(j.token||'')}catch(e){console.log('')}" "$WORKDIR/comp_res.json")"
CAND_TOKEN="$(node -e "const fs=require('fs');try{const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));console.log(j.token||'')}catch(e){console.log('')}" "$WORKDIR/cand_res.json")"

printf '%s' "COMP_TOKEN_LEN=%s\n" "${#COMP_TOKEN}" > "$WORKDIR/summary.txt"

# create job
cat > "$WORKDIR/job.json" <<JSON
{"title":"Smoke Test Job $TS","company":"Smoke Company SARL","location":"Brazzaville","sector":"Test","type":"CDI","salary":"0","description":"Job created by smoke test","application_via_emploi":true}
JSON

if [ -n "$COMP_TOKEN" ]; then
  curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $COMP_TOKEN" -d @"$WORKDIR/job.json" http://localhost:5000/api/jobs -o "$WORKDIR/job_res.json" || true
else
  echo '{"error":"no company token"}' > "$WORKDIR/job_res.json"
fi

JOB_ID="$(node -e "const fs=require('fs');try{const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));console.log(j.job?j.job.id:'')}catch(e){console.log('')}" "$WORKDIR/job_res.json")"

# candidate applies
cat > "$WORKDIR/app.json" <<JSON
{"job_id":${JOB_ID:-null},"cv_url":"https://example.com/cv.pdf","cover_letter_url":"https://example.com/letter.pdf","additional_docs":[],"message":"Smoke candidature"}
JSON

if [ -n "$CAND_TOKEN" ]; then
  curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer $CAND_TOKEN" -d @"$WORKDIR/app.json" http://localhost:5000/api/job-applications -o "$WORKDIR/app_res.json" || true
else
  echo '{"error":"no candidate token"}' > "$WORKDIR/app_res.json"
fi

# fetch company applications
if [ -n "$COMP_TOKEN" ]; then
  curl -s -H "Authorization: Bearer $COMP_TOKEN" http://localhost:5000/api/company/applications -o "$WORKDIR/apps_fetch.json" || true
else
  echo '[]' > "$WORKDIR/apps_fetch.json"
fi

echo "DONE" > "$WORKDIR/done.txt"
