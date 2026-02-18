# Edu9 Career Guidance – AI College Predictor

## Problem Statement
Build a Multi-Exam College Predictor Platform with exact format matching reference sites for JEE, TGEAPCET, APEAPCET, and COMEDK entrance exams. Dark theme, animated statistics, Safe/Good/Reach classification.

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn/UI + Framer Motion
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Routing**: React Router with 5 routes

## User Personas
- Engineering aspirants (17-21 years) from India
- Parents and counselors seeking college guidance
- Students appearing for JEE, TGEAPCET, APEAPCET, COMEDK exams

## Core Requirements (Static)
1. Homepage with hero, animated stats, predictor cards
2. JEE predictor with exact format (23 IITs, 32 NITs, 26 IIITs, 47 GFTIs)
3. TGEAPCET predictor for Telangana colleges
4. APEAPCET predictor with real 43,806 cutoff records
5. COMEDK coming soon page
6. Dark theme (#0f1419 background), responsive design

## What's Been Implemented (2026-02-18)
### JEE Main Predictor (/jee)
- ✅ Exact format matching rank-matcher.preview.emergentagent.com
- ✅ 12,122 real cutoff records from uploaded files (IITs, NITs, IIITs, GFTIs)
- ✅ Form: Rank, Category (OPEN/EWS/OBC-NCL/SC/ST), Gender, Institute Type toggles, Quota
- ✅ Stats: 23 IITs, 32 NITs, 26 IIITs, 47 GFTIs, 12,122 Cutoff Records, 253 Programs
- ✅ Results table with Safe/Good/Reach tabs

### TGEAPCET Predictor (/tgeapcet)
- ✅ Exact format matching future-campus-13.preview.emergentagent.com  
- ✅ 8,100 mock cutoff records (sample data)
- ✅ Form: Rank, Category, Gender, Special Quota, Branch, District
- ✅ Stats: 13 Universities, 30 Colleges, 24 Branches

### APEAPCET Predictor (/apeapcet)
- ✅ 43,806 real cutoff records from uploaded Excel file
- ✅ 254 colleges, 70 branches, 14 districts
- ✅ Form: Rank, Category, Gender, College Type, District, Branch

### COMEDK Predictor (/comedk)
- ✅ Coming soon page with email notification
- ✅ Links to other predictors

### Homepage (/)
- ✅ Hero section with animated stats
- ✅ 4 Predictor cards with accent colors
- ✅ How It Works, Services sections

## API Endpoints
- GET /api/jee/metadata
- POST /api/jee/predict
- GET /api/tgeapcet/metadata
- POST /api/tgeapcet/predict
- GET /api/apeapcet/metadata
- POST /api/apeapcet/predict

## Prioritized Backlog
### P1 (High)
- Add real TGEAPCET data when user provides file
- Pagination for large result sets
- Export results to PDF/Excel

### P2 (Medium)
- User accounts and saved predictions
- COMEDK predictor implementation with real data
- College comparison feature

## Next Tasks
1. User to provide TGEAPCET cutoff data file
2. Implement result export functionality
3. Add college detail pages
