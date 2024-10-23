import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import PriceTracker from './ProductTracker'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <div>
    <PriceTracker> </PriceTracker>
    </div>
    </>
  )
}

export default App
