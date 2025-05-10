import { useState, useEffect } from 'react';
import api from '../lib/api';

export default function ApiDebug() {
  const [apiInfo, setApiInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Test the health endpoint
      const health = await api.get('/api/health');
      
      // Test getting user info (authenticated endpoint)
      let userInfo = null;
      try {
        const userResponse = await api.get('/api/users/me');
        userInfo = userResponse.data;
      } catch (userErr: any) {
        userInfo = { error: userErr.message };
      }
      
      // Show the API configuration from api.ts
      setApiInfo({
        health: health.data,
        baseUrl: api.defaults.baseURL,
        userInfo,
        headers: {
          authorization: localStorage.getItem('accessToken') ? 'Bearer Token exists' : 'No token',
          contentType: api.defaults.headers['Content-Type'],
        }
      });
    } catch (err: any) {
      console.error("API test failed:", err);
      setError(`API test failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Run the test when component mounts
    testApi();
  }, []);

  const clearAndRetry = () => {
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
  };

  return (
    <div className="p-4 bg-red-50 border border-red-300 rounded-md my-4">
      <h2 className="text-lg font-bold text-red-700 mb-2">API Debug Information</h2>
      
      {loading && <p className="text-gray-600">Testing API connection...</p>}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>{error}</p>
        </div>
      )}
      
      {apiInfo && (
        <div className="mb-4">
          <h3 className="font-semibold mb-1">API Configuration:</h3>
          <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
            {JSON.stringify(apiInfo, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="flex gap-2">
        <button 
          onClick={testApi}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Testing...' : 'Test API Connection'}
        </button>
        
        <button 
          onClick={clearAndRetry}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear Token & Login Again
        </button>
      </div>
    </div>
  );
}
