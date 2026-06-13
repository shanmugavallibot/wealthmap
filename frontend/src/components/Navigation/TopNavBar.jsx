import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/topnavbar.css';

function TopNavBar({ user, onLogout }) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const navItems = [
    { icon: '👤', label: 'Accounts', path: '/accounts' },
    { icon: '💳', label: 'Cards', path: '/cards' },
    { icon: '💸', label: 'Transfers', path: '/transfers' },
    { icon: '🎯', label: 'Goals', path: '/goals' },
    { icon: '💰', label: 'Debts', path: '/debts' },
    { icon: '📈', label: 'Investments', path: '/investments' },
  ];

  return (
    <nav className="top-navbar">
      <div className="navbar-left">
        <h1 className="app-title">💰 Finance OS</h1>
      </div>

      <div className="navbar-center">
        <div className="nav-items">
          {navItems.map((item) => (
            <button
              key={item.path}
              className="nav-item"
              onClick={() => navigate(item.path)}
              title={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="navbar-right">
        <button className="settings-btn">⚙️</button>
        <button 
          className="profile-btn"
          onClick={() => setShowMenu(!showMenu)}
        >
          👤 {user?.username}
        </button>
        
        {showMenu && (
          <div className="profile-menu">
            <a href="/profile">Profile</a>
            <a href="/settings">Settings</a>
            <button onClick={onLogout}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default TopNavBar;