import '../styles/Navbar.css';
 
function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h1>💰 WealthMap</h1>
        <p>Your AI Financial Assistant</p>
      </div>
      <div className="navbar-user">
        <span className="user-name">{user?.username}</span>
        <button onClick={onLogout} className="btn-logout">Logout</button>
      </div>
    </nav>
  );
}
 
export default Navbar;