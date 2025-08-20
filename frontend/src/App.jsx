import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import LogInPage from "./pages/LogInPage.jsx";

import { Routes, Route } from 'react-router-dom';
import { useAuthStore } from "./store/UseAuthStore.js";

const App = () => {
  const { AuthUser } = useAuthStore();

  
  return (
    <div>

    <Navbar />

    <Routes>
      <Route path="/" element={<HomePage/>} />
      <Route path="/signup" element={<SignUpPage/>} />
      <Route path="/login" element={<LogInPage/>} />
      <Route path="/settings" element={<SettingsPage/>} />
      <Route path="/profile" element={<ProfilePage/>} />

    </Routes>

    </div>
  )
}

export default App