# Edu9 Career Guidance – AI College Predictor

## Problem Statement
Build a Multi-Exam College Predictor Platform with exact format matching reference sites for JEE, TGEAPCET, APEAPCET, and COMEDK entrance exams. Dark theme, animated statistics, Safe/Good/Reach classification.

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn/UI + Framer Motion
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Routing**: React Router with 5 routes (/, /jee, /tgeapcet, /apeapcet, /comedk)

## User Personas
- Engineering aspirants (17-21 years) from India
- Parents and counselors seeking college guidance
- Students appearing for JEE, TGEAPCET, APEAPCET, COMEDK exams

## Core Requirements
1. Homepage with hero, animated stats, predictor cards, floating particles
2. JEE predictor with exact format (23 IITs, 32 NITs, 26 IIITs, 47 GFTIs)
3. TGEAPCET predictor with Special Quota field (PWD, CAP, NCC, Sports)
4. APEAPCET predictor with real 43,806 cutoff records
5. COMEDK predictor with mock data (2,888 records, 40 colleges)
6. Dark theme (#0f1419 background), responsive design
7. College card format results matching reference design:
   - Left accent border color (green=Safe, amber=Good, orange=Reach)
   - Institute type badge (IIT/NIT/IIIT/GFTI)
   - Full college name and branch with book icon
   - Three rank boxes: Opening (Round 1), Closing (Round 6), Your Rank (purple gradient)
   - Chance badge (SAFE/GOOD CHANCE/REACH) top-right
   - Search bar to filter by college or branch name
8. Complete course/branch names displayed (not truncated)

## What's Been Implemented

### Background Visuals (All Pages)
- Animated particle/dot grid background with mesh network effect
- Canvas-based particle system with floating dots and connecting lines
- Mouse interaction: particles repel from cursor, draw connection lines to mouse
- Pulsing opacity animation on each dot
- Each page has accent-colored particles (Homepage: violet, JEE: blue, TGEAPCET: emerald, APEAPCET: violet, COMEDK: orange)
- Component: `/app/frontend/src/components/ParticleBackground.jsx`

### Homepage (/)
- Hero section with animated gradient text "Dream College"
- Floating particles animation with Framer Motion
- Badge: "#1 College Prediction Platform in India"
- Stats row: 50,000+ Students, 500+ Colleges, 98% Accuracy, 100% Free
- 4 Predictor cards with accent colors, Live badge, hover animations
- How It Works (3 steps) with numbered badges
- Services section (4 cards) with hover effects
- CTA section with animated CheckCircle icon
- Shared Header with nav links and Footer with contact info

### JEE Main Predictor (/jee)
- 12,122 real cutoff records from uploaded files
- Form: Rank, Category (General/EWS/OBC-NCL/SC/ST), Gender, Institute Type toggles (IIT/NIT/IIIT/GFTI), Quota
- Stats: 23 IITs, 32 NITs, 26 IIITs, 47 GFTIs, 12,122 Cutoff Records, 253 Programs
- College card results with complete program name, institute type badge, chance badge
- Filter tabs: All, Safe, Good Chance, Reach
- Services section (8 cards)

### TGEAPCET Predictor (/tgeapcet)
- Form: Rank, Category (BC-A to ST), Gender, Special Quota (PWD/CAP/NCC/Sports), Branches, Districts
- Stats: 13 Universities, 161 Engineering Colleges, 24 Branches, 32,685 Cutoff Records
- Mini stats: 100% Free, Real Data, Instant Results
- College card results with district, branch, opening/closing rank
- Filter tabs working

### APEAPCET Predictor (/apeapcet)
- 43,806 real cutoff records
- Form: Rank, Category, Gender, College Type, District, Branch
- Stats: 254 Colleges, 70 Branches, 14 Districts, 43,806 Cutoff Records
- College card results with full branch name
- Filter tabs working

### COMEDK Predictor (/comedk)
- 2,888 MOCK cutoff records (40 colleges, 15 branches, 6 cities)
- Form: Rank, Category (GM/OBC/SC/ST), Gender, City, Branch
- Stats: 40 Colleges, 15 Branches, 6 Cities, 2,888 Cutoff Records
- College card results with filter tabs
- Mock Data label indicated

## API Endpoints
- GET /api/jee/metadata | POST /api/jee/predict
- GET /api/tgeapcet/metadata | POST /api/tgeapcet/predict
- GET /api/apeapcet/metadata | POST /api/apeapcet/predict
- GET /api/comedk/metadata | POST /api/comedk/predict

## Code Architecture
```
/app/
├── backend/
│   ├── server.py              # FastAPI, all endpoints, MongoDB data loading
│   ├── comedk_cutoffs.json    # Mock COMEDK data
│   ├── comedk_metadata.json   # COMEDK metadata
│   ├── apeapcet_cutoffs.json  # Real APEAPCET data
│   ├── jee_cutoffs.json       # Real JEE data
│   ├── tgeapcet_cutoffs.json  # TGEAPCET data
│   └── tests/test_api.py      # Backend tests
├── frontend/src/
│   ├── pages/
│   │   ├── HomePage.jsx       # Enhanced homepage with animations
│   │   ├── JEEPage.jsx        # JEE predictor with college cards
│   │   ├── TGEAPCETPage.jsx   # TGEAPCET with Special Quota
│   │   ├── APEAPCETPage.jsx   # APEAPCET predictor
│   │   └── COMEDKPage.jsx     # Full COMEDK predictor
│   ├── components/
│   │   ├── Layout.jsx              # Shared Header/Footer
│   │   ├── ParticleBackground.jsx  # Animated particle mesh background
│   │   └── ui/                     # Shadcn UI components
│   ├── App.js                 # Routes
│   └── index.css              # Global styles, animations
```

## Prioritized Backlog
### P1 (High)
- Add real TGEAPCET data when user provides file
- Add real COMEDK data when user provides file
- Pagination for large result sets
- Export results to PDF/Excel

### P2 (Medium)
- User accounts and saved predictions
- College comparison feature
- College detail pages
- Search/filter within results

### P3 (Low)
- PWA support for mobile
- Share predictions via URL
- Historical cutoff trends

## Testing Status
- All 4 predictors: PASSED
- Last updated: Feb 2026
- COMEDK uses real allotment data (325 records, 73 colleges, 39 branches)
- TGEAPCET uses real allotment data (13,746 records, 179 colleges, 50 branches)
- JEE uses real JoSAA data (12,131 records)
