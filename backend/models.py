from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

# Authentication & User
class RegisterRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=15)
    name: str = Field(..., min_length=2, max_length=100)
    password: str = Field(..., min_length=6)
    role: Optional[str] = "farmer"
    language: Optional[str] = "kn"
    state: Optional[str] = "Karnataka"
    district: Optional[str] = "Mandya"
    taluk: Optional[str] = "Pandavapura"
    village: Optional[str] = "Melukote"
    land_acres: Optional[float] = 2.0
    soil_type: Optional[str] = "Red Sandy Loam"
    irrigation_type: Optional[str] = "Borewell"
    expert_title: Optional[str] = ""
    expert_specialization: Optional[str] = ""

class LoginRequest(BaseModel):
    phone: str
    password: str

class TokenResponse(BaseModel):
    token: str
    user: Dict[str, Any]

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    language: Optional[str] = None
    district: Optional[str] = None
    taluk: Optional[str] = None
    village: Optional[str] = None
    land_acres: Optional[float] = None
    soil_type: Optional[str] = None
    irrigation_type: Optional[str] = None

# Farm Crops (Digital Field Diary)
class FarmCropCreate(BaseModel):
    crop_name: str
    variety: Optional[str] = ""
    sowing_date: str
    acreage: Optional[float] = 1.0
    growth_stage: Optional[str] = "Vegetative"
    soil_health_notes: Optional[str] = ""

# AI Crop Diagnosis
class CropDiagnosisRequest(BaseModel):
    image_base64: str
    crop_name: Optional[str] = "Unknown / General"
    notes: Optional[str] = ""
    language: Optional[str] = "kn"

class CropDiagnosisResponse(BaseModel):
    id: Optional[int] = None
    crop_name: str
    condition_name: str
    condition_type: str
    confidence_score: int
    visible_symptoms: str
    possible_causes: str
    recommended_actions: str
    what_to_avoid: str
    source_info: str
    expert_verification_status: str
    disclaimer: str

# Kisan AI Chat
class ChatQueryRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None
    image_base64: Optional[str] = None
    language: Optional[str] = "kn"
    farm_context: Optional[Dict[str, Any]] = None

# Weather & Agro-Advisories
class WeatherQueryRequest(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    district: Optional[str] = "Mandya"
    language: Optional[str] = "kn"

# Mandi & Market Intelligence
class MandiQueryRequest(BaseModel):
    commodity: Optional[str] = "All"
    district: Optional[str] = "All"
    state: Optional[str] = "Karnataka"

# Government Scheme Finder
class SchemeFilterRequest(BaseModel):
    state: Optional[str] = "Karnataka"
    land_acres: Optional[float] = 2.0
    crop_type: Optional[str] = "Any"
    farmer_category: Optional[str] = "Small / Marginal"
    annual_income: Optional[float] = 150000.0

# Expert Consultation
class ExpertConsultationCreate(BaseModel):
    expert_id: Optional[int] = None
    crop_name: str
    district: str
    query_text: str
    image_base64: Optional[str] = None

class ExpertAnswerRequest(BaseModel):
    expert_response: str

# Crop Loss Reporting
class CropLossReportCreate(BaseModel):
    crop_name: str
    variety: Optional[str] = ""
    affected_acres: float
    total_acres: float
    damage_cause: str
    damage_date: str
    location_district: str
    location_taluk: str
    location_village: str
    photo_base64: Optional[str] = None
    estimated_loss_amount: Optional[float] = 0.0

# Spray Assistant
class SprayDecisionRequest(BaseModel):
    crop_name: str
    target_pest_or_disease: str
    chemical_or_formulation: str
    district: Optional[str] = "Mandya"
    temperature_c: Optional[float] = 28.0
    rain_probability_pct: Optional[float] = 10.0
    wind_speed_kmh: Optional[float] = 8.0

class SprayDecisionResponse(BaseModel):
    recommendation: str # 'GO', 'CAUTION_DELAY', 'DO_NOT_SPRAY'
    reason: str
    weather_factors: Dict[str, Any]
    safety_gear_checklist: List[str]
    cibrc_safety_warnings: List[str]
    disclaimer: str

# Profit Calculator
class ProfitCalculatorRequest(BaseModel):
    crop_name: str
    land_acres: float = Field(..., gt=0)
    seed_cost: float = Field(..., ge=0)
    fertilizer_and_manure_cost: float = Field(..., ge=0)
    pesticide_and_bio_cost: float = Field(..., ge=0)
    labour_cost: float = Field(..., ge=0)
    irrigation_and_machinery_cost: float = Field(..., ge=0)
    transport_and_marketing_cost: float = Field(..., ge=0)
    expected_harvest_quantity_quintals: float = Field(..., gt=0)
    selling_price_per_quintal: float = Field(..., gt=0)

class ProfitCalculatorResponse(BaseModel):
    total_investment: float
    gross_revenue: float
    net_profit_or_loss: float
    cost_per_quintal: float
    break_even_price: float
    profit_margin_percentage: float
    is_profitable: bool
    advisory_notes: str

# Community Network
class CommunityPostCreate(BaseModel):
    crop_tag: str
    title: str
    body: str
    image_base64: Optional[str] = None

class CommunityReplyCreate(BaseModel):
    body: str
