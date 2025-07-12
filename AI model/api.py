from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import random
from datetime import datetime, timedelta
import json

app = FastAPI()

# Mock models for demo with realistic supply chain data
class MockDemandModel:
    def predict(self, X):
        # Generate realistic demand predictions based on historical patterns
        base_demand = 1500
        seasonal_factor = 1.2 if datetime.now().month in [11, 12] else 1.0  # Holiday season
        trend_factor = 1.05  # Growing trend
        random_factor = random.uniform(0.9, 1.1)
        
        predicted_demand = int(base_demand * seasonal_factor * trend_factor * random_factor)
        return np.array([predicted_demand])

class MockDisruptionModel:
    def predict(self, X):
        # Generate realistic disruption risk (0-1 scale)
        base_risk = 0.15
        weather_factor = 0.1 if datetime.now().month in [1, 2, 12] else 0.05  # Winter months
        supply_factor = random.uniform(0.05, 0.15)  # Supply chain issues
        geopolitical_factor = random.uniform(0.02, 0.08)  # Global factors
        
        total_risk = min(1.0, base_risk + weather_factor + supply_factor + geopolitical_factor)
        return np.array([total_risk])

# Initialize mock models
demand_model = MockDemandModel()
disruption_model = MockDisruptionModel()

# Input schemas
class DemandInput(BaseModel):
    feature1: float = 1.0
    feature2: float = 2.0
    feature3: float = 3.0

class DisruptionInput(BaseModel):
    feature1: float = 1.0
    feature2: float = 2.0
    feature3: float = 3.0

# Mock supply chain data for testing
mock_supply_chain_data = {
    "products": [
        {"id": "PROD001", "name": "Electronics", "demand": 1200, "risk": 0.12},
        {"id": "PROD002", "name": "Clothing", "demand": 800, "risk": 0.08},
        {"id": "PROD003", "name": "Food Items", "demand": 2000, "risk": 0.25},
        {"id": "PROD004", "name": "Pharmaceuticals", "demand": 500, "risk": 0.05},
        {"id": "PROD005", "name": "Automotive Parts", "demand": 900, "risk": 0.18}
    ],
    "suppliers": [
        {"id": "SUP001", "name": "TechCorp", "reliability": 0.95, "lead_time": 7},
        {"id": "SUP002", "name": "FashionHub", "reliability": 0.88, "lead_time": 14},
        {"id": "SUP003", "name": "FreshFoods", "reliability": 0.92, "lead_time": 3},
        {"id": "SUP004", "name": "MedSupply", "reliability": 0.98, "lead_time": 5},
        {"id": "SUP005", "name": "AutoParts Inc", "reliability": 0.85, "lead_time": 10}
    ],
    "warehouses": [
        {"id": "WH001", "name": "Main Distribution Center", "capacity": 10000, "utilization": 0.75},
        {"id": "WH002", "name": "Regional Hub East", "capacity": 5000, "utilization": 0.82},
        {"id": "WH003", "name": "Regional Hub West", "capacity": 5000, "utilization": 0.68}
    ]
}

@app.get("/")
def read_root():
    return {
        "message": "ChainTrack AI API is running!",
        "endpoints": {
            "health": "/health",
            "demand_prediction": "/predict/demand",
            "disruption_prediction": "/predict/disruption",
            "mock_data": "/mock-data",
            "test_predictions": "/test-predictions"
        }
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "ai_models": "loaded",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

@app.post("/predict/demand")
def predict_demand(data: DemandInput):
    X = np.array([[data.feature1, data.feature2, data.feature3]])
    prediction = demand_model.predict(X)
    return {
        "prediction": float(prediction[0]),
        "confidence": random.uniform(0.85, 0.95),
        "factors": {
            "seasonal_impact": random.uniform(0.8, 1.2),
            "market_trend": random.uniform(0.95, 1.05),
            "competition_factor": random.uniform(0.9, 1.1)
        }
    }

@app.post("/predict/disruption")
def predict_disruption(data: DisruptionInput):
    X = np.array([[data.feature1, data.feature2, data.feature3]])
    prediction = disruption_model.predict(X)
    return {
        "prediction": float(prediction[0]),
        "risk_level": "High" if prediction[0] > 0.3 else "Medium" if prediction[0] > 0.15 else "Low",
        "factors": {
            "weather_risk": random.uniform(0.05, 0.15),
            "supply_chain_risk": random.uniform(0.02, 0.12),
            "geopolitical_risk": random.uniform(0.01, 0.08)
        }
    }

@app.get("/mock-data")
def get_mock_data():
    return mock_supply_chain_data

@app.get("/test-predictions")
def test_predictions():
    """Generate test predictions for all products"""
    test_results = []
    
    for product in mock_supply_chain_data["products"]:
        # Generate demand prediction
        demand_prediction = demand_model.predict(np.array([[1, 2, 3]]))
        
        # Generate disruption prediction
        disruption_prediction = disruption_model.predict(np.array([[1, 2, 3]]))
        
        test_results.append({
            "product_id": product["id"],
            "product_name": product["name"],
            "demand_prediction": int(demand_prediction[0]),
            "disruption_risk": float(disruption_prediction[0]),
            "risk_level": "High" if disruption_prediction[0] > 0.3 else "Medium" if disruption_prediction[0] > 0.15 else "Low",
            "timestamp": datetime.now().isoformat()
        })
    
    return {
        "predictions": test_results,
        "summary": {
            "total_products": len(test_results),
            "average_demand": sum(r["demand_prediction"] for r in test_results) / len(test_results),
            "average_risk": sum(r["disruption_risk"] for r in test_results) / len(test_results)
        }
    }

@app.get("/analytics/summary")
def get_analytics_summary():
    """Get comprehensive analytics summary"""
    total_demand = sum(product["demand"] for product in mock_supply_chain_data["products"])
    avg_risk = sum(product["risk"] for product in mock_supply_chain_data["products"]) / len(mock_supply_chain_data["products"])
    
    return {
        "total_products": len(mock_supply_chain_data["products"]),
        "total_suppliers": len(mock_supply_chain_data["suppliers"]),
        "total_warehouses": len(mock_supply_chain_data["warehouses"]),
        "total_demand": total_demand,
        "average_risk": avg_risk,
        "high_risk_products": len([p for p in mock_supply_chain_data["products"] if p["risk"] > 0.2]),
        "low_risk_products": len([p for p in mock_supply_chain_data["products"] if p["risk"] < 0.1]),
        "timestamp": datetime.now().isoformat()
    } 