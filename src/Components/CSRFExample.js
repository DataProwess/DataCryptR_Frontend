import React, { useState, useEffect } from 'react';
import { makeAuthenticatedRequest, handleCSRFError, useCSRF } from './csrfUtils';
import { API_URL } from './ApiConfig';

/**
 * Example component demonstrating CSRF protection integration
 */
function CSRFExample() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Using the CSRF hook
  const { csrfToken, loading: csrfLoading } = useCSRF();

  // Example 1: Using the makeAuthenticatedRequest utility
  const fetchDataWithCSRF = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await makeAuthenticatedRequest(
        `${API_URL}/api/blob/list_containers/`,
        'POST',
        {
          storage_account_id: 1, // Example data
        }
      );

      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (error) {
      await handleCSRFError(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Example 2: Manual CSRF token usage
  const fetchDataManually = async () => {
    if (!csrfToken) {
      setError('CSRF token not available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/blob/list_containers/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') ? JSON.parse(localStorage.getItem('token')).data.token : ''}`,
          'X-CSRFToken': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify({
          storage_account_id: 1, // Example data
        })
      });

      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (csrfLoading) {
    return <div>Loading CSRF token...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>CSRF Protection Example</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>CSRF Token Status:</h3>
        <p>Token: {csrfToken ? '✅ Available' : '❌ Not available'}</p>
        {csrfToken && (
          <p style={{ fontSize: '12px', color: '#666' }}>
            Token: {csrfToken.substring(0, 20)}...
          </p>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>API Calls:</h3>
        <button 
          onClick={fetchDataWithCSRF}
          disabled={loading}
          style={{ marginRight: '10px', padding: '10px 15px' }}
        >
          {loading ? 'Loading...' : 'Fetch with CSRF Utility'}
        </button>
        
        <button 
          onClick={fetchDataManually}
          disabled={loading || !csrfToken}
          style={{ padding: '10px 15px' }}
        >
          {loading ? 'Loading...' : 'Fetch Manually'}
        </button>
      </div>

      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {data && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#e8f5e8', 
          borderRadius: '4px',
          marginBottom: '20px'
        }}>
          <h3>Response Data:</h3>
          <pre style={{ fontSize: '12px', overflow: 'auto' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ 
        padding: '15px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '4px',
        fontSize: '14px'
      }}>
        <h3>How to Use:</h3>
        <ol>
          <li><strong>Import the utilities:</strong> Import from './csrfUtils'</li>
          <li><strong>Use makeAuthenticatedRequest:</strong> For automatic CSRF handling</li>
          <li><strong>Use the useCSRF hook:</strong> For React components</li>
          <li><strong>Handle errors:</strong> Use handleCSRFError for proper error handling</li>
        </ol>
      </div>
    </div>
  );
}

export default CSRFExample; 