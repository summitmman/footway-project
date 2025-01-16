import './App.css';
import { Header } from './components';
import { UserProvider } from './contexts';
import Dashboard from './views/Dashboard';

function App() {

  return (
    <UserProvider>
      <Header />
      <main className="app-container">
        <Dashboard />
      </main>
    </UserProvider>
  )
}

export default App
