
// import { useEffect, useState } from 'react'
// import { supabase } from '../lib/supabase'
// import { useAuth } from '../lib/AuthContext'
// import { Avatar, TeamLogo, Spinner, Modal } from '../components/UI'

// const COLORS = ['#ff3c5c','#00e5ff','#a855f7','#f97316','#22d3ee','#84cc16','#f43f5e','#06b6d4']

// export default function AdminPage() {
//   const { profile } = useAuth()
//   const [tab,      setTab]      = useState('approvals')
//   const [profiles, setProfiles] = useState([])
//   const [teams,    setTeams]    = useState([])
//   const [pending,  setPending]  = useState([])
//   const [loading,  setLoading]  = useState(true)
//   const [saving,   setSaving]   = useState(false)

//   const [showPlayer, setShowPlayer] = useState(false)
//   const [pForm, setPForm] = useState({ email:'', username:'', color:COLORS[0], teamId:'', isAdmin:false })
//   const [pError, setPError] = useState('')

//   const [showTeam, setShowTeam] = useState(false)
//   const [tForm, setTForm] = useState({ name:'', tag:'', color:COLORS[0] })

//   const [rejectModal, setRejectModal] = useState(null)
//   const [rejectNote,  setRejectNote]  = useState('')

//   async function load() {
//     const [{ data: p }, { data: t }] = await Promise.all([
//       supabase.from('profiles').select('id,username,email,color,total_itrs,battle_wins,is_admin,team_id,teams(name,tag,color)').order('username'),
//       supabase.from('teams').select('id,name,tag,color,total_itrs,battle_wins').order('name'),
//     ])
//     setProfiles(p || [])
//     setTeams(t || [])
//     await loadPending()
//     setLoading(false)
//   }

//   async function loadPending() {
//     const { data } = await supabase
//       .from('daily_scores')
//       .select(`
//         id, side, day_number, itr_count, log_date, status, rejection_note,
//         logged_by, battle_id,
//         logger:profiles!daily_scores_logged_by_fkey(username, color),
//         battle:battles!daily_scores_battle_id_fkey(
//           id, battle_type,
//           challenger_side:challenger_side_id(name,color),
//           opponent_side:opponent_side_id(name,color)
//         )
//       `)
//       .eq('status', 'pending')
//       .order('created_at', { ascending: true })
//     setPending(data || [])
//   }

//   useEffect(() => { load() }, [])

//   async function createPlayer() {
//     if (!pForm.email || !pForm.username) { setPError('Email and username are required.'); return }
//     setSaving(true); setPError('')
//     try {
//       const { data: { session } } = await supabase.auth.getSession()
//       const response = await fetch(
//         'https://pimnifngytxdzdjbghor.supabase.co/functions/v1/create-user',
//         {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
//           body: JSON.stringify({ email: pForm.email, username: pForm.username, color: pForm.color, teamId: pForm.teamId, isAdmin: pForm.isAdmin })
//         }
//       )
//       const result = await response.json()
//       if (!response.ok) throw new Error(result.error || 'Failed to invite user')
//       setShowPlayer(false)
//       setPForm({ email:'', username:'', color:COLORS[0], teamId:'', isAdmin:false })
//       load()
//     } catch (err) { setPError(err.message) }
//     finally { setSaving(false) }
//   }

//   async function createTeam() {
//     if (!tForm.name || !tForm.tag) return
//     setSaving(true)
//     await supabase.from('teams').insert({ name:tForm.name, tag:tForm.tag.toUpperCase().slice(0,3), color:tForm.color, total_itrs:0, battle_wins:0 })
//     setSaving(false); setShowTeam(false)
//     setTForm({ name:'', tag:'', color:COLORS[0] }); load()
//   }

//   async function assignTeam(userId, teamId) {
//     await supabase.from('profiles').update({ team_id: teamId||null }).eq('id', userId); load()
//   }

//   async function toggleAdmin(userId, current) {
//     await supabase.from('profiles').update({ is_admin: !current }).eq('id', userId); load()
//   }

//   // ── Approve a score ──
//   async function handleApprove(score) {
//     setSaving(true)
//     await supabase.from('daily_scores').update({
//       status: 'approved',
//       approved_by: profile.id,
//       rejection_note: null,
//     }).eq('id', score.id)

//     // Increment total_itrs on the player's profile
//     await supabase.rpc('increment_total_itrs', { uid: score.logged_by, amount: score.itr_count })

//     // Check if battle is now complete (both sides have 7 approved days)
//     const { data: allScores } = await supabase
//       .from('daily_scores')
//       .select('side, itr_count, status')
//       .eq('battle_id', score.battle_id)

//     const approved = [...(allScores || []), { ...score, status: 'approved' }].filter(s => s.status === 'approved')
//     const cDays = approved.filter(s => s.side === 'challenger').length
//     const oDays = approved.filter(s => s.side === 'opponent').length

//     if (cDays >= 7 && oDays >= 7) {
//       const cTotal = approved.filter(s => s.side === 'challenger').reduce((a, b) => a + b.itr_count, 0)
//       const oTotal = approved.filter(s => s.side === 'opponent').reduce((a, b) => a + b.itr_count, 0)
//       const winner = cTotal >= oTotal ? 'challenger' : 'opponent'
//       await supabase.from('battles').update({ status: 'completed', winner_side: winner }).eq('id', score.battle_id)
//     }

//     setSaving(false); loadPending()
//   }

//   // ── Reject a score ──
//   async function handleReject() {
//     if (!rejectModal) return
//     setSaving(true)
//     await supabase.from('daily_scores').update({
//       status: 'rejected',
//       rejection_note: rejectNote || 'Please resubmit with the correct number.',
//     }).eq('id', rejectModal.id)
//     setSaving(false); setRejectModal(null); setRejectNote(''); loadPending()
//   }

//   if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'4rem'}}><Spinner size={32}/></div>

//   return (
//     <div>
//       <div className="flex items-center justify-between mb3">
//         <div>
//           <h1 className="section-title">⚙ ADMIN</h1>
//           <p className="section-sub">Manage players, teams & approvals</p>
//         </div>
//         <div className="flex gap1">
//           <button className="btn btn-primary btn-sm" onClick={() => setShowPlayer(true)}>+ Add Player</button>
//           <button className="btn btn-secondary btn-sm" onClick={() => setShowTeam(true)}>+ Add Team</button>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="flex gap1 mb3">
//         {[
//           { key:'approvals', label:`⏳ Approvals ${pending.length > 0 ? `(${pending.length})` : ''}` },
//           { key:'players',   label:'👤 Players' },
//           { key:'teams',     label:'⚔ Teams' },
//         ].map(t => (
//           <button key={t.key} className={`btn btn-sm ${tab===t.key?'btn-primary':'btn-ghost'}`}
//             onClick={() => setTab(t.key)} style={{textTransform:'uppercase'}}>
//             {t.label}
//           </button>
//         ))}
//       </div>

//       {/* ── Approvals tab ── */}
//       {tab === 'approvals' && (
//         <div>
//           {pending.length === 0 ? (
//             <div className="card" style={{textAlign:'center',padding:'2.5rem',color:'#444'}}>
//               ✓ No pending submissions. All caught up!
//             </div>
//           ) : (
//             <div style={{display:'flex',flexDirection:'column',gap:'.75rem'}}>
//               {pending.map(score => {
//                 const battle = score.battle
//                 const mySide   = score.side === 'challenger' ? battle?.challenger_side : battle?.opponent_side
//                 const oppSide  = score.side === 'challenger' ? battle?.opponent_side   : battle?.challenger_side
//                 return (
//                   <div key={score.id} className="card" style={{borderColor:'#f9731622'}}>
//                     <div className="flex items-center justify-between" style={{flexWrap:'wrap',gap:'1rem'}}>
//                       <div className="flex items-center gap1">
//                         <Avatar name={score.logger?.username} color={score.logger?.color} size={36}/>
//                         <div>
//                           <div style={{fontWeight:700}}>{score.logger?.username}</div>
//                           <div className="text-xs text-muted">
//                             {mySide?.name} vs {oppSide?.name} · Day {score.day_number} · {score.log_date}
//                           </div>
//                         </div>
//                       </div>
//                       <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
//                         <div style={{textAlign:'right'}}>
//                           <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,color:'#00e5ff',lineHeight:1}}>
//                             {score.itr_count}
//                           </div>
//                           <div className="text-xs text-muted">ITRs submitted</div>
//                         </div>
//                         <button className="btn btn-success btn-sm" onClick={() => handleApprove(score)} disabled={saving}>
//                           ✓ Approve
//                         </button>
//                         <button className="btn btn-danger btn-sm" onClick={() => { setRejectModal(score); setRejectNote('') }} disabled={saving}>
//                           ✗ Reject
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 )
//               })}
//             </div>
//           )}
//         </div>
//       )}

//       {/* ── Players tab ── */}
//       {tab === 'players' && (
//         <div className="card">
//           <table className="admin-table">
//             <thead>
//               <tr><th>Player</th><th>Email</th><th>Team</th><th>ITRs</th><th>Wins</th><th>Admin</th></tr>
//             </thead>
//             <tbody>
//               {profiles.map(p => (
//                 <tr key={p.id}>
//                   <td>
//                     <div className="flex items-center gap1">
//                       <Avatar name={p.username} color={p.color} size={28}/>
//                       <span style={{fontWeight:600}}>{p.username}</span>
//                     </div>
//                   </td>
//                   <td className="text-muted text-sm">{p.email}</td>
//                   <td>
//                     <select className="input" style={{padding:'4px 8px',fontSize:13,width:'auto'}}
//                       value={p.team_id||''} onChange={e => assignTeam(p.id, e.target.value)}>
//                       <option value="">No team</option>
//                       {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
//                     </select>
//                   </td>
//                   <td style={{fontFamily:"'Bebas Neue',sans-serif",color:'#00e5ff',fontSize:16}}>{(p.total_itrs||0).toLocaleString()}</td>
//                   <td className="text-muted">{p.battle_wins||0}</td>
//                   <td>
//                     <button className={`btn btn-sm ${p.is_admin?'btn-danger':'btn-ghost'}`}
//                       onClick={() => toggleAdmin(p.id, p.is_admin)}>
//                       {p.is_admin?'Remove':'Grant'}
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//           {profiles.length === 0 && <p className="text-muted text-sm" style={{padding:'1rem'}}>No players yet.</p>}
//         </div>
//       )}

//       {/* ── Teams tab ── */}
//       {tab === 'teams' && (
//         <div className="card">
//           <table className="admin-table">
//             <thead>
//               <tr><th>Team</th><th>Tag</th><th>Total ITRs</th><th>Battle Wins</th></tr>
//             </thead>
//             <tbody>
//               {teams.map(t => (
//                 <tr key={t.id}>
//                   <td>
//                     <div className="flex items-center gap1">
//                       <TeamLogo tag={t.tag} color={t.color} size={28}/>
//                       <span style={{fontWeight:600}}>{t.name}</span>
//                     </div>
//                   </td>
//                   <td><span className="tag tag-gray">{t.tag}</span></td>
//                   <td style={{fontFamily:"'Bebas Neue',sans-serif",color:'#00e5ff',fontSize:16}}>{(t.total_itrs||0).toLocaleString()}</td>
//                   <td className="text-muted">{t.battle_wins||0}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Reject Modal */}
//       {rejectModal && (
//         <Modal onClose={() => setRejectModal(null)} maxWidth={420}>
//           <h2 style={{fontSize:20,marginBottom:'1rem'}}>✗ REJECT SUBMISSION</h2>
//           <p className="text-muted text-sm mb2">
//             Rejecting <strong style={{color:'#fff'}}>{rejectModal.logger?.username}</strong>'s
//             submission of <strong style={{color:'#00e5ff'}}>{rejectModal.itr_count} ITRs</strong> for Day {rejectModal.day_number}.
//             They will be asked to resubmit.
//           </p>
//           <div>
//             <label className="input-label">Reason (shown to player)</label>
//             <input className="input mb2" placeholder="e.g. Number doesn't match CRM data"
//               value={rejectNote} onChange={e => setRejectNote(e.target.value)}/>
//           </div>
//           <div className="flex gap1">
//             <button className="btn btn-danger" style={{flex:1}} onClick={handleReject} disabled={saving}>
//               {saving ? 'Rejecting…' : 'Confirm Reject'}
//             </button>
//             <button className="btn btn-ghost" onClick={() => setRejectModal(null)}>Cancel</button>
//           </div>
//         </Modal>
//       )}

//       {/* Add Player Modal */}
//       {showPlayer && (
//         <Modal onClose={() => setShowPlayer(false)}>
//           <h2 style={{fontSize:22,marginBottom:'1rem'}}>➕ ADD PLAYER</h2>
//           <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
//             <div>
//               <label className="input-label">Username</label>
//               <input className="input" placeholder="e.g. DragonSlayer" value={pForm.username}
//                 onChange={e => setPForm(f => ({...f,username:e.target.value}))}/>
//             </div>
//             <div>
//               <label className="input-label">Email</label>
//               <input className="input" type="email" placeholder="player@company.com" value={pForm.email}
//                 onChange={e => setPForm(f => ({...f,email:e.target.value}))}/>
//             </div>
//             <div>
//               <label className="input-label">Team (optional)</label>
//               <select className="input" value={pForm.teamId} onChange={e => setPForm(f => ({...f,teamId:e.target.value}))}>
//                 <option value="">No team</option>
//                 {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
//               </select>
//             </div>
//             <div>
//               <label className="input-label">Avatar colour</label>
//               <div className="flex gap1" style={{flexWrap:'wrap'}}>
//                 {COLORS.map(c => (
//                   <div key={c} onClick={() => setPForm(f => ({...f,color:c}))}
//                     style={{width:28,height:28,borderRadius:'50%',background:c,cursor:'pointer',
//                       border:pForm.color===c?'3px solid #fff':'3px solid transparent'}}/>
//                 ))}
//               </div>
//             </div>
//             <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:14}}>
//               <input type="checkbox" checked={pForm.isAdmin}
//                 onChange={e => setPForm(f => ({...f,isAdmin:e.target.checked}))}/>
//               Grant admin access
//             </label>
//             {pError && <div className="form-error">⚠ {pError}</div>}
//             <div className="flex gap1">
//               <button className="btn btn-primary" style={{flex:1}} onClick={createPlayer} disabled={saving}>
//                 {saving?'Inviting…':'Invite Player'}
//               </button>
//               <button className="btn btn-ghost" onClick={() => setShowPlayer(false)}>Cancel</button>
//             </div>
//           </div>
//         </Modal>
//       )}

//       {/* Add Team Modal */}
//       {showTeam && (
//         <Modal onClose={() => setShowTeam(false)} maxWidth={420}>
//           <h2 style={{fontSize:22,marginBottom:'1rem'}}>➕ ADD TEAM</h2>
//           <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
//             <div>
//               <label className="input-label">Team name</label>
//               <input className="input" placeholder="e.g. Neon Wolves" value={tForm.name}
//                 onChange={e => setTForm(f => ({...f,name:e.target.value}))}/>
//             </div>
//             <div>
//               <label className="input-label">Short tag (2–3 letters)</label>
//               <input className="input" placeholder="e.g. NW" maxLength={3} value={tForm.tag}
//                 onChange={e => setTForm(f => ({...f,tag:e.target.value.toUpperCase()}))}/>
//             </div>
//             <div>
//               <label className="input-label">Team colour</label>
//               <div className="flex gap1" style={{flexWrap:'wrap'}}>
//                 {COLORS.map(c => (
//                   <div key={c} onClick={() => setTForm(f => ({...f,color:c}))}
//                     style={{width:28,height:28,borderRadius:'50%',background:c,cursor:'pointer',
//                       border:tForm.color===c?'3px solid #fff':'3px solid transparent'}}/>
//                 ))}
//               </div>
//             </div>
//             <div className="flex gap1">
//               <button className="btn btn-primary" style={{flex:1}} onClick={createTeam} disabled={saving}>
//                 {saving?'Creating…':'Create Team'}
//               </button>
//               <button className="btn btn-ghost" onClick={() => setShowTeam(false)}>Cancel</button>
//             </div>
//           </div>
//         </Modal>
//       )}
//     </div>
//   )
// }
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { Avatar, TeamLogo, Spinner, Modal } from '../components/UI'

const COLORS = ['#ff3c5c','#00e5ff','#a855f7','#f97316','#22d3ee','#84cc16','#f43f5e','#06b6d4']

export default function AdminPage() {
  const { profile } = useAuth()
  const [tab,      setTab]      = useState('approvals')
  const [profiles, setProfiles] = useState([])
  const [teams,    setTeams]    = useState([])
  const [pending,  setPending]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [showPlayer, setShowPlayer] = useState(false)
  const [pForm, setPForm] = useState({ email:'', username:'', color:COLORS[0], teamId:'', isAdmin:false })
  const [pError, setPError] = useState('')
  const [showTeam, setShowTeam] = useState(false)
  const [tForm, setTForm] = useState({ name:'', tag:'', color:COLORS[0] })
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectNote,  setRejectNote]  = useState('')

  async function load() {
    const [{ data: p }, { data: t }] = await Promise.all([
      supabase.from('profiles').select('id,username,email,color,total_itrs,battle_wins,is_admin,roles,team_id,teams(name,tag,color)').order('username'),
      supabase.from('teams').select('id,name,tag,color,total_itrs,battle_wins').order('name'),
    ])
    setProfiles(p || [])
    setTeams(t || [])
    await loadPending()
    setLoading(false)
  }

  async function loadPending() {
    const { data } = await supabase
      .from('daily_scores')
      .select(`
        id, side, day_number, itr_count, log_date, status, rejection_note, logged_by, battle_id,
        logger:profiles!daily_scores_logged_by_fkey(username, color),
        battle:battles!daily_scores_battle_id_fkey(
          id, battle_type,
          challenger_side:challenger_side_id(name,color),
          opponent_side:opponent_side_id(name,color)
        )
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
    setPending(data || [])
  }

  useEffect(() => { load() }, [])

  async function createPlayer() {
    if (!pForm.email || !pForm.username) { setPError('Email and username are required.'); return }
    setSaving(true); setPError('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(
        'https://pimnifngytxdzdjbghor.supabase.co/functions/v1/create-user',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
          body: JSON.stringify({ email:pForm.email, username:pForm.username, color:pForm.color, team_id:pForm.teamId||null, isAdmin:pForm.isAdmin })
        }
      )
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to invite user')
      setShowPlayer(false)
      setPForm({ email:'', username:'', color:COLORS[0], teamId:'', isAdmin:false })
      load()
    } catch (err) { setPError(err.message) }
    finally { setSaving(false) }
  }

  async function createTeam() {
    if (!tForm.name || !tForm.tag) return
    setSaving(true)
    await supabase.from('teams').insert({ name:tForm.name, tag:tForm.tag.toUpperCase().slice(0,3), color:tForm.color, total_itrs:0, battle_wins:0 })
    setSaving(false); setShowTeam(false)
    setTForm({ name:'', tag:'', color:COLORS[0] }); load()
  }

  async function assignTeam(userId, teamId) {
    await supabase.from('profiles').update({ team_id: teamId||null }).eq('id', userId)
    load()
  }

  // Fix: update BOTH is_admin boolean AND roles array so edge function + frontend both work
  async function toggleAdmin(userId, currentIsAdmin) {
    const newIsAdmin = !currentIsAdmin
    const newRoles = newIsAdmin ? ['ADMIN'] : ['PLAYER']
    await supabase.from('profiles').update({
      is_admin: newIsAdmin,
      roles: newRoles,
    }).eq('id', userId)
    load()
  }

  async function handleApprove(score) {
    setSaving(true)
    await supabase.from('daily_scores').update({
      status: 'approved', approved_by: profile.id, rejection_note: null,
    }).eq('id', score.id)
    await supabase.rpc('increment_total_itrs', { uid: score.logged_by, amount: score.itr_count })

    // Check if battle complete
    const { data: allScores } = await supabase.from('daily_scores').select('side,itr_count,status').eq('battle_id', score.battle_id)
    const { data: battle } = await supabase.from('battles').select('duration_days,start_date').eq('id', score.battle_id).single()
    const approved = (allScores||[]).map(s => s.id === score.id ? {...s, status:'approved'} : s).filter(s=>s.status==='approved')
    const durationDays = battle?.duration_days || 7

    // Check if duration has elapsed and both sides have submitted
    const cTotal = approved.filter(s=>s.side==='challenger').reduce((a,b)=>a+b.itr_count,0)
    const oTotal = approved.filter(s=>s.side==='opponent').reduce((a,b)=>a+b.itr_count,0)
    const endDate = battle?.start_date ? new Date(new Date(battle.start_date).getTime() + durationDays*86400000) : null
    const isExpired = endDate && new Date() >= endDate

    if (isExpired) {
      const winner = cTotal >= oTotal ? 'challenger' : 'opponent'
      await supabase.from('battles').update({ status:'completed', winner_side:winner }).eq('id', score.battle_id)
    }
    setSaving(false); loadPending()
  }

  async function handleReject() {
    if (!rejectModal) return
    setSaving(true)
    await supabase.from('daily_scores').update({
      status: 'rejected',
      rejection_note: rejectNote || 'Please resubmit with the correct number.',
    }).eq('id', rejectModal.id)
    setSaving(false); setRejectModal(null); setRejectNote(''); loadPending()
  }

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'4rem'}}><Spinner size={32}/></div>

  return (
    <div>
      <div className="flex items-center justify-between mb3">
        <div>
          <h1 className="section-title">⚙ ADMIN</h1>
          <p className="section-sub">Manage players, teams & approvals</p>
        </div>
        <div className="flex gap1">
          <button className="btn btn-primary btn-sm" onClick={()=>setShowPlayer(true)}>+ Add Player</button>
          <button className="btn btn-secondary btn-sm" onClick={()=>setShowTeam(true)}>+ Add Team</button>
        </div>
      </div>

      <div className="flex gap1 mb3">
        {[
          { key:'approvals', label:`⏳ Approvals${pending.length>0?` (${pending.length})`:''}` },
          { key:'players',   label:'👤 Players' },
          { key:'teams',     label:'⚔ Teams' },
        ].map(t=>(
          <button key={t.key} className={`btn btn-sm ${tab===t.key?'btn-primary':'btn-ghost'}`}
            onClick={()=>setTab(t.key)} style={{textTransform:'uppercase'}}>{t.label}</button>
        ))}
      </div>

      {/* Approvals */}
      {tab==='approvals' && (
        <div>
          {pending.length===0 ? (
            <div className="card" style={{textAlign:'center',padding:'2.5rem',color:'#444'}}>✓ No pending submissions!</div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:'.75rem'}}>
              {pending.map(score=>{
                const battle = score.battle
                const mySide  = score.side==='challenger'?battle?.challenger_side:battle?.opponent_side
                const oppSide = score.side==='challenger'?battle?.opponent_side:battle?.challenger_side
                return (
                  <div key={score.id} className="card" style={{borderColor:'#f9731622'}}>
                    <div className="flex items-center justify-between" style={{flexWrap:'wrap',gap:'1rem'}}>
                      <div className="flex items-center gap1">
                        <Avatar name={score.logger?.username} color={score.logger?.color} size={36}/>
                        <div>
                          <div style={{fontWeight:700}}>{score.logger?.username}</div>
                          <div className="text-xs text-muted">
                            {mySide?.name} vs {oppSide?.name} · Day {score.day_number} · {score.log_date}
                          </div>
                        </div>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
                        <div style={{textAlign:'right'}}>
                          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,color:'#00e5ff',lineHeight:1}}>{score.itr_count}</div>
                          <div className="text-xs text-muted">ITRs submitted</div>
                        </div>
                        <button className="btn btn-success btn-sm" onClick={()=>handleApprove(score)} disabled={saving}>✓ Approve</button>
                        <button className="btn btn-danger btn-sm" onClick={()=>{setRejectModal(score);setRejectNote('')}} disabled={saving}>✗ Reject</button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Players */}
      {tab==='players' && (
        <div className="card">
          <table className="admin-table">
            <thead>
              <tr><th>Player</th><th>Email</th><th>Team</th><th>ITRs</th><th>Wins</th><th>Admin</th></tr>
            </thead>
            <tbody>
              {profiles.map(p=>(
                <tr key={p.id}>
                  <td>
                    <div className="flex items-center gap1">
                      <Avatar name={p.username} color={p.color} size={28}/>
                      <span style={{fontWeight:600}}>{p.username}</span>
                    </div>
                  </td>
                  <td className="text-muted text-sm">{p.email}</td>
                  <td>
                    <select className="input" style={{padding:'4px 8px',fontSize:13,width:'auto'}}
                      value={p.team_id||''} onChange={e=>assignTeam(p.id,e.target.value)}>
                      <option value="">No team</option>
                      {teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </td>
                  <td style={{fontFamily:"'Bebas Neue',sans-serif",color:'#00e5ff',fontSize:16}}>{(p.total_itrs||0).toLocaleString()}</td>
                  <td className="text-muted">{p.battle_wins||0}</td>
                  <td>
                    <button className={`btn btn-sm ${p.is_admin?'btn-danger':'btn-ghost'}`}
                      onClick={()=>toggleAdmin(p.id, p.is_admin)}>
                      {p.is_admin?'Remove':'Grant'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {profiles.length===0&&<p className="text-muted text-sm" style={{padding:'1rem'}}>No players yet.</p>}
        </div>
      )}

      {/* Teams */}
      {tab==='teams' && (
        <div className="card">
          <table className="admin-table">
            <thead><tr><th>Team</th><th>Tag</th><th>Total ITRs</th><th>Battle Wins</th></tr></thead>
            <tbody>
              {teams.map(t=>(
                <tr key={t.id}>
                  <td>
                    <div className="flex items-center gap1">
                      <TeamLogo tag={t.tag} color={t.color} size={28}/>
                      <span style={{fontWeight:600}}>{t.name}</span>
                    </div>
                  </td>
                  <td><span className="tag tag-gray">{t.tag}</span></td>
                  <td style={{fontFamily:"'Bebas Neue',sans-serif",color:'#00e5ff',fontSize:16}}>{(t.total_itrs||0).toLocaleString()}</td>
                  <td className="text-muted">{t.battle_wins||0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <Modal onClose={()=>setRejectModal(null)} maxWidth={420}>
          <h2 style={{fontSize:20,marginBottom:'1rem'}}>✗ REJECT SUBMISSION</h2>
          <p className="text-muted text-sm mb2">
            Rejecting <strong style={{color:'#fff'}}>{rejectModal.logger?.username}</strong>'s
            submission of <strong style={{color:'#00e5ff'}}>{rejectModal.itr_count} ITRs</strong>.
          </p>
          <div>
            <label className="input-label">Reason (shown to player)</label>
            <input className="input mb2" placeholder="e.g. Number doesn't match CRM data"
              value={rejectNote} onChange={e=>setRejectNote(e.target.value)}/>
          </div>
          <div className="flex gap1">
            <button className="btn btn-danger" style={{flex:1}} onClick={handleReject} disabled={saving}>
              {saving?'Rejecting…':'Confirm Reject'}
            </button>
            <button className="btn btn-ghost" onClick={()=>setRejectModal(null)}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* Add Player Modal */}
      {showPlayer && (
        <Modal onClose={()=>setShowPlayer(false)}>
          <h2 style={{fontSize:22,marginBottom:'1rem'}}>➕ ADD PLAYER</h2>
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div>
              <label className="input-label">Username</label>
              <input className="input" placeholder="e.g. DragonSlayer" value={pForm.username}
                onChange={e=>setPForm(f=>({...f,username:e.target.value}))}/>
            </div>
            <div>
              <label className="input-label">Email</label>
              <input className="input" type="email" placeholder="player@company.com" value={pForm.email}
                onChange={e=>setPForm(f=>({...f,email:e.target.value}))}/>
            </div>
            <div>
              <label className="input-label">Team (optional)</label>
              <select className="input" value={pForm.teamId} onChange={e=>setPForm(f=>({...f,teamId:e.target.value}))}>
                <option value="">No team</option>
                {teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Avatar colour</label>
              <div className="flex gap1" style={{flexWrap:'wrap'}}>
                {COLORS.map(c=>(
                  <div key={c} onClick={()=>setPForm(f=>({...f,color:c}))}
                    style={{width:28,height:28,borderRadius:'50%',background:c,cursor:'pointer',
                      border:pForm.color===c?'3px solid #fff':'3px solid transparent'}}/>
                ))}
              </div>
            </div>
            <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',fontSize:14}}>
              <input type="checkbox" checked={pForm.isAdmin} onChange={e=>setPForm(f=>({...f,isAdmin:e.target.checked}))}/>
              Grant admin access
            </label>
            {pError&&<div className="form-error">⚠ {pError}</div>}
            <div className="flex gap1">
              <button className="btn btn-primary" style={{flex:1}} onClick={createPlayer} disabled={saving}>
                {saving?'Inviting…':'Invite Player'}
              </button>
              <button className="btn btn-ghost" onClick={()=>setShowPlayer(false)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Team Modal */}
      {showTeam && (
        <Modal onClose={()=>setShowTeam(false)} maxWidth={420}>
          <h2 style={{fontSize:22,marginBottom:'1rem'}}>➕ ADD TEAM</h2>
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div>
              <label className="input-label">Team name</label>
              <input className="input" placeholder="e.g. Neon Wolves" value={tForm.name}
                onChange={e=>setTForm(f=>({...f,name:e.target.value}))}/>
            </div>
            <div>
              <label className="input-label">Short tag (2–3 letters)</label>
              <input className="input" placeholder="e.g. NW" maxLength={3} value={tForm.tag}
                onChange={e=>setTForm(f=>({...f,tag:e.target.value.toUpperCase()}))}/>
            </div>
            <div>
              <label className="input-label">Team colour</label>
              <div className="flex gap1" style={{flexWrap:'wrap'}}>
                {COLORS.map(c=>(
                  <div key={c} onClick={()=>setTForm(f=>({...f,color:c}))}
                    style={{width:28,height:28,borderRadius:'50%',background:c,cursor:'pointer',
                      border:tForm.color===c?'3px solid #fff':'3px solid transparent'}}/>
                ))}
              </div>
            </div>
            <div className="flex gap1">
              <button className="btn btn-primary" style={{flex:1}} onClick={createTeam} disabled={saving}>
                {saving?'Creating…':'Create Team'}
              </button>
              <button className="btn btn-ghost" onClick={()=>setShowTeam(false)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
