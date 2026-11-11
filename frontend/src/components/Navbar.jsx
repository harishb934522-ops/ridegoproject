import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTheme } from '../context/useTheme';
import { useAuth } from '../context/useAuth';
import { useWallet } from '../context/useWallet';

export default function Navbar() {
  const { darkMode, toggleDarkMode } = useTheme();
  const auth = useAuth();
  const wallet = useWallet();
  const user = auth?.user;
  const logout = auth?.logout;
  const location = useLocation();

  const isHome = location.pathname === '/';

  return (
    <nav className="navbar navbar-expand-lg bg-white shadow-sm sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold text-warning fs-2" to="/">
          RideGo
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#menu"
          aria-controls="menu"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="menu">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              {isHome ? (
                <a className="nav-link active" href="#home">
                  <i className="bi bi-house-fill"></i> Home
                </a>
              ) : (
                <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/">
                  <i className="bi bi-house-fill"></i> Home
                </NavLink>
              )}
            </li>

            <li className="nav-item">
              <a className="nav-link" href={isHome ? '#services' : '/#services'}>
                <i className="bi bi-scooter"></i> Services
              </a>
            </li>

            <li className="nav-item">
              <a className="nav-link" href={isHome ? '#features' : '/#features'}>
                <i className="bi bi-stars"></i> Features
              </a>
            </li>

            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/booking">
                🏍️ Book Ride
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/dashboard">
                👤 {user ? user.name : 'Dashboard'}
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/admin">
                ⚙️ Admin
              </NavLink>
            </li>

            {/* Wallet quick balance pill */}
            <li className="nav-item">
              <Link
                to="/dashboard"
                className="nav-link"
                title="Wallet Balance & Reward Coins"
                style={{ background: '#fff9e6', borderColor: '#ffd54f' }}
              >
                <span>💰 ₹{wallet?.balance ?? 250}</span>
                <span className="badge bg-warning text-dark ms-1">🪙 {wallet?.coins ?? 50}</span>
              </Link>
            </li>

            <li className="nav-item">
              {user ? (
                <button
                  type="button"
                  onClick={logout}
                  className="nav-link"
                  style={{ border: 'none', background: 'transparent' }}
                  title="Logout"
                >
                  🚪 Logout
                </button>
              ) : (
                <NavLink className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} to="/login">
                  🔑 Login
                </NavLink>
              )}
            </li>

            <li className="nav-item">
              <button
                type="button"
                onClick={toggleDarkMode}
                className="btn btn-dark"
                style={{ padding: '8px 18px', borderRadius: '12px' }}
              >
                {darkMode ? '☀️ Light' : '🌙 Dark'}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
