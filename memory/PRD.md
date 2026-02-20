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
3. TGEAPCET predictor with Special Quota field (PWD/CAP/NCC/Sports)
4. APEAPCET predictor with real cutoff records
5. COMEDK predictor with real allotment data
6. Dark theme (#0f1419 background), responsive design
7. College card format results matching reference design
8. Complete course/branch names displayed (not truncated)

## Latest Updates (Dec 2025)

### Dec 2025 - Gender & Quota Based Filtering
- **Gender-based filtering**: Results now filtered based on user's gender selection (Male → GEN categories, Female → GIRLS categories)
- **Unique Results (No Duplicates)**: Backend deduplication removes duplicate college-branch combinations, keeping best chance
- **Quota Type Classification**: Categories parsed to extract:
  - Base Category: OC, BC_A, BC_B, SC, ST, EWS, etc.
  - Quota Type: General, PWD, CAP (Armed Personnel), NCC, Sports
- **Quota Filter in Results**: Users can filter results by:
  - All (shows everything)
  - General (regular quota only)
  - Special Quota (PWD, CAP, NCC, Sports only)
- **Enhanced College Cards**: Now display:
  - Category badge (blue) showing base category
  - Special quota badge (purple with star) when applicable
  - District information

### Feb 2026 - Previous Updates
- **New Company Logo**: Updated to edu9 Career Guidance official logo (lighthouse/yellow theme)
- **New Data Files Processed**:
  - APEAPCET 2025: 42,611 cutoff records (247 colleges, 68 branches, 13 districts)
  - TGEAPCET 2025: 29,033 cutoff records (179 colleges, 50 branches, 11 districts)
  - COMEDK 2025: 325 cutoff records (73 colleges, 39 branches, 17 districts)
- **Updated Prediction Logic for State Exams (APEAPCET, TGEAPCET, COMEDK)**:
  - SAFE: rank ≤ 80% of closing rank
  - GOOD CHANCE: rank between 80% and closing rank (but < closing)
  - REACH: rank ≥ closing rank (up to 150%)

## What's Been Implemented

### JEE Main Predictor (/jee)
- 12,131 real JoSAA cutoff records
- **Prediction Logic**: Only shows colleges where user's rank is BETWEEN opening and closing ranks
- Classification: SAFE/GOOD/REACH based on position within range

### TGEAPCET Predictor (/tgeapcet)
- 29,033 real cutoff records (179 colleges, 50 branches, 11 districts)
- Form: Rank, Category, Gender, Special Quota, Branches, Districts

### APEAPCET Predictor (/apeapcet)
- 42,611 real cutoff records (247 colleges, 68 branches, 13 districts)
- Form: Rank, Category, Gender, College Type, District, Branch

### COMEDK Predictor (/comedk)
- 325 real allotment records (73 colleges, 39 branches, 17 districts)
- Form: Rank, Category, Gender, City, Branch

## API Endpoints
- GET /api/jee/metadata | POST /api/jee/predict
- GET /api/tgeapcet/metadata | POST /api/tgeapcet/predict
- GET /api/apeapcet/metadata | POST /api/apeapcet/predict
- GET /api/comedk/metadata | POST /api/comedk/predict

## Testing Status
- All 4 predictors: PASSED (Dec 2025)
- Quota deduplication features: PASSED (27/27 backend tests)
- Gender-based filtering: PASSED
- Quota type filter (All/General/Special): PASSED
- JEE: 12,131 records
- TGEAPCET: 29,033 records  
- APEAPCET: 42,611 records
- COMEDK: 325 records

## Prioritized Backlog
### P0 (Completed in this session)
- ✅ Gender-based filtering (Male/Female categories)
- ✅ Unique results (no duplicate college-branch combinations)
- ✅ Quota type separation (General vs Special Quota)
- ✅ Category and quota badges on college cards

### P1 (High)
- Pagination for large result sets
- Export results to PDF/Excel

### P2 (Medium)
- User accounts and saved predictions
- College comparison feature
- College detail pages
- Refactor predictor pages into shared custom hook (usePredictionEngine)

### P3 (Low)
- PWA support for mobile
- Share predictions via URL
- Historical cutoff trends
- Animation polish with Framer Motion micro-interactions
