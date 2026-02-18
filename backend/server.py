from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class PredictionRequest(BaseModel):
    rank: int
    category: str
    gender: str
    college_type: Optional[str] = None
    district: Optional[str] = None
    branch: Optional[str] = None

class CollegePrediction(BaseModel):
    college_code: str
    college_name: str
    branch: str
    opening_rank: int
    closing_rank: int
    user_rank: int
    chance: str  # SAFE, GOOD, REACH
    probability: int
    district: Optional[str] = None
    institute_type: Optional[str] = None

class PredictionResponse(BaseModel):
    total_colleges: int
    safe_count: int
    good_count: int
    reach_count: int
    predictions: List[CollegePrediction]

class MetadataResponse(BaseModel):
    colleges: List[dict]
    branches: List[str]
    districts: List[str]
    categories: List[str]

# Load cutoff data on startup
@app.on_event("startup")
async def load_apeapcet_data():
    """Load APEAPCET cutoff data into MongoDB if not exists"""
    count = await db.apeapcet_cutoffs.count_documents({})
    if count == 0:
        cutoff_file = ROOT_DIR / 'apeapcet_cutoffs.json'
        if cutoff_file.exists():
            with open(cutoff_file, 'r') as f:
                cutoffs = json.load(f)
            if cutoffs:
                await db.apeapcet_cutoffs.insert_many(cutoffs)
                logging.info(f"Loaded {len(cutoffs)} APEAPCET cutoff records")
    
    # Load metadata
    meta_count = await db.apeapcet_metadata.count_documents({})
    if meta_count == 0:
        meta_file = ROOT_DIR / 'apeapcet_metadata.json'
        if meta_file.exists():
            with open(meta_file, 'r') as f:
                metadata = json.load(f)
            await db.apeapcet_metadata.insert_one(metadata)
            logging.info("Loaded APEAPCET metadata")

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Edu9 Career Guidance API"}

@api_router.get("/predictors")
async def get_predictors():
    """Get list of available predictors"""
    return {
        "predictors": [
            {
                "id": "jee",
                "name": "JEE Main",
                "description": "IITs, NITs, IIITs, GFTIs",
                "tags": ["JoSAA Counselling", "All India"],
                "accent": "#2563eb",
                "status": "active"
            },
            {
                "id": "tgeapcet",
                "name": "TGEAPCET",
                "description": "Telangana Engineering Colleges",
                "tags": ["TS EAMCET", "Telangana State"],
                "accent": "#059669",
                "status": "active"
            },
            {
                "id": "apeapcet",
                "name": "APEAPCET",
                "description": "Andhra Pradesh Engineering Colleges",
                "tags": ["APSCHE", "AP State Counselling"],
                "accent": "#7c3aed",
                "status": "active"
            },
            {
                "id": "comedk",
                "name": "COMEDK",
                "description": "Karnataka Private Engineering Colleges",
                "tags": ["Karnataka", "Private Colleges"],
                "accent": "#ea580c",
                "status": "coming_soon"
            }
        ]
    }

@api_router.get("/apeapcet/metadata", response_model=MetadataResponse)
async def get_apeapcet_metadata():
    """Get APEAPCET metadata (colleges, branches, districts, categories)"""
    metadata = await db.apeapcet_metadata.find_one({}, {"_id": 0})
    if not metadata:
        raise HTTPException(status_code=404, detail="Metadata not found")
    return metadata

@api_router.post("/apeapcet/predict", response_model=PredictionResponse)
async def predict_apeapcet_colleges(request: PredictionRequest):
    """Predict colleges based on APEAPCET rank"""
    
    # Build query
    query = {}
    
    # Filter by category if provided
    if request.category:
        # Match categories that start with the selected caste
        query["category"] = {"$regex": f"^{request.category}", "$options": "i"}
    
    # Filter by gender
    if request.gender:
        gender_code = "M" if request.gender.upper() in ["M", "MALE"] else "F"
        query["gender"] = gender_code
    
    # Filter by district
    if request.district:
        query["district"] = request.district
    
    # Filter by college type
    if request.college_type:
        query["institute_type"] = {"$regex": request.college_type, "$options": "i"}
    
    # Filter by branch
    if request.branch:
        query["branch"] = {"$regex": request.branch, "$options": "i"}
    
    # Get cutoffs
    cutoffs = await db.apeapcet_cutoffs.find(query, {"_id": 0}).to_list(5000)
    
    predictions = []
    for cutoff in cutoffs:
        user_rank = request.rank
        closing_rank = cutoff.get('closing_rank', 0)
        opening_rank = cutoff.get('opening_rank', 0)
        
        # Calculate chance and probability
        if user_rank <= opening_rank:
            chance = "SAFE"
            probability = 95
        elif user_rank <= closing_rank:
            # Between opening and closing
            range_size = closing_rank - opening_rank
            position = user_rank - opening_rank
            if range_size > 0:
                ratio = position / range_size
                if ratio < 0.5:
                    chance = "SAFE"
                    probability = int(90 - (ratio * 20))
                else:
                    chance = "GOOD"
                    probability = int(75 - ((ratio - 0.5) * 30))
            else:
                chance = "SAFE"
                probability = 85
        elif user_rank <= closing_rank * 1.2:  # Within 20% of closing rank
            chance = "GOOD"
            probability = int(50 - ((user_rank - closing_rank) / (closing_rank * 0.2)) * 20)
        elif user_rank <= closing_rank * 1.5:  # Within 50% of closing rank
            chance = "REACH"
            probability = int(30 - ((user_rank - closing_rank * 1.2) / (closing_rank * 0.3)) * 15)
        else:
            chance = "REACH"
            probability = max(5, int(15 - ((user_rank - closing_rank * 1.5) / closing_rank) * 10))
        
        predictions.append(CollegePrediction(
            college_code=cutoff.get('college_code', ''),
            college_name=cutoff.get('college_name', ''),
            branch=cutoff.get('branch', ''),
            opening_rank=opening_rank,
            closing_rank=closing_rank,
            user_rank=user_rank,
            chance=chance,
            probability=max(5, min(95, probability)),
            district=cutoff.get('district'),
            institute_type=cutoff.get('institute_type')
        ))
    
    # Sort by probability descending
    predictions.sort(key=lambda x: (-x.probability, x.closing_rank))
    
    # Count by chance
    safe_count = len([p for p in predictions if p.chance == "SAFE"])
    good_count = len([p for p in predictions if p.chance == "GOOD"])
    reach_count = len([p for p in predictions if p.chance == "REACH"])
    
    return PredictionResponse(
        total_colleges=len(predictions),
        safe_count=safe_count,
        good_count=good_count,
        reach_count=reach_count,
        predictions=predictions[:500]  # Limit to top 500
    )

# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
