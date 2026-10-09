import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext.jsx';

const PAGES = [
  { to: '/dashboard', label: 'Dashboard', roles: ['librarian', 'member'] },
  { to: '/books', label: 'Books', roles: ['librarian', 'member'] },
  { to: '/transactions', label: 'Transactions', roles: ['librarian', 'member'] },
  { to: '/users', label: 'Members', roles: ['librarian'] }
];

/* Top bar + tab navigation + the routed page. */
export default function Shell() {
  const { user, setSession } = useLibrary();
  const navigate = useNavigate();

  const signOut = () => {
    setSession(null);
    navigate('/');
  };

  return (
    <div id="appShell">
      <div className="top-bar">
        <div className="brand">
          <div className="card-eyebrow">COMMUNITY LIBRARY SYSTEM</div>
          <h1>MISJAY Community Library</h1>
        </div>
        <div className="who">
          <strong>{user.name}</strong>
          <span className="role-tag">{user.role}</span>
          <div><button className="btn btn-ghost btn-small" onClick={signOut}>Sign out</button></div>
        </div>
      </div>
      <nav className="tabs">
        {PAGES.filter(p => p.roles.includes(user.role)).map(p => (
          <NavLink key={p.to} to={p.to}>
            {({ isActive }) => <TabButton active={isActive} label={p.label} />}
          </NavLink>
        ))}
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

function TabButton({ active, label }) {
  return <button type="button" aria-selected={String(active)}>{label}</button>;
}
