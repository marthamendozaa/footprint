import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { AppRouter } from './router/AppRouter'
import { AuthProvider } from './contexts/AuthContext.jsx';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}

export default App