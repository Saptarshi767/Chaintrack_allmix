import React, { useEffect, useState } from 'react';

const PALETTE = {
  blue1: '#7B9ACC',
  blue2: '#3976F6',
  navy:  '#184A8C',
  teal:  '#13C8C2',
  yellow: '#FFC233',
};

const API_URL = 'http://127.0.0.1:8000'; // Adjust if your FastAPI runs elsewhere

const defaultInput = {
  feature1: 1.0,
  feature2: 2.0,
  feature3: 3.0,
};

const AIPredictions: React.FC = () => {
  const [demand, setDemand] = useState<number | null>(null);
  const [disruption, setDisruption] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      setLoading(true);
      setError(null);
      try {
        const [demandRes, disruptionRes] = await Promise.all([
          fetch(`${API_URL}/predict/demand`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(defaultInput),
          }),
          fetch(`${API_URL}/predict/disruption`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(defaultInput),
          }),
        ]);
        if (!demandRes.ok || !disruptionRes.ok) throw new Error('API error');
        const demandData = await demandRes.json();
        const disruptionData = await disruptionRes.json();
        setDemand(demandData.prediction);
        setDisruption(disruptionData.prediction);
      } catch (e) {
        setError('Failed to fetch AI predictions.');
      } finally {
        setLoading(false);
      }
    };
    fetchPredictions();
  }, []);

  return (
    <section className="py-10 px-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: PALETTE.navy }}>
        AI-Powered Supply Chain Insights
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-6 rounded-xl shadow-lg text-center" style={{ background: PALETTE.blue1 }}>
          <h3 className="text-lg font-bold mb-2" style={{ color: PALETTE.navy }}>Demand Forecast</h3>
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <div className="text-3xl font-bold" style={{ color: PALETTE.blue2 }}>{demand}</div>
          )}
          <div className="text-sm mt-2 text-gray-700">Predicted demand for next period</div>
        </div>
        <div className="p-6 rounded-xl shadow-lg text-center" style={{ background: PALETTE.teal }}>
          <h3 className="text-lg font-bold mb-2" style={{ color: PALETTE.navy }}>Disruption Risk</h3>
          {loading ? (
            <div className="text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <div className="text-3xl font-bold" style={{ color: PALETTE.yellow }}>{disruption}</div>
          )}
          <div className="text-sm mt-2 text-gray-700">Probability of supply chain disruption</div>
        </div>
      </div>
    </section>
  );
};

export default AIPredictions; 