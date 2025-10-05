// src/pages/Test.jsx
import { useState, useEffect } from 'react'
import api from '../api/axios'

function Test() {
  const [apiStatus, setApiStatus] = useState('Testing...')
  const [envVar, setEnvVar] = useState('')

  useEffect(() => {
    setEnvVar(import.meta.env.VITE_API_URL || 'Not set')

    const testAPI = async () => {
      try {
        const response = await api.get('/health')
        setApiStatus(`✅ Connected: ${response.data.status}`)
      } catch (error) {
        setApiStatus(`❌ Failed: ${error.message}`)
      }
    }
    
    testAPI()
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>🚀 Spark Wave Frontend</h1>
      <div style={{ background: '#9c4a4aff', padding: '15px', borderRadius: '8px' }}>
        <h3>Deployment Test Results:</h3>
        <p><strong>Environment Variable:</strong> {envVar}</p>
        <p><strong>API Connection:</strong> {apiStatus}</p>
      </div>
    </div>
  )
}

export default Test
