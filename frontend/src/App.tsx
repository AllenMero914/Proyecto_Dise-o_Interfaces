import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './core/context/AuthContext';
import { AppRouter } from './core/router/AppRouter';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
