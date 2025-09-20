import './App.css'
import { Routes, Route, Link } from "react-router-dom";
import { useTheme } from './contexts/ThemeContext/useTheme';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';

// src/App.tsx

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={`min-h-screen ${theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-black"}`}>
      <nav className="p-4 flex justify-between items-center border-b">
        <Link to="/">Home</Link>
        <div className="space-x-4">
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/dashboard">Dashboard</Link>
          <button onClick={toggleTheme} className="px-2 py-1 rounded bg-primary text-white">
            Toggle {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<div className="p-4">Welcome to Ad Dashboard</div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </div>
  );
}

export default App;
