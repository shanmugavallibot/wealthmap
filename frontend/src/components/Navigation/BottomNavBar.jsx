import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/bottomnavbar.css';

function BottomNavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: '📊', label: 'Overview', path: '/dashboard' },
    { icon: '👤', label: 'Accounts', path: '/accounts' },
    { icon: '💳', label: 'Cards', path: '/cards' },
    { icon: '💸', label: 'Transactions', path: '/transactions' },
    { icon: '📋', label: 'Budget', path: '/budget' },
    { icon: '📈', label: 'Reports', path: '/reports' },
  ];

  return (
    <div className="bottom-navbar">
      {navItems.map((item) => (
        <button
          key={item.path}
          className={`nav-btn ${location.pathname === item.path ? 'active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </div>
  );
}

export default BottomNavBar;