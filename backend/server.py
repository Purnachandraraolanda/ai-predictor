from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class JEEPredictionRequest(BaseModel):
    rank: int
    seat_type: str
    gender: str
    institute_types: Optional[List[str]] = None
    quota: Optional[str] = None

class TGEAPCETPredictionRequest(BaseModel):
    rank: int
    category: str
    gender: str
    district: Optional[str] = None
    branch: Optional[str] = None
    special_quota: Optional[str] = None

class APEAPCETPredictionRequest(BaseModel):
    rank: int
    category: str
    gender: str
    college_type: Optional[str] = None
    district: Optional[str] = None
    branch: Optional[str] = None

class COMEDKPredictionRequest(BaseModel):
    rank: int
    category: str
    gender: str
    district: Optional[str] = None
    branch: Optional[str] = None

class CollegePrediction(BaseModel):
    institute: str
    institute_code: Optional[str] = None
    program: Optional[str] = None
    branch: Optional[str] = None
    category: Optional[str] = None
    quota: Optional[str] = None
    seat_type: Optional[str] = None
    gender: str
    opening_rank: int
    closing_rank: int
    user_rank: int
    chance: str
    probability: int
    institute_type: Optional[str] = None
    district: Optional[str] = None

class PredictionResponse(BaseModel):
    total_colleges: int
    safe_count: int
    good_count: int
    reach_count: int
    predictions: List[CollegePrediction]

def calculate_chance_state_exams(user_rank, closing_rank):
    """
    Calculate admission chance for state exams (APEAPCET, TGEAPCET)
    - Safe: rank <= 80% of closing rank
    - Good Chance: rank between 80% and 100% of closing (but less than closing)
    - Reach: rank >= closing rank (up to 150%)
    - Hidden: rank > 150% of closing
    """
    if closing_rank == 0:
        return None, 0  # Skip invalid data
    
    percent = (user_rank / closing_rank) * 100
    
    if user_rank <= closing_rank * 0.8:
        # Safe: rank is 80% or better than closing
        return "SAFE", 90
    elif user_rank < closing_rank:
        # Good Chance: between 80% and closing rank (but not at closing)
        return "GOOD", 70
    elif user_rank <= closing_rank * 1.5:
        # Reach: at or beyond closing rank (up to 150%)
        return "REACH", 35
    else:
        # Too far beyond - don't show
        return None, 0

@app.on_event("startup")
async def load_data():
    # Load APEAPCET
    if await db.apeapcet_cutoffs.count_documents({}) == 0:
        f = ROOT_DIR / 'apeapcet_cutoffs.json'
        if f.exists():
            with open(f) as file:
                data = json.load(file)
                if data: await db.apeapcet_cutoffs.insert_many(data)
                logging.info(f"Loaded {len(data)} APEAPCET records")
    
    if await db.apeapcet_metadata.count_documents({}) == 0:
        f = ROOT_DIR / 'apeapcet_metadata.json'
        if f.exists():
            with open(f) as file:
                await db.apeapcet_metadata.insert_one(json.load(file))
    
    # Load JEE
    if await db.jee_cutoffs.count_documents({}) == 0:
        f = ROOT_DIR / 'jee_cutoffs.json'
        if f.exists():
            with open(f) as file:
                data = json.load(file)
                if data: await db.jee_cutoffs.insert_many(data)
                logging.info(f"Loaded {len(data)} JEE records")
    
    if await db.jee_metadata.count_documents({}) == 0:
        f = ROOT_DIR / 'jee_metadata.json'
        if f.exists():
            with open(f) as file:
                await db.jee_metadata.insert_one(json.load(file))
    
    # Load TGEAPCET
    if await db.tgeapcet_cutoffs.count_documents({}) == 0:
        f = ROOT_DIR / 'tgeapcet_cutoffs.json'
        if f.exists():
            with open(f) as file:
                data = json.load(file)
                if data: await db.tgeapcet_cutoffs.insert_many(data)
                logging.info(f"Loaded {len(data)} TGEAPCET records")
    
    if await db.tgeapcet_metadata.count_documents({}) == 0:
        f = ROOT_DIR / 'tgeapcet_metadata.json'
        if f.exists():
            with open(f) as file:
                await db.tgeapcet_metadata.insert_one(json.load(file))
    
    # Load COMEDK
    if await db.comedk_cutoffs.count_documents({}) == 0:
        f = ROOT_DIR / 'comedk_cutoffs.json'
        if f.exists():
            with open(f) as file:
                data = json.load(file)
                if data: await db.comedk_cutoffs.insert_many(data)
                logging.info(f"Loaded {len(data)} COMEDK records")
    
    if await db.comedk_metadata.count_documents({}) == 0:
        f = ROOT_DIR / 'comedk_metadata.json'
        if f.exists():
            with open(f) as file:
                await db.comedk_metadata.insert_one(json.load(file))

@api_router.get("/")
async def root():
    return {"message": "Edu9 Career Guidance API"}

# ==================== JEE ====================
@api_router.get("/jee/metadata")
async def get_jee_metadata():
    data = await db.jee_metadata.find_one({}, {"_id": 0})
    if not data: raise HTTPException(404, "Not found")
    return data

@api_router.post("/jee/predict", response_model=PredictionResponse)
async def predict_jee(req: JEEPredictionRequest):
    query = {}
    if req.seat_type: query["seat_type"] = req.seat_type
    if req.gender: query["gender"] = req.gender
    if req.institute_types: query["institute_type"] = {"$in": req.institute_types}
    if req.quota and req.quota != "all": query["quota"] = req.quota
    
    cutoffs = await db.jee_cutoffs.find(query, {"_id": 0}).to_list(15000)
    
    predictions = []
    for c in cutoffs:
        opening_rank = c.get('opening_rank', 0)
        closing_rank = c.get('closing_rank', 0)
        
        # JEE Main: Only show colleges where user rank is between opening and closing ranks
        if opening_rank <= req.rank <= closing_rank:
            # Calculate probability based on position within the range
            if closing_rank > opening_rank:
                range_size = closing_rank - opening_rank
                position_ratio = (req.rank - opening_rank) / range_size
                # Closer to opening = higher probability (SAFE), closer to closing = lower (REACH)
                if position_ratio <= 0.33:
                    chance = "SAFE"
                    prob = int(90 - (position_ratio * 30))
                elif position_ratio <= 0.66:
                    chance = "GOOD"
                    prob = int(75 - ((position_ratio - 0.33) * 45))
                else:
                    chance = "REACH"
                    prob = int(60 - ((position_ratio - 0.66) * 45))
            else:
                chance = "GOOD"
                prob = 70
            
            predictions.append(CollegePrediction(
                institute=c.get('institute', ''),
                program=c.get('program', ''),
                quota=c.get('quota', ''),
                seat_type=c.get('seat_type', ''),
                gender=c.get('gender', ''),
                opening_rank=opening_rank,
                closing_rank=closing_rank,
                user_rank=req.rank,
                chance=chance,
                probability=max(5, min(95, prob)),
                institute_type=c.get('institute_type', '')
            ))
    
    predictions.sort(key=lambda x: ({"REACH": 0, "GOOD": 1, "SAFE": 2}[x.chance], x.closing_rank))
    
    return PredictionResponse(
        total_colleges=len(predictions),
        safe_count=len([p for p in predictions if p.chance == "SAFE"]),
        good_count=len([p for p in predictions if p.chance == "GOOD"]),
        reach_count=len([p for p in predictions if p.chance == "REACH"]),
        predictions=predictions[:500]
    )

# ==================== TGEAPCET ====================
@api_router.get("/tgeapcet/metadata")
async def get_tgeapcet_metadata():
    data = await db.tgeapcet_metadata.find_one({}, {"_id": 0})
    if not data: raise HTTPException(404, "Not found")
    return data

@api_router.post("/tgeapcet/predict", response_model=PredictionResponse)
async def predict_tgeapcet(req: TGEAPCETPredictionRequest):
    query = {}
    if req.category: query["category"] = req.category
    if req.gender: query["gender"] = req.gender
    if req.district: query["district"] = req.district
    if req.branch: query["branch"] = {"$regex": req.branch, "$options": "i"}
    
    cutoffs = await db.tgeapcet_cutoffs.find(query, {"_id": 0}).to_list(10000)
    
    predictions = []
    for c in cutoffs:
        closing_rank = c.get('closing_rank', 0)
        chance, prob = calculate_chance_state_exams(req.rank, closing_rank)
        
        # Only include if chance is not None (within 150% threshold)
        if chance:
            predictions.append(CollegePrediction(
                institute=c.get('institute', ''),
                institute_code=c.get('institute_code', ''),
                branch=c.get('branch', ''),
                category=c.get('category', ''),
                gender=c.get('gender', ''),
                district=c.get('district', ''),
                opening_rank=c.get('opening_rank', 0),
                closing_rank=closing_rank,
                user_rank=req.rank,
                chance=chance,
                probability=max(5, min(95, prob)),
                institute_type=c.get('institute_type', '')
            ))
    
    predictions.sort(key=lambda x: ({"REACH": 0, "GOOD": 1, "SAFE": 2}[x.chance], x.closing_rank))
    
    return PredictionResponse(
        total_colleges=len(predictions),
        safe_count=len([p for p in predictions if p.chance == "SAFE"]),
        good_count=len([p for p in predictions if p.chance == "GOOD"]),
        reach_count=len([p for p in predictions if p.chance == "REACH"]),
        predictions=predictions[:500]
    )

# ==================== APEAPCET ====================
@api_router.get("/apeapcet/metadata")
async def get_apeapcet_metadata():
    data = await db.apeapcet_metadata.find_one({}, {"_id": 0})
    if not data: raise HTTPException(404, "Not found")
    return data

@api_router.post("/apeapcet/predict", response_model=PredictionResponse)
async def predict_apeapcet(req: APEAPCETPredictionRequest):
    query = {}
    if req.category: query["category"] = {"$regex": f"^{req.category}", "$options": "i"}
    if req.gender:
        gender_code = "M" if req.gender.upper() in ["M", "MALE"] else "F"
        query["gender"] = gender_code
    if req.district: query["district"] = req.district
    if req.college_type: query["institute_type"] = {"$regex": req.college_type, "$options": "i"}
    if req.branch: query["branch"] = {"$regex": req.branch, "$options": "i"}
    
    cutoffs = await db.apeapcet_cutoffs.find(query, {"_id": 0}).to_list(5000)
    
    predictions = []
    for c in cutoffs:
        closing_rank = c.get('closing_rank', 0)
        chance, prob = calculate_chance_state_exams(req.rank, closing_rank)
        
        # Only include if chance is not None (within 150% threshold)
        if chance:
            predictions.append(CollegePrediction(
                institute=c.get('college_name', ''),
                institute_code=c.get('college_code', ''),
                branch=c.get('branch', ''),
                category=c.get('category', ''),
                gender=c.get('gender', ''),
                district=c.get('district', ''),
                opening_rank=c.get('opening_rank', 0),
                closing_rank=closing_rank,
                user_rank=req.rank,
                chance=chance,
                probability=max(5, min(95, prob)),
                institute_type=c.get('institute_type', '')
            ))
    
    predictions.sort(key=lambda x: ({"REACH": 0, "GOOD": 1, "SAFE": 2}[x.chance], x.closing_rank))
    
    return PredictionResponse(
        total_colleges=len(predictions),
        safe_count=len([p for p in predictions if p.chance == "SAFE"]),
        good_count=len([p for p in predictions if p.chance == "GOOD"]),
        reach_count=len([p for p in predictions if p.chance == "REACH"]),
        predictions=predictions[:500]
    )

# ==================== COMEDK ====================
@api_router.get("/comedk/metadata")
async def get_comedk_metadata():
    data = await db.comedk_metadata.find_one({}, {"_id": 0})
    if not data: raise HTTPException(404, "Not found")
    return data

@api_router.post("/comedk/predict", response_model=PredictionResponse)
async def predict_comedk(req: COMEDKPredictionRequest):
    query = {}
    if req.category: query["category"] = req.category
    if req.gender and req.gender != "All": query["gender"] = req.gender
    if req.district: query["district"] = req.district
    if req.branch: query["branch"] = {"$regex": req.branch, "$options": "i"}
    
    cutoffs = await db.comedk_cutoffs.find(query, {"_id": 0}).to_list(10000)
    
    predictions = []
    for c in cutoffs:
        closing_rank = c.get('closing_rank', 0)
        chance, prob = calculate_chance_state_exams(req.rank, closing_rank)
        
        # Only include if chance is not None (within 150% threshold)
        if chance:
            predictions.append(CollegePrediction(
                institute=c.get('college', ''),
                institute_code=c.get('college_code', ''),
                branch=c.get('branch', ''),
                category=c.get('category', ''),
                gender=c.get('gender', ''),
                district=c.get('district', ''),
                opening_rank=c.get('opening_rank', 0),
                closing_rank=closing_rank,
                user_rank=req.rank,
                chance=chance,
                probability=max(5, min(95, prob)),
            ))
    
    predictions.sort(key=lambda x: ({"REACH": 0, "GOOD": 1, "SAFE": 2}[x.chance], x.closing_rank))
    
    return PredictionResponse(
        total_colleges=len(predictions),
        safe_count=len([p for p in predictions if p.chance == "SAFE"]),
        good_count=len([p for p in predictions if p.chance == "GOOD"]),
        reach_count=len([p for p in predictions if p.chance == "REACH"]),
        predictions=predictions[:500]
    )

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

@app.on_event("shutdown")
async def shutdown():
    client.close()
