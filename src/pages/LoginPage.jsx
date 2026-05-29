// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useAuth } from '../lib/AuthContext'

// export default function LoginPage() {
//   const { signIn } = useAuth()
//   const navigate   = useNavigate()
//   const [email, setEmail]       = useState('')
//   const [password, setPassword] = useState('')
//   const [error, setError]       = useState('')
//   const [loading, setLoading]   = useState(false)

//   async function handleSubmit(e) {
//     e.preventDefault()
//     setError(''); setLoading(true)
//     const { error } = await signIn(email.trim(), password)
//     setLoading(false)
//     if (error) setError(error.message)
//     else navigate('/')
//   }

//   return (
//     <div className="auth-wrap">
//       <div className="auth-card">
//         <div className="auth-logo">BATTLE<span>ARENA</span></div>
//         <h2 style={{fontSize:20,marginBottom:'.5rem'}}>Sign In</h2>
//         <p style={{color:'#555',fontSize:13,marginBottom:'1.5rem'}}>
//           Use the credentials your admin created for you.
//         </p>
//         <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
//           <div className="form-group">
//             <label className="input-label">Email</label>
//             <input className="input" type="email" placeholder="you@company.com"
//               value={email} onChange={e=>setEmail(e.target.value)} required autoFocus/>
//           </div>
//           <div className="form-group">
//             <label className="input-label">Password</label>
//             <input className="input" type="password" placeholder="••••••••"
//               value={password} onChange={e=>setPassword(e.target.value)} required/>
//           </div>
//           {error && <div className="form-error">⚠ {error}</div>}
//           <button className="btn btn-primary btn-lg btn-full" disabled={loading}>
//             {loading ? 'Signing in…' : 'Sign In →'}
//           </button>
//         </form>
//         <p style={{marginTop:'1.5rem',color:'#444',fontSize:13,textAlign:'center'}}>
//           No account? Ask your admin to create one.
//         </p>
//       </div>
//     </div>
//   )
// }
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export default function LoginPage() {
  const { signIn, session } = useAuth()
  const navigate = useNavigate()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  // Already logged in
  if (session) { navigate('/'); return null }

  async function handleLogin() {
    setError('')
    if (!email || !password) { setError('Email and password are required.'); return }
    setLoading(true)
    const { error: err } = await signIn(email.trim(), password)
    setLoading(false)
    if (err) { setError(err.message); return }
    navigate('/', { replace: true })
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">BATTLE<span>ARENA</span></div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="input-label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="you@prosperr.io"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="input-label">Password</label>
            <input
              className="input"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>

          {error && <div className="form-error">⚠ {error}</div>}

          <button
            className="btn btn-primary btn-full"
            onClick={handleLogin}
            disabled={loading}
            style={{ marginTop: 4 }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </div>

        <p className="text-muted text-xs" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          Use the email your admin registered you with.<br />
          First login? Check your email for an invite link.
        </p>
      </div>
    </div>
  )
}
