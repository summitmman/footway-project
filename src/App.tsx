import './App.css';
import { Header } from './components';
import { StoreProvider } from './contexts';
import Dashboard from './views/Dashboard';

function App() {

  return (
    <StoreProvider>
      <Header />
      <main className="app-container">
        <Dashboard />
      </main>
    </StoreProvider>
  )
}

export default App
