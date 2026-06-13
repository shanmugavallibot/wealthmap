import { useState } from 'react';
import '../styles/Sidebar.css';

function Sidebar({ activeTab, onTabChange }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'transactions', label: 'Transactions', icon: '💳' },
    { id: 'insights', label: 'AI Insights', icon: '✨' },
    { id: 'goals', label: 'Goals', icon: '🎯' },
    { id: 'budget', label: 'Budget Analysis', icon: '📈' },
    { id: 'monthly', label: 'Monthly View', icon: '📅' },
    { id: 'yearly', label: 'Yearly View', icon: '📊' }
  ];

  return (
    <aside className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="sidebar-header">
        <h2 className={`sidebar-title ${!isExpanded ? 'hidden' : ''}`}>
          💰 WealthMap
        </h2>
        <button 
          className="toggle-btn"
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? '◀' : '▶'}
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
            title={item.label}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className={`nav-label ${!isExpanded ? 'hidden' : ''}`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <div className={`sidebar-footer ${!isExpanded ? 'hidden' : ''}`}>
        <p className="sidebar-version">v1.0</p>
      </div>
    </aside>
  );
}

export default Sidebar;
