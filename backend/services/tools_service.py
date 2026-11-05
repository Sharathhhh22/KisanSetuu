import datetime
import uuid
from typing import Dict, Any, List
from backend.models import SprayDecisionRequest, SprayDecisionResponse, ProfitCalculatorRequest, ProfitCalculatorResponse

def evaluate_spray_decision(req: SprayDecisionRequest) -> SprayDecisionResponse:
    """Evaluates spraying conditions using meteorological principles and CIBRC safety guidelines."""
    reasons = []
    recommendation = "GO"
    
    # 1. Rain Wash-off Risk
    if req.rain_probability_pct > 40.0:
        recommendation = "DO_NOT_SPRAY"
        reasons.append(
            f"High Rain Risk ({req.rain_probability_pct}% probability): "
            "Chemical formulation will wash off within hours, resulting in wasted expenditure and groundwater runoff."
        )
    elif req.rain_probability_pct > 25.0:
        if recommendation != "DO_NOT_SPRAY":
            recommendation = "CAUTION_DELAY"
        reasons.append(
            f"Moderate Rain Risk ({req.rain_probability_pct}% probability): "
            "Wait for sky clearance or use an agricultural sticker/spreader adjuvant if urgent."
        )

    # 2. Wind Drift Risk
    if req.wind_speed_kmh > 15.0:
        recommendation = "DO_NOT_SPRAY"
        reasons.append(
            f"Excessive Wind Speed ({req.wind_speed_kmh} km/h): "
            "CIBRC safety standards prohibit spraying above 15 km/h. Fine droplets will drift to neighboring fields, beneficial insects, or water bodies."
        )
    elif req.wind_speed_kmh > 12.0:
        if recommendation != "DO_NOT_SPRAY":
            recommendation = "CAUTION_DELAY"
        reasons.append(
            f"Breezy Conditions ({req.wind_speed_kmh} km/h): "
            "Use low-drift floodjet or hollow-cone nozzles and reduce boom height."
        )

    # 3. Temperature & Volatilization Risk
    if req.temperature_c > 35.0:
        recommendation = "DO_NOT_SPRAY"
        reasons.append(
            f"High Temperature ({req.temperature_c}°C): "
            "Spraying under harsh sun causes rapid droplet evaporation, poor absorption, and leaf scorch (phytotoxicity). "
            "Postpone spraying until after 4:30 PM."
        )
    elif req.temperature_c < 12.0:
        reasons.append(
            f"Cool Temperature ({req.temperature_c}°C): "
            "Systemic absorption slows down at very low temperatures."
        )

    # Default approval reason if clear
    if recommendation == "GO":
        reasons.append(
            f"Conditions are favorable: Calm wind ({req.wind_speed_kmh} km/h), manageable temperature ({req.temperature_c}°C), "
            f"and low rain probability ({req.rain_probability_pct}%). Safe to spray with mandatory PPE."
        )

    safety_gear = [
        "Wear chemical-resistant nitrile gloves when measuring or mixing concentrates.",
        "Wear an N95 or activated charcoal face respirator mask.",
        "Wear long-sleeved cotton shirts, full trousers, and rubber gumboots.",
        "Ensure clear eye protection / safety goggles to prevent accidental splash."
    ]

    cibrc_warnings = [
        "Never spray against wind direction.",
        "Do not eat, drink, or chew tobacco while handling plant protection chemicals.",
        "Keep away from active beehives and flowering crops during daytime foraging hours (10 AM - 3 PM).",
        "Triple-rinse empty pesticide containers and puncture them before safe disposal as per Insecticides Rules 1971."
    ]

    return SprayDecisionResponse(
        recommendation=recommendation,
        reason=" | ".join(reasons),
        weather_factors={
            "temperature_c": req.temperature_c,
            "rain_probability_pct": req.rain_probability_pct,
            "wind_speed_kmh": req.wind_speed_kmh
        },
        safety_gear_checklist=safety_gear,
        cibrc_safety_warnings=cibrc_warnings,
        disclaimer="Advisory strictly based on meteorological input parameters and standard agricultural safety protocols. Follow package label for approved crop-pest combinations."
    )

def calculate_farmer_profit(req: ProfitCalculatorRequest) -> ProfitCalculatorResponse:
    """Calculates granular crop economics, net profitability, and break-even thresholds."""
    total_investment = (
        req.seed_cost +
        req.fertilizer_and_manure_cost +
        req.pesticide_and_bio_cost +
        req.labour_cost +
        req.irrigation_and_machinery_cost +
        req.transport_and_marketing_cost
    )

    gross_revenue = req.expected_harvest_quantity_quintals * req.selling_price_per_quintal
    net_profit_or_loss = round(gross_revenue - total_investment, 2)
    cost_per_quintal = round(total_investment / req.expected_harvest_quantity_quintals, 2)
    break_even_price = cost_per_quintal

    margin_pct = round((net_profit_or_loss / total_investment * 100), 2) if total_investment > 0 else 0.0
    is_profitable = net_profit_or_loss >= 0

    if is_profitable:
        notes = (
            f"Your crop enterprise yields an estimated net profit of ₹{net_profit_or_loss:,.2f} "
            f"(ROI: {margin_pct}%). To safeguard this margin, lock in sales above ₹{break_even_price}/qtl. "
            f"Cost of cultivation per acre is ₹{(total_investment / req.land_acres):,.2f}."
        )
    else:
        loss_val = abs(net_profit_or_loss)
        notes = (
            f"At the current price of ₹{req.selling_price_per_quintal}/qtl, this crop projects an estimated loss of ₹{loss_val:,.2f}. "
            f"Your minimum break-even selling price is ₹{break_even_price}/qtl. "
            f"Consider exploring nearby district APMC mandis or value addition before harvesting."
        )

    return ProfitCalculatorResponse(
        total_investment=round(total_investment, 2),
        gross_revenue=round(gross_revenue, 2),
        net_profit_or_loss=net_profit_or_loss,
        cost_per_quintal=cost_per_quintal,
        break_even_price=break_even_price,
        profit_margin_percentage=margin_pct,
        is_profitable=is_profitable,
        advisory_notes=notes
    )

def generate_report_code(district: str) -> str:
    prefix = "".join([c.upper() for c in district if c.isalpha()][:3]) or "KS"
    uid = uuid.uuid4().hex[:6].upper()
    return f"KS-LOSS-{prefix}-{uid}"
