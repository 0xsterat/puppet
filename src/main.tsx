import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
//jkbjhg
console.log('main.tsx is running')

const root = document.getElementById('root')
const manifesturl = 'https://0xsterat.github.io/puppet/telescope-manifest.json'
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
} else {
  console.error('Root element not found')
}