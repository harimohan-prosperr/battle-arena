import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

function Avatar({ name, color, size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: (color || '#00e5ff') + '33',
      border: `2px solid ${color || '#00e5ff'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: Math.round(size * 0.38),
      color: color || '#00e5ff', flexShrink: 0,
      fontFamily: "'Bebas Neue', sans-serif"
    }}>
      {name?.slice(0, 2).toUpperCase()}
    </div>
  )
}

const TABS = [
  { path: '/',             label: 'Dashboard' },
  { path: '/battles',      label: 'Battles' },
  { path: '/leaderboard',  label: 'Leaderboard' },
  { path: '/profile',      label: 'My Profile' },
]

export default function Layout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const isActive = p => p === '/' ? pathname === '/' : pathname.startsWith(p)

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>
      <nav className="nav">
        <div className="nav-logo" onClick={() => navigate('/')}>BATTLE<span>ARENA</span></div>

        {TABS.map(t => (
          <button key={t.path} className={`nav-tab ${isActive(t.path) ? 'active' : ''}`}
            onClick={() => navigate(t.path)}>
            {t.label}
          </button>
        ))}

        {profile?.is_admin && (
          <button className={`nav-tab ${isActive('/admin') ? 'active' : ''}`}
            onClick={() => navigate('/admin')}>
            ⚙ Admin
          </button>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="flex items-center gap1 hide-mobile">
            <div className="live-dot" />
            <span style={{ fontSize: 12, color: '#555', textTransform: 'uppercase', letterSpacing: 1 }}>Live</span>
          </div>
          <Avatar name={profile?.username} color={profile?.color} />
          <button className="btn btn-ghost btn-sm hide-mobile" onClick={signOut}>Sign Out</button>
        </div>
      </nav>

      <div className="page">
        <Outlet />
      </div>
    </div>
  )
}
