# Safety Pryde — Setup & Launch Guide

This is a real Expo/React Native app: background location that survives
the screen being off, real push notifications, camera capture, and a
self-triggered discreet recording mode. It's built so you can get it
running **without owning a laptop**, using cloud build services.

## 0. What you'll need (all free to start)
- A GitHub account
- An Expo account (expo.dev)
- A Firebase account (Google account is enough)
- A phone to test on (your own is fine)
- Access to *some* computer briefly to push this code to GitHub the
  first time — a library, internet café, or a friend's machine for 20
  minutes. After that, everything else can be done from a phone browser.

## 1. Get the code onto GitHub
- Create a new repo on github.com (e.g. "safety-pryde-app").
- Upload this whole folder to it. If you only have a phone: GitHub's
  web uploader (Add file > Upload files) accepts a zip's extracted
  contents in most mobile browsers, or ask whoever lends you a computer
  for those 20 minutes to run `git init && git add . && git commit -m
  "initial" && git push`.

## 2. Set up Firebase (from any browser, ~15 minutes)
Follow the numbered instructions inside `src/lib/firebaseConfig.js` —
create the project, enable Firestore, Storage, Anonymous Auth, and copy
your config values into that file.

For push notifications to actually reach the guardian's phone when
they're not looking at the app, also deploy the Cloud Function:
1. Upgrade the Firebase project to the "Blaze" plan (still free at this
   scale, but Google requires a card on file for pay-as-you-go).
2. From the Firebase console's Cloud Shell (browser-based, no laptop
   needed): `firebase deploy --only functions` after placing
   `functions/index.js` and running `npm install firebase-functions
   firebase-admin node-fetch` inside `functions/`.

## 3. Build the Android app in the cloud (no laptop needed)
This project uses **EAS Build** — Expo's cloud build service. The build
itself happens on Expo's servers, not your machine.
1. Sign up at expo.dev, create a project, and note the project ID —
   paste it into `app.json` under `extra.eas.projectId`.
2. Connect your GitHub repo to EAS from the Expo dashboard (Projects >
   your project > "Configure GitHub"). This can be done entirely from a
   phone browser.
3. Trigger a build from the dashboard — Expo builds a real, installable
   `.apk` in the cloud and gives you a link to download it directly to
   your Android phone to test, before it ever touches the Play Store.

## 4. Test with your sister before anything else
Install the APK on both your phones. Run a full session: start it,
walk around with location on, press SOS, take a photo, try discreet
mode. Fix anything broken *before* wider release — a safety app that
fails silently is worse than no app.

## 5. Submit to Google Play
1. Create a Google Play Developer account (one-time $25 fee, Google's
   requirement, not something either of us can skip).
2. From the EAS dashboard, submit the built app for Play Store review
   (`eas submit`, or the dashboard's "Submit" button — no laptop
   required if triggered from the dashboard).
3. Google's review typically takes 1–7 days. Apps requesting background
   location get *extra* scrutiny — expect to explain, in the store
   listing, exactly why the app needs it (this is standard for any
   location-sharing or safety app, not something unique to yours).

## Important notes

**On evidence.** If footage from this app might ever go to police:
don't let it be edited, compressed further, or deleted from Storage.
Keep the original file, the server-generated upload timestamp, and the
GPS location attached to it intact — that's what makes it usable as
evidence rather than just a video nobody can verify.

**On safety promises.** Be honest with anyone using this about what it
can and can't do: it needs data/wifi and a charged phone, background
location can lag by 15-20 seconds, and it is not a replacement for
calling emergency services. Say that plainly in the app itself, not
just here.

**On limitations that remain even after this build:**
- No offline/SMS fallback yet — the app is silent with no data
  connection. If you want this, look at Twilio or a local SA SMS
  gateway (Clickatell, BulkSMS) next.
- No end-to-end encryption yet — Firebase encrypts data in transit and
  at rest, but the data itself is readable by anyone with database
  access (i.e., you, as the project owner). Fine for a v1; worth
  hardening before wide public release.
