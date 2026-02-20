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
    special_quota: Optional[str] = None
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
    quota_type: Optional[str] = None  # General or Special Quota type (PWD, CAP, NCC, Sports)
    base_category: Optional[str] = None  # Base category (OC, BC_A, SC, ST, etc.)

class PredictionResponse(BaseModel):
    total_colleges: int
    safe_count: int
    good_count: int
    reach_count: int
    predictions: List[CollegePrediction]
    general_quota_count: Optional[int] = 0
    special_quota_count: Optional[int] = 0

def calculate_chance_state_exams(user_rank, closing_rank):
    """
    Calculate admission chance for state exams (APEAPCET, TGEAPCET, COMEDK)
    - Safe: rank <= 80% of closing rank
    - Good Chance: rank between 80% and closing rank (including equal to closing)
    - Reach: rank > closing rank (strictly outside/beyond closing rank, up to 150%)
    - Hidden: rank > 150% of closing
    """
    if closing_rank == 0:
        return None, 0  # Skip invalid data
    
    percent = (user_rank / closing_rank) * 100
    
    if user_rank <= closing_rank * 0.8:
        # Safe: rank is 80% or better than closing
        return "SAFE", 90
    elif user_rank <= closing_rank:
        # Good Chance: between 80% and closing rank (including equal to closing)
        return "GOOD", 70
    elif user_rank <= closing_rank * 1.5:
        # Reach: strictly beyond closing rank (up to 150%)
        return "REACH", 35
    else:
        # Too far beyond - don't show
        return None, 0

def parse_category_info(category_str):
    """
    Parse category string to extract base category and quota type.
    Example: BC_A_CAP_GEN_OU -> base_category='BC_A', quota_type='CAP'
    Example: BC_A_GEN_OU -> base_category='BC_A', quota_type='General'
    """
    if not category_str:
        return None, "General"
    
    category_upper = category_str.upper()
    
    # Special quota keywords to check
    special_quotas = {
        'CAP': 'CAP (Armed Personnel)',
        'NCC': 'NCC',
        'PWD': 'PWD',
        'PHA': 'PWD (Hearing)',
        'PHH': 'PWD (Hearing)',
        'PHM': 'PWD (Mobility)',
        'PHV': 'PWD (Visual)',
        'SPORTS': 'Sports'
    }
    
    # Find quota type
    quota_type = "General"
    for key, label in special_quotas.items():
        if f"_{key}_" in category_upper or category_upper.endswith(f"_{key}"):
            quota_type = label
            break
    
    # Extract base category (OC, BC_A, BC_B, SC, ST, EWS, etc.)
    base_categories = ['BC_A', 'BC_B', 'BC_C', 'BC_D', 'BC_E', 'OC', 'SC_I', 'SC_II', 'SC_III', 'SC', 'ST', 'EWS']
    base_category = None
    for bc in base_categories:
        if category_upper.startswith(bc):
            base_category = bc
            break
    
    return base_category, quota_type

def remove_duplicates_and_group(predictions):
    """
    Remove duplicate results and return unique college-branch combinations.
    Keep the best chance for each unique combination.
    """
    seen = {}
    chance_priority = {"SAFE": 0, "GOOD": 1, "REACH": 2}
    
    for p in predictions:
        key = (p.institute, p.branch)
        if key not in seen:
            seen[key] = p
        else:
            # Keep the one with better chance (SAFE > GOOD > REACH)
            existing_priority = chance_priority.get(seen[key].chance, 3)
            new_priority = chance_priority.get(p.chance, 3)
            if new_priority < existing_priority:
                seen[key] = p
    
    return list(seen.values())

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
        
        if closing_rank == 0:
            continue
        
        # JEE Main Classification:
        # SAFE: rank <= closing_rank * 0.9 (within range with good margin - 90% of closing)
        # GOOD CHANCE: closing_rank * 0.9 < rank <= closing_rank (within range but near edge)
        # REACH: rank > closing_rank (outside closing rank)
        
        if req.rank <= closing_rank * 0.9:
            # User rank is well within the closing rank - safe
            chance = "SAFE"
            prob = 90
        elif req.rank <= closing_rank:
            # User rank is within range but close to closing - good chance
            chance = "GOOD"
            prob = 70
        elif req.rank <= closing_rank * 1.5:
            # User rank is outside closing but within 150% - reach
            chance = "REACH"
            prob = 35
        else:
            # Too far outside - skip this college
            continue
        
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
            institute_type=c.get('institute_type', ''),
            quota_type="General",
            base_category=c.get('seat_type', '')
        ))
    
    # Remove duplicates - keep unique college+program combinations
    predictions = remove_duplicates_and_group(predictions)
    
    predictions.sort(key=lambda x: ({"REACH": 0, "GOOD": 1, "SAFE": 2}[x.chance], x.closing_rank))
    
    return PredictionResponse(
        total_colleges=len(predictions),
        safe_count=len([p for p in predictions if p.chance == "SAFE"]),
        good_count=len([p for p in predictions if p.chance == "GOOD"]),
        reach_count=len([p for p in predictions if p.chance == "REACH"]),
        predictions=predictions[:500],
        general_quota_count=len(predictions),
        special_quota_count=0
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
    
    # Filter by gender field directly
    if req.gender:
        query["gender"] = req.gender
    
    # Build category regex based on category and special quota
    if req.category:
        # Special quota keywords to exclude for "General" or include for specific quota
        if req.special_quota and req.special_quota not in ["General", None, ""]:
            # User selected a specific special quota - include ONLY those results
            quota_map = {
                "PWD": "(PHA|PHH|PHM|PHV|PWD)",
                "CAP": "CAP",
                "NCC": "NCC",
                "Sports": "SPORTS"
            }
            if req.special_quota in quota_map:
                # Match: category containing SPECIALQUOTA
                query["category"] = {"$regex": f"^{req.category}.*{quota_map[req.special_quota]}", "$options": "i"}
            else:
                query["category"] = {"$regex": f"^{req.category}", "$options": "i"}
        else:
            # "General" selected - EXCLUDE all special quota results
            query["category"] = {"$regex": f"^{req.category}(?!.*(CAP|NCC|PHA|PHH|PHM|PHV|PWD|SPORTS))", "$options": "i"}
    
    if req.district: 
        query["district"] = req.district
    if req.branch: 
        query["branch"] = {"$regex": req.branch, "$options": "i"}
    
    cutoffs = await db.tgeapcet_cutoffs.find(query, {"_id": 0}).to_list(10000)
    
    predictions = []
    for c in cutoffs:
        closing_rank = c.get('closing_rank', 0)
        
        if closing_rank == 0:
            continue
        
        # Use standard chance calculation with Good Chance
        chance, prob = calculate_chance_state_exams(req.rank, closing_rank)
        
        if not chance:
            continue  # Too far outside
        
        # Parse category to get quota type
        base_category, quota_type = parse_category_info(c.get('category', ''))
        
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
            institute_type=c.get('institute_type', ''),
            quota_type=quota_type,
            base_category=base_category
        ))
    
    # Remove duplicates - keep unique college+branch combinations
    predictions = remove_duplicates_and_group(predictions)
    
    # Sort: REACH -> GOOD -> SAFE, then by closing rank
    predictions.sort(key=lambda x: ({"REACH": 0, "GOOD": 1, "SAFE": 2}[x.chance], x.closing_rank))
    
    # Count quotas
    general_count = len([p for p in predictions if p.quota_type == "General"])
    special_count = len([p for p in predictions if p.quota_type != "General"])
    
    return PredictionResponse(
        total_colleges=len(predictions),
        safe_count=len([p for p in predictions if p.chance == "SAFE"]),
        good_count=len([p for p in predictions if p.chance == "GOOD"]),
        reach_count=len([p for p in predictions if p.chance == "REACH"]),
        predictions=predictions[:500],
        general_quota_count=general_count,
        special_quota_count=special_count
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
    
    # Filter by gender field directly
    if req.gender:
        gender_code = "M" if req.gender.upper() in ["M", "MALE"] else "F"
        query["gender"] = gender_code
    
    # Build category regex based on category and special quota
    if req.category:
        if req.special_quota and req.special_quota not in ["General", None, ""]:
            # User selected a specific special quota - include ONLY those results
            quota_map = {
                "PWD": "(PHA|PHH|PHM|PHV|PWD)",
                "CAP": "CAP",
                "NCC": "NCC",
                "Sports": "SPORTS"
            }
            if req.special_quota in quota_map:
                query["category"] = {"$regex": f"^{req.category}.*{quota_map[req.special_quota]}", "$options": "i"}
            else:
                query["category"] = {"$regex": f"^{req.category}", "$options": "i"}
        else:
            # "General" selected - EXCLUDE all special quota results
            query["category"] = {"$regex": f"^{req.category}(?!.*(CAP|NCC|PHA|PHH|PHM|PHV|PWD|SPORTS))", "$options": "i"}
    
    if req.district: query["district"] = req.district
    if req.branch: query["branch"] = {"$regex": req.branch, "$options": "i"}
    
    cutoffs = await db.apeapcet_cutoffs.find(query, {"_id": 0}).to_list(5000)
    
    predictions = []
    for c in cutoffs:
        closing_rank = c.get('closing_rank', 0)
        chance, prob = calculate_chance_state_exams(req.rank, closing_rank)
        
        # Only include if chance is not None (within 150% threshold)
        if chance:
            # Parse category to get quota type
            base_category, quota_type = parse_category_info(c.get('category', ''))
            
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
                institute_type=c.get('institute_type', ''),
                quota_type=quota_type,
                base_category=base_category
            ))
    
    # Remove duplicates - keep unique college+branch combinations
    predictions = remove_duplicates_and_group(predictions)
    
    predictions.sort(key=lambda x: ({"REACH": 0, "GOOD": 1, "SAFE": 2}[x.chance], x.closing_rank))
    
    # Count quotas
    general_count = len([p for p in predictions if p.quota_type == "General"])
    special_count = len([p for p in predictions if p.quota_type != "General"])
    
    return PredictionResponse(
        total_colleges=len(predictions),
        safe_count=len([p for p in predictions if p.chance == "SAFE"]),
        good_count=len([p for p in predictions if p.chance == "GOOD"]),
        reach_count=len([p for p in predictions if p.chance == "REACH"]),
        predictions=predictions[:500],
        general_quota_count=general_count,
        special_quota_count=special_count
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
    # COMEDK has gender="All" in database, so don't filter by gender
    # if req.gender and req.gender != "All": query["gender"] = req.gender
    if req.district: query["district"] = req.district
    if req.branch: query["branch"] = {"$regex": req.branch, "$options": "i"}
    
    cutoffs = await db.comedk_cutoffs.find(query, {"_id": 0}).to_list(10000)
    
    predictions = []
    for c in cutoffs:
        closing_rank = c.get('closing_rank', 0)
        chance, prob = calculate_chance_state_exams(req.rank, closing_rank)
        
        # Only include if chance is not None (within 150% threshold)
        if chance:
            # Parse category to get quota type
            base_category, quota_type = parse_category_info(c.get('category', ''))
            
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
                quota_type=quota_type,
                base_category=base_category
            ))
    
    # Remove duplicates - keep unique college+branch combinations
    predictions = remove_duplicates_and_group(predictions)
    
    predictions.sort(key=lambda x: ({"REACH": 0, "GOOD": 1, "SAFE": 2}[x.chance], x.closing_rank))
    
    # Count quotas
    general_count = len([p for p in predictions if p.quota_type == "General"])
    special_count = len([p for p in predictions if p.quota_type != "General"])
    
    return PredictionResponse(
        total_colleges=len(predictions),
        safe_count=len([p for p in predictions if p.chance == "SAFE"]),
        good_count=len([p for p in predictions if p.chance == "GOOD"]),
        reach_count=len([p for p in predictions if p.chance == "REACH"]),
        predictions=predictions[:500],
        general_quota_count=general_count,
        special_quota_count=special_count
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
