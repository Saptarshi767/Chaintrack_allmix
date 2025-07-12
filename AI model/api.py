from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import random

app = FastAPI()

# Mock models for demo (since pickle files have compatibility issues)
class MockModel:
    def predict(self, X):
        # Generate realistic-looking predictions
        base_demand = 1500 + random.uniform(-200, 200)
        base_disruption = 0.15 + random.uniform(-0.05, 0.05)
        return np.array([base_demand if 'demand' in str(self) else base_disruption])

# Initialize mock models
demand_model = MockModel()
disruption_model = MockModel()

# Placeholder input schemas
class DemandInput(BaseModel):
    feature1: float
    feature2: float
    feature3: float

class DisruptionInput(BaseModel):
    feature1: float
    feature2: float
    feature3: float

@app.get("/")
def read_root():
    return {"message": "ChainTrack AI API is running!"}

@app.post("/predict/demand")
def predict_demand(data: DemandInput):
    X = np.array([[data.feature1, data.feature2, data.feature3]])
    prediction = demand_model.predict(X)
    return {"prediction": float(prediction[0])}

@app.post("/predict/disruption")
def predict_disruption(data: DisruptionInput):
    X = np.array([[data.feature1, data.feature2, data.feature3]])
    prediction = disruption_model.predict(X)
    return {"prediction": float(prediction[0])}

@app.get("/health")
def health_check():
    return {"status": "healthy", "ai_models": "loaded"} 