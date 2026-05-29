// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { supabase } from "./lib/supabase";

// export default function ChangePassword() {
//   const navigate = useNavigate();

//   const [password, setPassword] = useState("");
//   const [confirm, setConfirm] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   async function updatePassword(e) {
//     e.preventDefault();

//     setError("");

//     if (password.length < 6) {
//       setError("Password must be at least 6 characters");
//       return;
//     }

//     if (password !== confirm) {
//       setError("Passwords do not match");
//       return;
//     }

//     setLoading(true);

//     const { error: passwordError } = await supabase.auth.updateUser({
//       password,
//     });

//     if (passwordError) {
//       setError(passwordError.message);
//       setLoading(false);
//       return;
//     }

//     const {
//       data: { user },
//     } = await supabase.auth.getUser();

//     await supabase
//       .from("profiles")
//       .update({
//         must_change_password: false,
//       })
//       .eq("id", user.id);

//     setLoading(false);

//     navigate("/");
//   }

//   return (
//     <div className="auth-page">
//       <form className="auth-card" onSubmit={updatePassword}>
//         <h1 className="auth-logo">BATTLEARENA</h1>

//         <h2 style={{ marginBottom: "10px" }}>
//           Change Password
//         </h2>

//         <p
//           style={{
//             color: "#999",
//             marginBottom: "20px",
//             fontSize: "14px",
//           }}
//         >
//           Please set your new password before continuing.
//         </p>

//         <label>New Password</label>

//         <input
//           type="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//         />

//         <label>Confirm Password</label>

//         <input
//           type="password"
//           value={confirm}
//           onChange={(e) => setConfirm(e.target.value)}
//           required
//         />

//         {error && (
//           <div
//             style={{
//               color: "#ff4d6d",
//               marginBottom: "15px",
//               marginTop: "10px",
//             }}
//           >
//             {error}
//           </div>
//         )}

//         <button type="submit" disabled={loading}>
//           {loading ? "Updating..." : "Update Password"}
//         </button>
//       </form>
//     </div>
//   );
// }

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './lib/supabase'

export default function ChangePassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function updatePassword(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    if (password !== confirm)  { setError('Passwords do not match'); return }
    setLoading(true)

    const { error: passwordError } = await supabase.auth.updateUser({ password })
    if (passwordError) { setError(passwordError.message); setLoading(false); return }

    const { data: { user } } = await supabase.auth.getUser()

    // Clear flag in DB
    await supabase.from('profiles')
      .update({ must_change_password: false })
      .eq('id', user.id)

    // Force session refresh so AuthContext picks up the updated profile
    await supabase.auth.refreshSession()

    setLoading(false)
    // Small delay so AuthContext has time to reload profile before navigation
    setTimeout(() => navigate('/', { replace: true }), 300)
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={updatePassword}>
        <div className="auth-logo">BATTLE<span>ARENA</span></div>
        <h2 style={{ marginBottom: 10 }}>Change Password</h2>
        <p style={{ color:'#999', marginBottom:20, fontSize:14 }}>
          Please set your new password before continuing.
        </p>
        <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
          <div>
            <label className="input-label">New Password</label>
            <input className="input" type="password" placeholder="Min 6 characters"
              value={password} onChange={e=>setPassword(e.target.value)} autoFocus/>
          </div>
          <div>
            <label className="input-label">Confirm Password</label>
            <input className="input" type="password" placeholder="Repeat password"
              value={confirm} onChange={e=>setConfirm(e.target.value)}/>
          </div>
          {error && <div className="form-error">⚠ {error}</div>}
          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </div>
      </form>
    </div>
  )
}