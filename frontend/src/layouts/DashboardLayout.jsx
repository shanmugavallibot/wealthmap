import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavBar from '../components/Navigation/TopNavBar';
import BottomNavBar from '../components/Navigation/BottomNavBar';
import '../styles/layout.css';

function DashboardLayout({ children, user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(`/${tab}`);
  };

  return (
    <div className="dashboard-layout">
      <TopNavBar user={user} onLogout={onLogout} />
      
      <main className="main-content">
        {children}
      </main>

      <BottomNavBar activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
}

export default DashboardLayout;