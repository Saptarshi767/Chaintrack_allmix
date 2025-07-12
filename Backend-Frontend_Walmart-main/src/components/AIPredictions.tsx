import { useEffect, useState } from 'react';

const PALETTE = {
  blue1: '#7B9ACC',
  blue2: '#3976F6',
  navy:  '#184A8C',
  teal:  '#13C8C2',
  yellow: '#FFC233',
};

const API_URL = 'http://127.0.0.1:8000';

const defaultInput = {
  feature1: 1.0,
  feature2: 2.0,
  feature3: 3.0,
};

interface Product {
  id: string;
  name: string;
  demand: number;
  risk: number;
}

interface Supplier {
  id: string;
  name: string;
  reliability: number;
  lead_time: number;
}

interface Warehouse {
  id: string;
  name: string;
  capacity: number;
  utilization: number;
}

interface AnalyticsSummary {
  total_products: number;
  total_suppliers: number;
  total_warehouses: number;
  total_demand: number;
  average_risk: number;
  high_risk_products: number;
  low_risk_products: number;
}

const AIPredictions: React.FC = () => {
  const [demand, setDemand] = useState<number | null>(null);
  const [disruption, setDisruption] = useState<number | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [
          demandRes, 
          disruptionRes, 
          mockDataRes, 
          analyticsRes
        ] = await Promise.all([
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
          fetch(`${API_URL}/mock-data`),
          fetch(`${API_URL}/analytics/summary`)
        ]);

        if (!demandRes.ok || !disruptionRes.ok || !mockDataRes.ok || !analyticsRes.ok) {
          throw new Error('API error');
        }

        const demandData = await demandRes.json();
        const disruptionData = await disruptionRes.json();
        const mockData = await mockDataRes.json();
        const analyticsData = await analyticsRes.json();

        setDemand(demandData.prediction);
        setDisruption(disruptionData.prediction);
        setProducts(mockData.products);
        setSuppliers(mockData.suppliers);
        setWarehouses(mockData.warehouses);
        setAnalytics(analyticsData);
      } catch (e) {
        setError('Failed to fetch AI predictions.');
        console.error('AI API Error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const getRiskColor = (risk: number) => {
    if (risk > 0.2) return 'text-red-600';
    if (risk > 0.1) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getRiskLevel = (risk: number) => {
    if (risk > 0.2) return 'High';
    if (risk > 0.1) return 'Medium';
    return 'Low';
  };

  if (loading) {
    return (
      <section className="py-10 px-4 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: PALETTE.navy }}>
          AI-Powered Supply Chain Insights
        </h2>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: PALETTE.blue2 }}></div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-10 px-4 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: PALETTE.navy }}>
          AI-Powered Supply Chain Insights
        </h2>
        <div className="text-center text-red-500">
          <p>{error}</p>
          <p className="text-sm mt-2">Make sure the AI API is running on http://127.0.0.1:8000</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 px-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: PALETTE.navy }}>
        AI-Powered Supply Chain Insights
      </h2>
      
      {/* Main Predictions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="p-6 rounded-xl shadow-lg text-center" style={{ background: PALETTE.blue1 }}>
          <h3 className="text-lg font-bold mb-2" style={{ color: PALETTE.navy }}>Demand Forecast</h3>
          <div className="text-3xl font-bold" style={{ color: PALETTE.blue2 }}>{demand?.toLocaleString()}</div>
          <div className="text-sm mt-2 text-gray-700">Predicted demand for next period</div>
        </div>
        <div className="p-6 rounded-xl shadow-lg text-center" style={{ background: PALETTE.teal }}>
          <h3 className="text-lg font-bold mb-2" style={{ color: PALETTE.navy }}>Disruption Risk</h3>
          <div className="text-3xl font-bold" style={{ color: PALETTE.yellow }}>{(disruption! * 100).toFixed(1)}%</div>
          <div className="text-sm mt-2 text-gray-700">Probability of supply chain disruption</div>
        </div>
      </div>

      {/* Analytics Summary */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-lg shadow-md text-center bg-white dark:bg-gray-800">
            <div className="text-2xl font-bold" style={{ color: PALETTE.blue2 }}>{analytics.total_products}</div>
            <div className="text-sm text-gray-600">Products</div>
          </div>
          <div className="p-4 rounded-lg shadow-md text-center bg-white dark:bg-gray-800">
            <div className="text-2xl font-bold" style={{ color: PALETTE.teal }}>{analytics.total_suppliers}</div>
            <div className="text-sm text-gray-600">Suppliers</div>
          </div>
          <div className="p-4 rounded-lg shadow-md text-center bg-white dark:bg-gray-800">
            <div className="text-2xl font-bold" style={{ color: PALETTE.yellow }}>{analytics.total_demand.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Demand</div>
          </div>
          <div className="p-4 rounded-lg shadow-md text-center bg-white dark:bg-gray-800">
            <div className="text-2xl font-bold" style={{ color: PALETTE.navy }}>{(analytics.average_risk * 100).toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Avg Risk</div>
          </div>
        </div>
      )}

      {/* Products Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4" style={{ color: PALETTE.navy }}>Product Risk Analysis</h3>
          <div className="space-y-3">
            {products.map((product) => (
              <div key={product.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                  <div className="text-sm text-gray-500">Demand: {product.demand.toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${getRiskColor(product.risk)}`}>
                    {getRiskLevel(product.risk)}
                  </div>
                  <div className="text-sm text-gray-500">{(product.risk * 100).toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4" style={{ color: PALETTE.navy }}>Supplier Performance</h3>
          <div className="space-y-3">
            {suppliers.map((supplier) => (
              <div key={supplier.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{supplier.name}</div>
                  <div className="text-sm text-gray-500">Lead Time: {supplier.lead_time} days</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">{(supplier.reliability * 100).toFixed(0)}%</div>
                  <div className="text-sm text-gray-500">Reliability</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Warehouse Utilization */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4" style={{ color: PALETTE.navy }}>Warehouse Utilization</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {warehouses.map((warehouse) => (
            <div key={warehouse.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="font-medium text-gray-900 dark:text-white mb-2">{warehouse.name}</div>
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Capacity: {warehouse.capacity.toLocaleString()}</span>
                <span>{(warehouse.utilization * 100).toFixed(0)}% Used</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${warehouse.utilization * 100}%`,
                    backgroundColor: warehouse.utilization > 0.8 ? '#EF4444' : warehouse.utilization > 0.6 ? '#F59E0B' : '#10B981'
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AIPredictions; 