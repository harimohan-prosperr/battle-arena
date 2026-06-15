
// import { useEffect, useState, useCallback } from 'react'
// import { supabase } from '../lib/supabase'
// import { useAuth } from '../lib/AuthContext'
// import BattleCard from '../components/BattleCard'
// import { Modal, Spinner, Empty } from '../components/UI'

// const COLORS = ['#ff3c5c','#00e5ff','#a855f7','#f97316','#22d3ee','#84cc16']

// export default function Battles() {
//   const { profile } = useAuth()
//   const [battles,  setBattles]  = useState([])
//   const [profiles, setProfiles] = useState([])
//   const [teams,    setTeams]    = useState([])
//   const [loading,  setLoading]  = useState(true)
//   const [showNew,  setShowNew]  = useState(false)
//   const [logModal, setLogModal] = useState(null)
//   const [itrVal,   setItrVal]   = useState('')
//   const [saving,   setSaving]   = useState(false)
//   const [form, setForm] = useState({
//     type:'solo', challengerType:'player', challengerIds:[], challengerTeamId:'',
//     opponentType:'player', opponentIds:[], opponentTeamId:'', wager:''
//   })

//   const loadBattles = useCallback(async () => {
//     const { data } = await supabase
//       .from('battles')
//       .select(`*,
//         challenger_side:challenger_side_id(name,tag,color),
//         opponent_side:opponent_side_id(name,tag,color),
//         challenger_members:battle_members!battle_members_battle_id_fkey(user_id,side,username:profiles(username)),
//         daily_scores(side,day_number,itr_count,log_date,status,rejection_note,logged_by)
//       `)
//       .order('created_at', { ascending: false })

//     const fixed = (data||[]).map(b => ({
//       ...b,
//       challenger_members: b.challenger_members?.filter(m=>m.side==='challenger').map(m=>({...m,username:m.username?.username})),
//       opponent_members:   b.challenger_members?.filter(m=>m.side==='opponent').map(m=>({...m,username:m.username?.username})),
//     }))
//     setBattles(fixed)
//     setLoading(false)
//   }, [])

//   useEffect(() => {
//     loadBattles()
//     supabase.from('profiles').select('id,username,color').then(({data})=>setProfiles(data||[]))
//     supabase.from('teams').select('id,name,tag,color').then(({data})=>setTeams(data||[]))
//     const sub = supabase.channel('battles-channel')
//       .on('postgres_changes',{event:'*',schema:'public',table:'battles'},loadBattles)
//       .on('postgres_changes',{event:'*',schema:'public',table:'daily_scores'},loadBattles)
//       .subscribe()
//     return () => supabase.removeChannel(sub)
//   }, [loadBattles])

//   async function handleAccept(battleId) {
//     await supabase.from('battles').update({ status:'active', start_date:new Date().toISOString().slice(0,10) }).eq('id',battleId)
//     loadBattles()
//   }

//   async function handleLogScore() {
//     const count = parseInt(itrVal)
//     if (isNaN(count) || count < 0) return
//     setSaving(true)
//     const { battle, role } = logModal
//     const today = new Date().toISOString().slice(0,10)

//     // Check if there's a rejected entry for today → resubmit it
//     const rejected = battle.daily_scores?.find(s => s.side===role && s.log_date===today && s.status==='rejected')
//     if (rejected) {
//       await supabase.from('daily_scores')
//         .update({ itr_count:count, status:'pending', rejection_note:null, logged_by:profile.id })
//         .eq('battle_id', battle.id).eq('side', role).eq('log_date', today)
//     } else {
//       const approvedDays = battle.daily_scores?.filter(s=>s.side===role && s.status==='approved').length || 0
//       await supabase.from('daily_scores').insert({
//         battle_id: battle.id, side: role,
//         day_number: approvedDays + 1,
//         itr_count: count, log_date: today,
//         logged_by: profile.id, status: 'pending',
//       })
//     }
//     setSaving(false); setLogModal(null); setItrVal(''); loadBattles()
//   }

//   async function handleCreate() {
//     if (!profile) return
//     setSaving(true)
//     const isSoloC = form.type==='solo' || form.challengerType==='player'
//     const isSoloO = form.type==='solo' || form.opponentType==='player'
//     let cSide, oSide
//     if (isSoloC) {
//       const p = profiles.find(x=>x.id===form.challengerIds[0])||profile
//       cSide = { name:p.username, tag:p.username.slice(0,2).toUpperCase(), color:p.color||COLORS[0] }
//     } else {
//       const t = teams.find(x=>x.id===form.challengerTeamId)
//       cSide = { name:t?.name||'Team', tag:t?.tag||'TM', color:t?.color||COLORS[0] }
//     }
//     if (isSoloO) {
//       const p = profiles.find(x=>x.id===form.opponentIds[0])
//       oSide = { name:p?.username||'Opponent', tag:(p?.username||'OP').slice(0,2).toUpperCase(), color:p?.color||COLORS[1] }
//     } else {
//       const t = teams.find(x=>x.id===form.opponentTeamId)
//       oSide = { name:t?.name||'Team', tag:t?.tag||'TM', color:t?.color||COLORS[1] }
//     }
//     const { data:cSideRow } = await supabase.from('battle_sides').insert(cSide).select().single()
//     const { data:oSideRow } = await supabase.from('battle_sides').insert(oSide).select().single()
//     const { data:newBattle } = await supabase.from('battles').insert({
//       battle_type:form.type, status:'pending',
//       challenger_side_id:cSideRow.id, opponent_side_id:oSideRow.id,
//       wager:form.wager||'Bragging Rights', created_by:profile.id,
//     }).select().single()
//     const cMembers = isSoloC
//       ? [{battle_id:newBattle.id, user_id:form.challengerIds[0]||profile.id, side:'challenger'}]
//       : form.challengerIds.map(uid=>({battle_id:newBattle.id, user_id:uid, side:'challenger'}))
//     const oMembers = isSoloO
//       ? [{battle_id:newBattle.id, user_id:form.opponentIds[0], side:'opponent'}]
//       : form.opponentIds.map(uid=>({battle_id:newBattle.id, user_id:uid, side:'opponent'}))
//     await supabase.from('battle_members').insert([...cMembers,...oMembers])
//     setSaving(false); setShowNew(false)
//     setForm({type:'solo',challengerType:'player',challengerIds:[],challengerTeamId:'',opponentType:'player',opponentIds:[],opponentTeamId:'',wager:''})
//     loadBattles()
//   }

//   if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'4rem'}}><Spinner size={32}/></div>

//   return (
//     <div>
//       <div className="flex items-center justify-between mb3">
//         <div>
//           <h1 className="section-title">BATTLES</h1>
//           <p className="section-sub">7-day ITR filling competitions</p>
//         </div>
//         <button className="btn btn-primary" onClick={()=>setShowNew(true)}>⚔ Issue Challenge</button>
//       </div>

//       <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
//         {battles.map(b=>(
//           <BattleCard key={b.id} battle={b} myId={profile?.id}
//             onAccept={handleAccept}
//             onLogScore={(b,r)=>{setLogModal({battle:b,role:r});setItrVal('')}}
//           />
//         ))}
//         {battles.length===0 && <Empty message="No battles yet. Issue the first challenge!"/>}
//       </div>

//       {/* New Battle Modal */}
//       {showNew && (
//         <Modal onClose={()=>setShowNew(false)}>
//           <h2 style={{fontSize:24,marginBottom:'.5rem'}}>⚔ ISSUE CHALLENGE</h2>
//           <p className="text-muted text-sm mb2">Whoever fills the most ITRs in 7 days wins.</p>
//           <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
//             <div>
//               <label className="input-label">Battle type</label>
//               <div className="flex gap1">
//                 {['solo','team'].map(t=>(
//                   <button key={t} className={`btn btn-sm ${form.type===t?'btn-primary':'btn-secondary'}`}
//                     onClick={()=>setForm(f=>({...f,type:t}))}>
//                     {t==='solo'?'1v1 Solo':'Team vs Team'}
//                   </button>
//                 ))}
//               </div>
//             </div>
//             <div>
//               <label className="input-label">{form.type==='solo'?'Challenger':'Your side'}</label>
//               {form.type==='solo'
//                 ? <select className="input" value={form.challengerIds[0]||''} onChange={e=>setForm(f=>({...f,challengerIds:[e.target.value]}))}>
//                     <option value="">Select player…</option>
//                     {profiles.map(p=><option key={p.id} value={p.id}>{p.username}</option>)}
//                   </select>
//                 : <select className="input" value={form.challengerTeamId} onChange={e=>setForm(f=>({...f,challengerTeamId:e.target.value}))}>
//                     <option value="">Select team…</option>
//                     {teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
//                   </select>
//               }
//             </div>
//             <div>
//               <label className="input-label">{form.type==='solo'?'Opponent player':'Opponent team'}</label>
//               {form.type==='solo'
//                 ? <select className="input" value={form.opponentIds[0]||''} onChange={e=>setForm(f=>({...f,opponentIds:[e.target.value]}))}>
//                     <option value="">Select player…</option>
//                     {profiles.map(p=><option key={p.id} value={p.id}>{p.username}</option>)}
//                   </select>
//                 : <select className="input" value={form.opponentTeamId} onChange={e=>setForm(f=>({...f,opponentTeamId:e.target.value}))}>
//                     <option value="">Select team…</option>
//                     {teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}
//                   </select>
//               }
//             </div>
//             <div>
//               <label className="input-label">Stakes / Wager</label>
//               <input className="input" placeholder="e.g. Bragging Rights" value={form.wager}
//                 onChange={e=>setForm(f=>({...f,wager:e.target.value}))}/>
//             </div>
//             <div className="info-box">
//               <div className="info-box-title">📋 How it works</div>
//               <div className="info-box-body">
//                 1. Opponent accepts → 7-day window opens<br/>
//                 2. Each side logs their daily ITR count<br/>
//                 3. An admin approves each submission<br/>
//                 4. Highest approved total after 7 days wins
//               </div>
//             </div>
//             <div style={{display:'flex',gap:'.75rem'}}>
//               <button className="btn btn-primary" style={{flex:1}} onClick={handleCreate} disabled={saving}>
//                 {saving?'Sending…':'Send Challenge'}
//               </button>
//               <button className="btn btn-ghost" onClick={()=>setShowNew(false)}>Cancel</button>
//             </div>
//           </div>
//         </Modal>
//       )}

//       {/* Log Score Modal */}
//       {logModal && (() => {
//         const { battle, role } = logModal
//         const today = new Date().toISOString().slice(0,10)
//         const todayScore    = battle.daily_scores?.find(s=>s.side===role && s.log_date===today)
//         const approvedDays  = battle.daily_scores?.filter(s=>s.side===role && s.status==='approved').length||0
//         const isRejected    = todayScore?.status==='rejected'
//         const isPending     = todayScore?.status==='pending'
//         return (
//           <Modal onClose={()=>setLogModal(null)} maxWidth={380}>
//             <h2 style={{fontSize:22,marginBottom:'.5rem'}}>📋 LOG TODAY'S ITRs</h2>
//             {isPending ? (
//               <div>
//                 <div className="info-box mb2">
//                   <div className="info-box-title">⏳ Pending approval</div>
//                   <div className="info-box-body">
//                     You submitted <strong style={{color:'#00e5ff'}}>{todayScore.itr_count} ITRs</strong> today. Waiting for admin to approve.
//                   </div>
//                 </div>
//                 <button className="btn btn-ghost btn-full" onClick={()=>setLogModal(null)}>Close</button>
//               </div>
//             ) : (
//               <div>
//                 {isRejected && (
//                   <div style={{background:'#ff3c5c11',border:'1px solid #ff3c5c33',borderRadius:6,padding:'10px 14px',marginBottom:'1rem'}}>
//                     <div style={{color:'#ff3c5c',fontWeight:700,fontSize:13,marginBottom:4}}>✗ Submission rejected</div>
//                     <div style={{color:'#888',fontSize:12}}>{todayScore.rejection_note||'No reason given.'} Please resubmit.</div>
//                   </div>
//                 )}
//                 <p className="text-muted text-sm mb2">Day {approvedDays+1} of 7 — how many ITRs did you fill today?</p>
//                 <input className="input mb2" type="number" min="0" step="1" placeholder="e.g. 87"
//                   value={itrVal} onChange={e=>setItrVal(e.target.value)}
//                   style={{fontSize:30,textAlign:'center',fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2,padding:'14px'}}
//                   autoFocus/>
//                 <div className="info-box mb2">
//                   <div className="info-box-body">Your score counts after an admin approves it.</div>
//                 </div>
//                 <div className="flex gap1">
//                   <button className="btn btn-primary" style={{flex:1}} onClick={handleLogScore} disabled={saving}>
//                     {saving?'Saving…':isRejected?'Resubmit':'Submit for Approval'}
//                   </button>
//                   <button className="btn btn-ghost" onClick={()=>setLogModal(null)}>Cancel</button>
//                 </div>
//               </div>
//             )}
//           </Modal>
//         )
//       })()}
//     </div>
//   )
// }

// import { useEffect, useState, useCallback } from 'react'
// import { supabase } from '../lib/supabase'
// import { useAuth } from '../lib/AuthContext'
// import BattleCard from '../components/BattleCard'
// import { Modal, Spinner, Empty } from '../components/UI'

// const COLORS = ['#ff3c5c','#00e5ff','#a855f7','#f97316','#22d3ee','#84cc16']

// export default function Battles() {
//   const { profile } = useAuth()
//   const [battles,  setBattles]  = useState([])
//   const [profiles, setProfiles] = useState([])
//   const [loading,  setLoading]  = useState(true)
//   const [showNew,  setShowNew]  = useState(false)
//   const [logModal, setLogModal] = useState(null)
//   const [itrVal,   setItrVal]   = useState('')
//   const [saving,   setSaving]   = useState(false)
//   const [form, setForm] = useState({ opponentId:'', wager:'', duration:7 })

//   const loadBattles = useCallback(async () => {
//     const { data } = await supabase
//       .from('battles')
//       .select(`*,
//         challenger_side:challenger_side_id(name,tag,color),
//         opponent_side:opponent_side_id(name,tag,color),
//         challenger_members:battle_members!battle_members_battle_id_fkey(user_id,side,username:profiles(username)),
//         daily_scores(id,side,day_number,itr_count,log_date,status,rejection_note,logged_by)
//       `)
//       .order('created_at', { ascending: false })

//     const fixed = (data||[]).map(b => ({
//       ...b,
//       challenger_members: b.challenger_members?.filter(m=>m.side==='challenger').map(m=>({...m,username:m.username?.username})),
//       opponent_members:   b.challenger_members?.filter(m=>m.side==='opponent').map(m=>({...m,username:m.username?.username})),
//     }))
//     setBattles(fixed)
//     setLoading(false)
//   }, [])

//   useEffect(() => {
//     loadBattles()
//     // Load same-team players only (for opponent selection)
//     if (profile?.team_id) {
//       supabase.from('profiles')
//         .select('id,username,color,team_id')
//         .eq('team_id', profile.team_id)
//         .neq('id', profile.id)
//         .then(({data}) => setProfiles(data||[]))
//     } else {
//       // No team — load all except self (admin fallback)
//       supabase.from('profiles')
//         .select('id,username,color,team_id')
//         .neq('id', profile.id)
//         .then(({data}) => setProfiles(data||[]))
//     }
//     const sub = supabase.channel('battles-channel')
//       .on('postgres_changes',{event:'*',schema:'public',table:'battles'},loadBattles)
//       .on('postgres_changes',{event:'*',schema:'public',table:'daily_scores'},loadBattles)
//       .subscribe()
//     return () => supabase.removeChannel(sub)
//   }, [loadBattles, profile])

//   async function handleAccept(battleId) {
//     await supabase.from('battles').update({ status:'active', start_date:new Date().toISOString().slice(0,10) }).eq('id',battleId)
//     loadBattles()
//   }

//   async function handleLogScore() {
//     const count = parseInt(itrVal)
//     if (isNaN(count) || count < 0) return
//     setSaving(true)
//     const { battle, role } = logModal
//     const today = new Date().toISOString().slice(0,10)
//     // Always insert a new row — multiple submissions per day allowed
//     await supabase.from('daily_scores').insert({
//       battle_id: battle.id, side: role,
//       day_number: Math.floor((new Date(today) - new Date(battle.start_date)) / 86400000) + 1,
//       itr_count: count, log_date: today,
//       logged_by: profile.id, status: 'pending',
//     })
//     setSaving(false); setLogModal(null); setItrVal(''); loadBattles()
//   }

//   async function handleCreate() {
//     if (!profile || !form.opponentId) return
//     setSaving(true)
//     const opponent = profiles.find(x => x.id === form.opponentId)
//     const cSide = { name:profile.username, tag:profile.username.slice(0,2).toUpperCase(), color:profile.color||COLORS[0] }
//     const oSide = { name:opponent.username, tag:opponent.username.slice(0,2).toUpperCase(), color:opponent.color||COLORS[1] }
//     const { data:cSideRow } = await supabase.from('battle_sides').insert(cSide).select().single()
//     const { data:oSideRow } = await supabase.from('battle_sides').insert(oSide).select().single()
//     const { data:newBattle } = await supabase.from('battles').insert({
//       battle_type:'solo', status:'pending',
//       challenger_side_id:cSideRow.id, opponent_side_id:oSideRow.id,
//       wager:form.wager||'Bragging Rights',
//       duration_days: parseInt(form.duration)||7,
//       created_by:profile.id,
//     }).select().single()
//     await supabase.from('battle_members').insert([
//       { battle_id:newBattle.id, user_id:profile.id, side:'challenger' },
//       { battle_id:newBattle.id, user_id:form.opponentId, side:'opponent' },
//     ])
//     setSaving(false); setShowNew(false)
//     setForm({ opponentId:'', wager:'', duration:7 })
//     loadBattles()
//   }

//   if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'4rem'}}><Spinner size={32}/></div>

//   return (
//     <div>
//       <div className="flex items-center justify-between mb3">
//         <div>
//           <h1 className="section-title">BATTLES</h1>
//           <p className="section-sub">ITR filling competitions</p>
//         </div>
//         <button className="btn btn-primary" onClick={()=>setShowNew(true)}>⚔ Issue Challenge</button>
//       </div>

//       <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
//         {battles.map(b=>(
//           <BattleCard key={b.id} battle={b} myId={profile?.id}
//             onAccept={handleAccept}
//             onLogScore={(b,r)=>{setLogModal({battle:b,role:r});setItrVal('')}}
//           />
//         ))}
//         {battles.length===0 && <Empty message="No battles yet. Issue the first challenge!"/>}
//       </div>

//       {/* New Battle Modal */}
//       {showNew && (
//         <Modal onClose={()=>setShowNew(false)}>
//           <h2 style={{fontSize:24,marginBottom:'.5rem'}}>⚔ ISSUE CHALLENGE</h2>
//           <p className="text-muted text-sm mb2">
//             You are challenging as <strong style={{color:profile?.color||'#00e5ff'}}>{profile?.username}</strong>.
//             Pick an opponent from your team.
//           </p>
//           <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
//             <div>
//               <label className="input-label">Opponent</label>
//               <select className="input" value={form.opponentId} onChange={e=>setForm(f=>({...f,opponentId:e.target.value}))}>
//                 <option value="">Select opponent…</option>
//                 {profiles.map(p=><option key={p.id} value={p.id}>{p.username}</option>)}
//               </select>
//             </div>
//             <div>
//               <label className="input-label">Duration (days)</label>
//               <input className="input" type="number" min="1" max="90" value={form.duration}
//                 onChange={e=>setForm(f=>({...f,duration:e.target.value}))}
//                 placeholder="e.g. 7"/>
//             </div>
//             <div>
//               <label className="input-label">Stakes / Wager</label>
//               <input className="input" placeholder="e.g. Bragging Rights"
//                 value={form.wager} onChange={e=>setForm(f=>({...f,wager:e.target.value}))}/>
//             </div>
//             <div className="info-box">
//               <div className="info-box-title">📋 How it works</div>
//               <div className="info-box-body">
//                 1. Opponent accepts → battle window opens<br/>
//                 2. Log your ITRs any number of times per day<br/>
//                 3. Admin approves each submission<br/>
//                 4. Highest approved total when duration ends wins
//               </div>
//             </div>
//             <div style={{display:'flex',gap:'.75rem'}}>
//               <button className="btn btn-primary" style={{flex:1}} onClick={handleCreate} disabled={saving||!form.opponentId}>
//                 {saving?'Sending…':'Send Challenge'}
//               </button>
//               <button className="btn btn-ghost" onClick={()=>setShowNew(false)}>Cancel</button>
//             </div>
//           </div>
//         </Modal>
//       )}

//       {/* Log Score Modal */}
//       {logModal && (
//         <Modal onClose={()=>setLogModal(null)} maxWidth={380}>
//           <h2 style={{fontSize:22,marginBottom:'.5rem'}}>📋 LOG ITRs</h2>
//           <p className="text-muted text-sm mb2">
//             Submit how many ITRs you filled. You can submit multiple times — admin approves each.
//           </p>
//           <input className="input mb2" type="number" min="0" step="1" placeholder="e.g. 12"
//             value={itrVal} onChange={e=>setItrVal(e.target.value)}
//             style={{fontSize:30,textAlign:'center',fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2,padding:'14px'}}
//             autoFocus/>
//           <div className="info-box mb2">
//             <div className="info-box-body">Your score counts after an admin approves it.</div>
//           </div>
//           <div className="flex gap1">
//             <button className="btn btn-primary" style={{flex:1}} onClick={handleLogScore} disabled={saving}>
//               {saving?'Saving…':'Submit for Approval'}
//             </button>
//             <button className="btn btn-ghost" onClick={()=>setLogModal(null)}>Cancel</button>
//           </div>
//         </Modal>
//       )}
//     </div>
//   )
// }


// import { useEffect, useState, useCallback } from 'react'
// import { supabase } from '../lib/supabase'
// import { useAuth } from '../lib/AuthContext'
// import BattleCard from '../components/BattleCard'
// import { Modal, Spinner, Empty } from '../components/UI'

// const COLORS = ['#ff3c5c','#00e5ff','#a855f7','#f97316','#22d3ee','#84cc16']

// export default function Battles() {
//   const { profile } = useAuth()
//   const isAdmin = profile?.roles?.includes('ADMIN') || profile?.is_admin
//   const [battles,  setBattles]  = useState([])
//   const [allProfiles, setAllProfiles] = useState([]) // all players for admin
//   const [sameTeamProfiles, setSameTeamProfiles] = useState([]) // same-team for players
//   const [loading,  setLoading]  = useState(true)
//   const [showNew,  setShowNew]  = useState(false)
//   const [logModal, setLogModal] = useState(null)
//   const [itrVal,   setItrVal]   = useState('')
//   const [saving,   setSaving]   = useState(false)
//   // Admin form — picks both sides
//   const [adminForm, setAdminForm] = useState({ challengerId:'', opponentId:'', wager:'', duration:7 })
//   // Player form — challenger = self
//   const [playerForm, setPlayerForm] = useState({ opponentId:'', wager:'', duration:7 })

//   const loadBattles = useCallback(async () => {
//     const { data } = await supabase
//       .from('battles')
//       .select(`*,
//         challenger_side:challenger_side_id(name,tag,color),
//         opponent_side:opponent_side_id(name,tag,color),
//         challenger_members:battle_members!battle_members_battle_id_fkey(user_id,side,username:profiles(username)),
//         daily_scores(id,side,day_number,itr_count,log_date,status,rejection_note,logged_by)
//       `)
//       .order('created_at', { ascending: false })

//     const fixed = (data||[]).map(b => ({
//       ...b,
//       challenger_members: b.challenger_members?.filter(m=>m.side==='challenger').map(m=>({...m,username:m.username?.username})),
//       opponent_members:   b.challenger_members?.filter(m=>m.side==='opponent').map(m=>({...m,username:m.username?.username})),
//     }))
//     setBattles(fixed)
//     setLoading(false)
//   }, [])

//   useEffect(() => {
//     loadBattles()
//     // Admin gets ALL profiles including other admins and self
//     supabase.from('profiles').select('id,username,color,team_id,teams(name)')
//       .then(({data}) => setAllProfiles(data||[]))
//     // Players get same-team only (excluding self)
//     if (profile?.team_id) {
//       supabase.from('profiles').select('id,username,color,team_id')
//         .eq('team_id', profile.team_id)
//         .neq('id', profile.id)
//         .then(({data}) => setSameTeamProfiles(data||[]))
//     }
//     const sub = supabase.channel('battles-channel')
//       .on('postgres_changes',{event:'*',schema:'public',table:'battles'},loadBattles)
//       .on('postgres_changes',{event:'*',schema:'public',table:'daily_scores'},loadBattles)
//       .subscribe()
//     return () => supabase.removeChannel(sub)
//   }, [loadBattles, profile])

//   async function handleAccept(battleId) {
//     await supabase.from('battles').update({ status:'active', start_date:new Date().toISOString().slice(0,10) }).eq('id',battleId)
//     loadBattles()
//   }

//   async function handleLogScore() {
//     const count = parseInt(itrVal)
//     if (isNaN(count) || count < 0) return
//     setSaving(true)
//     const { battle, role } = logModal
//     const today = new Date().toISOString().slice(0,10)
//     const dayNum = battle.start_date
//       ? Math.floor((new Date(today) - new Date(battle.start_date)) / 86400000) + 1
//       : 1
//     await supabase.from('daily_scores').insert({
//       battle_id: battle.id, side: role,
//       day_number: dayNum, itr_count: count,
//       log_date: today, logged_by: profile.id, status: 'pending',
//     })
//     setSaving(false); setLogModal(null); setItrVal(''); loadBattles()
//   }

//   async function createBattle(challengerId, opponentId, duration, wager) {
//     const challenger = allProfiles.find(x=>x.id===challengerId) || (challengerId===profile.id ? profile : null)
//     const opponent   = allProfiles.find(x=>x.id===opponentId)   || sameTeamProfiles.find(x=>x.id===opponentId)
//     if (!challenger || !opponent) return
//     const cSide = { name:challenger.username, tag:challenger.username.slice(0,2).toUpperCase(), color:challenger.color||COLORS[0] }
//     const oSide = { name:opponent.username,   tag:opponent.username.slice(0,2).toUpperCase(),   color:opponent.color||COLORS[1] }
//     const { data:cSideRow } = await supabase.from('battle_sides').insert(cSide).select().single()
//     const { data:oSideRow } = await supabase.from('battle_sides').insert(oSide).select().single()
//     const { data:newBattle } = await supabase.from('battles').insert({
//       battle_type:'solo', status:'pending',
//       challenger_side_id:cSideRow.id, opponent_side_id:oSideRow.id,
//       wager:wager||'Bragging Rights',
//       duration_days: parseInt(duration)||7,
//       created_by:profile.id,
//     }).select().single()
//     await supabase.from('battle_members').insert([
//       { battle_id:newBattle.id, user_id:challengerId, side:'challenger' },
//       { battle_id:newBattle.id, user_id:opponentId,   side:'opponent'   },
//     ])
//   }

//   async function handleAdminCreate() {
//     if (!adminForm.challengerId || !adminForm.opponentId) return
//     setSaving(true)
//     await createBattle(adminForm.challengerId, adminForm.opponentId, adminForm.duration, adminForm.wager)
//     setSaving(false); setShowNew(false)
//     setAdminForm({ challengerId:'', opponentId:'', wager:'', duration:7 })
//     loadBattles()
//   }

//   async function handlePlayerCreate() {
//     if (!playerForm.opponentId) return
//     setSaving(true)
//     await createBattle(profile.id, playerForm.opponentId, playerForm.duration, playerForm.wager)
//     setSaving(false); setShowNew(false)
//     setPlayerForm({ opponentId:'', wager:'', duration:7 })
//     loadBattles()
//   }

//   // For admin: filter opponent list to same team as selected challenger
//   const adminOpponentList = adminForm.challengerId
//     ? allProfiles.filter(p => {
//         const challenger = allProfiles.find(x=>x.id===adminForm.challengerId)
//         return p.id !== adminForm.challengerId && p.team_id === challenger?.team_id
//       })
//     : []

//   if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'4rem'}}><Spinner size={32}/></div>

//   return (
//     <div>
//       <div className="flex items-center justify-between mb3">
//         <div>
//           <h1 className="section-title">BATTLES</h1>
//           <p className="section-sub">ITR filling competitions</p>
//         </div>
//         <button className="btn btn-primary" onClick={()=>setShowNew(true)}>
//           {isAdmin ? '⚔ Create Battle' : '⚔ Issue Challenge'}
//         </button>
//       </div>

//       <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
//         {battles.map(b=>(
//           <BattleCard key={b.id} battle={b} myId={profile?.id} isAdmin={isAdmin}
//             onAccept={handleAccept}
//             onLogScore={(b,r)=>{setLogModal({battle:b,role:r});setItrVal('')}}
//           />
//         ))}
//         {battles.length===0 && <Empty message="No battles yet. Issue the first challenge!"/>}
//       </div>

//       {/* ADMIN: picks both challenger and opponent */}
//       {showNew && isAdmin && (
//         <Modal onClose={()=>setShowNew(false)}>
//           <h2 style={{fontSize:24,marginBottom:'.5rem'}}>⚔ CREATE BATTLE</h2>
//           <p className="text-muted text-sm mb2">Pick two players from the same team to battle.</p>
//           <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
//             <div>
//               <label className="input-label">Challenger</label>
//               <select className="input" value={adminForm.challengerId}
//                 onChange={e=>setAdminForm(f=>({...f,challengerId:e.target.value,opponentId:''}))}>
//                 <option value="">Select challenger…</option>
//                 {allProfiles.map(p=>(
//                   <option key={p.id} value={p.id}>{p.username} ({p.teams?.name||'No team'})</option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="input-label">Opponent {!adminForm.challengerId && <span style={{color:'#555'}}>(pick challenger first)</span>}</label>
//               <select className="input" value={adminForm.opponentId}
//                 onChange={e=>setAdminForm(f=>({...f,opponentId:e.target.value}))}
//                 disabled={!adminForm.challengerId}>
//                 <option value="">Select opponent…</option>
//                 {adminOpponentList.map(p=>(
//                   <option key={p.id} value={p.id}>{p.username}</option>
//                 ))}
//               </select>
//               {adminForm.challengerId && adminOpponentList.length===0 && (
//                 <div style={{color:'#f97316',fontSize:12,marginTop:4}}>No teammates found for this player.</div>
//               )}
//             </div>
//             <div>
//               <label className="input-label">Duration (days)</label>
//               <input className="input" type="number" min="1" max="90" value={adminForm.duration}
//                 onChange={e=>setAdminForm(f=>({...f,duration:e.target.value}))}/>
//             </div>
//             <div>
//               <label className="input-label">Stakes / Wager</label>
//               <input className="input" placeholder="e.g. Bragging Rights"
//                 value={adminForm.wager} onChange={e=>setAdminForm(f=>({...f,wager:e.target.value}))}/>
//             </div>
//             <div style={{display:'flex',gap:'.75rem'}}>
//               <button className="btn btn-primary" style={{flex:1}}
//                 onClick={handleAdminCreate}
//                 disabled={saving||!adminForm.challengerId||!adminForm.opponentId}>
//                 {saving?'Creating…':'Create Battle'}
//               </button>
//               <button className="btn btn-ghost" onClick={()=>setShowNew(false)}>Cancel</button>
//             </div>
//           </div>
//         </Modal>
//       )}

//       {/* PLAYER: challenger = self, picks opponent from same team */}
//       {showNew && !isAdmin && (
//         <Modal onClose={()=>setShowNew(false)}>
//           <h2 style={{fontSize:24,marginBottom:'.5rem'}}>⚔ ISSUE CHALLENGE</h2>
//           <p className="text-muted text-sm mb2">
//             You are challenging as <strong style={{color:profile?.color||'#00e5ff'}}>{profile?.username}</strong>. Pick a teammate.
//           </p>
//           <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
//             <div>
//               <label className="input-label">Opponent</label>
//               <select className="input" value={playerForm.opponentId}
//                 onChange={e=>setPlayerForm(f=>({...f,opponentId:e.target.value}))}>
//                 <option value="">Select opponent…</option>
//                 {sameTeamProfiles.map(p=><option key={p.id} value={p.id}>{p.username}</option>)}
//               </select>
//             </div>
//             <div>
//               <label className="input-label">Duration (days)</label>
//               <input className="input" type="number" min="1" max="90" value={playerForm.duration}
//                 onChange={e=>setPlayerForm(f=>({...f,duration:e.target.value}))}/>
//             </div>
//             <div>
//               <label className="input-label">Stakes / Wager</label>
//               <input className="input" placeholder="e.g. Bragging Rights"
//                 value={playerForm.wager} onChange={e=>setPlayerForm(f=>({...f,wager:e.target.value}))}/>
//             </div>
//             <div className="info-box">
//               <div className="info-box-title">📋 How it works</div>
//               <div className="info-box-body">
//                 1. Opponent accepts → battle window opens<br/>
//                 2. Log ITRs any number of times per day<br/>
//                 3. Admin approves each submission<br/>
//                 4. Highest approved total when duration ends wins
//               </div>
//             </div>
//             <div style={{display:'flex',gap:'.75rem'}}>
//               <button className="btn btn-primary" style={{flex:1}}
//                 onClick={handlePlayerCreate}
//                 disabled={saving||!playerForm.opponentId}>
//                 {saving?'Sending…':'Send Challenge'}
//               </button>
//               <button className="btn btn-ghost" onClick={()=>setShowNew(false)}>Cancel</button>
//             </div>
//           </div>
//         </Modal>
//       )}

//       {/* Log Score Modal */}
//       {logModal && (
//         <Modal onClose={()=>setLogModal(null)} maxWidth={380}>
//           <h2 style={{fontSize:22,marginBottom:'.5rem'}}>📋 LOG ITRs</h2>
//           <p className="text-muted text-sm mb2">Submit how many ITRs you filled. You can submit multiple times — admin approves each.</p>
//           <input className="input mb2" type="number" min="0" step="1" placeholder="e.g. 12"
//             value={itrVal} onChange={e=>setItrVal(e.target.value)}
//             style={{fontSize:30,textAlign:'center',fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2,padding:'14px'}}
//             autoFocus/>
//           <div className="info-box mb2">
//             <div className="info-box-body">Your score counts after an admin approves it.</div>
//           </div>
//           <div className="flex gap1">
//             <button className="btn btn-primary" style={{flex:1}} onClick={handleLogScore} disabled={saving}>
//               {saving?'Saving…':'Submit for Approval'}
//             </button>
//             <button className="btn btn-ghost" onClick={()=>setLogModal(null)}>Cancel</button>
//           </div>
//         </Modal>
//       )}
//     </div>
//   )
// }
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import BattleCard from '../components/BattleCard'
import { Modal, Spinner, Empty } from '../components/UI'

const COLORS = ['#ff3c5c','#00e5ff','#a855f7','#f97316','#22d3ee','#84cc16']

export default function Battles() {
  const { profile } = useAuth()
  const isAdmin = profile?.roles?.includes('ADMIN') || profile?.is_admin
  const [battles,  setBattles]  = useState([])
  const [allProfiles, setAllProfiles] = useState([]) // all players for admin
  const [sameTeamProfiles, setSameTeamProfiles] = useState([]) // same-team for players
  const [loading,  setLoading]  = useState(true)
  const [showNew,  setShowNew]  = useState(false)
  const [logModal, setLogModal] = useState(null)
  const [itrVal,   setItrVal]   = useState('')
  const [saving,   setSaving]   = useState(false)
  // Admin form — picks both sides
  const [adminForm, setAdminForm] = useState({ challengerId:'', opponentId:'', wager:'', duration:7 })
  // Player form — challenger = self
  const [playerForm, setPlayerForm] = useState({ opponentId:'', wager:'', duration:7 })

  const loadBattles = useCallback(async () => {
    const { data } = await supabase
      .from('battles')
      .select(`*,
        challenger_side:challenger_side_id(name,tag,color),
        opponent_side:opponent_side_id(name,tag,color),
        challenger_members:battle_members!battle_members_battle_id_fkey(user_id,side,username:profiles(username)),
        daily_scores(id,side,day_number,itr_count,log_date,status,rejection_note,logged_by)
      `)
      .order('created_at', { ascending: false })

    const fixed = (data||[]).map(b => ({
      ...b,
      challenger_members: b.challenger_members?.filter(m=>m.side==='challenger').map(m=>({...m,username:m.username?.username})),
      opponent_members:   b.challenger_members?.filter(m=>m.side==='opponent').map(m=>({...m,username:m.username?.username})),
    }))

    // Non-admins only see battles they are part of
    const userId = (await supabase.auth.getUser()).data.user?.id
    const isAdminUser = fixed.length > 0
      ? (await supabase.from('profiles').select('is_admin,roles').eq('id', userId).single()).data
      : null
    const isAdminCheck = isAdminUser?.is_admin || isAdminUser?.roles?.includes('ADMIN')

    const filtered = isAdminCheck
      ? fixed
      : fixed.filter(b =>
          b.challenger_members?.some(m=>m.user_id===userId) ||
          b.opponent_members?.some(m=>m.user_id===userId)
        )

    setBattles(filtered)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadBattles()
    // Admin gets ALL profiles including other admins and self
    supabase.from('profiles').select('id,username,color,team_id,teams(name)')
      .then(({data}) => setAllProfiles(data||[]))
    // Players get same-team only (excluding self)
    if (profile?.team_id) {
      supabase.from('profiles').select('id,username,color,team_id')
        .eq('team_id', profile.team_id)
        .neq('id', profile.id)
        .then(({data}) => setSameTeamProfiles(data||[]))
    }
    const sub = supabase.channel('battles-channel')
      .on('postgres_changes',{event:'*',schema:'public',table:'battles'},loadBattles)
      .on('postgres_changes',{event:'*',schema:'public',table:'daily_scores'},loadBattles)
      .subscribe()
    return () => supabase.removeChannel(sub)
  }, [loadBattles, profile])

  async function handleAccept(battleId) {
    await supabase.from('battles').update({ status:'active', start_date:new Date().toISOString().slice(0,10) }).eq('id',battleId)
    loadBattles()
  }

  async function handleLogScore() {
    const count = parseInt(itrVal)
    if (isNaN(count) || count < 0) return
    const { battle, role } = logModal
    if (battle.start_date) {
      const daysSinceStart = Math.floor((Date.now() - new Date(battle.start_date)) / 86400000)
      if (daysSinceStart >= (battle.duration_days || 7)) {
        alert('This battle\'s duration has ended. You can no longer log ITRs for it.')
        return
      }
    }
    setSaving(true)
    
    const today = new Date().toISOString().slice(0,10)
    const dayNum = battle.start_date
      ? Math.floor((new Date(today) - new Date(battle.start_date)) / 86400000) + 1
      : 1
    await supabase.from('daily_scores').insert({
      battle_id: battle.id, side: role,
      day_number: dayNum, itr_count: count,
      log_date: today, logged_by: profile.id, status: 'pending',
    })
    setSaving(false); setLogModal(null); setItrVal(''); loadBattles()
  }

  async function createBattle(challengerId, opponentId, duration, wager) {
    const challenger = allProfiles.find(x=>x.id===challengerId) || (challengerId===profile.id ? profile : null)
    const opponent   = allProfiles.find(x=>x.id===opponentId)   || sameTeamProfiles.find(x=>x.id===opponentId)
    if (!challenger || !opponent) return
    const cSide = { name:challenger.username, tag:challenger.username.slice(0,2).toUpperCase(), color:challenger.color||COLORS[0] }
    const oSide = { name:opponent.username,   tag:opponent.username.slice(0,2).toUpperCase(),   color:opponent.color||COLORS[1] }
    const { data:cSideRow } = await supabase.from('battle_sides').insert(cSide).select().single()
    const { data:oSideRow } = await supabase.from('battle_sides').insert(oSide).select().single()
    const { data:newBattle } = await supabase.from('battles').insert({
      battle_type:'solo', status:'pending',
      challenger_side_id:cSideRow.id, opponent_side_id:oSideRow.id,
      wager:wager||'Bragging Rights',
      duration_days: parseInt(duration)||7,
      created_by:profile.id,
    }).select().single()
    await supabase.from('battle_members').insert([
      { battle_id:newBattle.id, user_id:challengerId, side:'challenger' },
      { battle_id:newBattle.id, user_id:opponentId,   side:'opponent'   },
    ])
  }

  async function handleAdminCreate() {
    if (!adminForm.challengerId || !adminForm.opponentId) return
    setSaving(true)
    await createBattle(adminForm.challengerId, adminForm.opponentId, adminForm.duration, adminForm.wager)
    setSaving(false); setShowNew(false)
    setAdminForm({ challengerId:'', opponentId:'', wager:'', duration:7 })
    loadBattles()
  }

  async function handlePlayerCreate() {
    if (!playerForm.opponentId) return
    setSaving(true)
    await createBattle(profile.id, playerForm.opponentId, playerForm.duration, playerForm.wager)
    setSaving(false); setShowNew(false)
    setPlayerForm({ opponentId:'', wager:'', duration:7 })
    loadBattles()
  }

  // For admin: filter opponent list to same team as selected challenger
  const adminOpponentList = adminForm.challengerId
    ? allProfiles.filter(p => {
        const challenger = allProfiles.find(x=>x.id===adminForm.challengerId)
        return p.id !== adminForm.challengerId && p.team_id === challenger?.team_id
      })
    : []

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'4rem'}}><Spinner size={32}/></div>

  return (
    <div>
      <div className="flex items-center justify-between mb3">
        <div>
          <h1 className="section-title">BATTLES</h1>
          <p className="section-sub">ITR filling competitions</p>
        </div>
        <button className="btn btn-primary" onClick={()=>setShowNew(true)}>
          {isAdmin ? '⚔ Create Battle' : '⚔ Issue Challenge'}
        </button>
      </div>

      <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
        {battles.map(b=>(
          <BattleCard key={b.id} battle={b} myId={profile?.id} isAdmin={isAdmin}
            onAccept={handleAccept}
            onLogScore={(b,r)=>{setLogModal({battle:b,role:r});setItrVal('')}}
          />
        ))}
        {battles.length===0 && <Empty message="No battles yet. Issue the first challenge!"/>}
      </div>

      {/* ADMIN: picks both challenger and opponent */}
      {showNew && isAdmin && (
        <Modal onClose={()=>setShowNew(false)}>
          <h2 style={{fontSize:24,marginBottom:'.5rem'}}>⚔ CREATE BATTLE</h2>
          <p className="text-muted text-sm mb2">Pick two players from the same team to battle.</p>
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div>
              <label className="input-label">Challenger</label>
              <select className="input" value={adminForm.challengerId}
                onChange={e=>setAdminForm(f=>({...f,challengerId:e.target.value,opponentId:''}))}>
                <option value="">Select challenger…</option>
                {allProfiles.map(p=>(
                  <option key={p.id} value={p.id}>{p.username} ({p.teams?.name||'No team'})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="input-label">Opponent {!adminForm.challengerId && <span style={{color:'#555'}}>(pick challenger first)</span>}</label>
              <select className="input" value={adminForm.opponentId}
                onChange={e=>setAdminForm(f=>({...f,opponentId:e.target.value}))}
                disabled={!adminForm.challengerId}>
                <option value="">Select opponent…</option>
                {adminOpponentList.map(p=>(
                  <option key={p.id} value={p.id}>{p.username}</option>
                ))}
              </select>
              {adminForm.challengerId && adminOpponentList.length===0 && (
                <div style={{color:'#f97316',fontSize:12,marginTop:4}}>No teammates found for this player.</div>
              )}
            </div>
            <div>
              <label className="input-label">Duration (days)</label>
              <input className="input" type="number" min="1" max="90" value={adminForm.duration}
                onChange={e=>setAdminForm(f=>({...f,duration:e.target.value}))}/>
            </div>
            <div>
              <label className="input-label">Stakes / Wager</label>
              <input className="input" placeholder="e.g. Bragging Rights"
                value={adminForm.wager} onChange={e=>setAdminForm(f=>({...f,wager:e.target.value}))}/>
            </div>
            <div style={{display:'flex',gap:'.75rem'}}>
              <button className="btn btn-primary" style={{flex:1}}
                onClick={handleAdminCreate}
                disabled={saving||!adminForm.challengerId||!adminForm.opponentId}>
                {saving?'Creating…':'Create Battle'}
              </button>
              <button className="btn btn-ghost" onClick={()=>setShowNew(false)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* PLAYER: challenger = self, picks opponent from same team */}
      {showNew && !isAdmin && (
        <Modal onClose={()=>setShowNew(false)}>
          <h2 style={{fontSize:24,marginBottom:'.5rem'}}>⚔ ISSUE CHALLENGE</h2>
          <p className="text-muted text-sm mb2">
            You are challenging as <strong style={{color:profile?.color||'#00e5ff'}}>{profile?.username}</strong>. Pick a teammate.
          </p>
          <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <div>
              <label className="input-label">Opponent</label>
              <select className="input" value={playerForm.opponentId}
                onChange={e=>setPlayerForm(f=>({...f,opponentId:e.target.value}))}>
                <option value="">Select opponent…</option>
                {sameTeamProfiles.map(p=><option key={p.id} value={p.id}>{p.username}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Duration (days)</label>
              <input className="input" type="number" min="1" max="90" value={playerForm.duration}
                onChange={e=>setPlayerForm(f=>({...f,duration:e.target.value}))}/>
            </div>
            <div>
              <label className="input-label">Stakes / Wager</label>
              <input className="input" placeholder="e.g. Bragging Rights"
                value={playerForm.wager} onChange={e=>setPlayerForm(f=>({...f,wager:e.target.value}))}/>
            </div>
            <div className="info-box">
              <div className="info-box-title">📋 How it works</div>
              <div className="info-box-body">
                1. Opponent accepts → battle window opens<br/>
                2. Log ITRs any number of times per day<br/>
                3. Admin approves each submission<br/>
                4. Highest approved total when duration ends wins
              </div>
            </div>
            <div style={{display:'flex',gap:'.75rem'}}>
              <button className="btn btn-primary" style={{flex:1}}
                onClick={handlePlayerCreate}
                disabled={saving||!playerForm.opponentId}>
                {saving?'Sending…':'Send Challenge'}
              </button>
              <button className="btn btn-ghost" onClick={()=>setShowNew(false)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Log Score Modal */}
      {logModal && (
        <Modal onClose={()=>setLogModal(null)} maxWidth={380}>
          <h2 style={{fontSize:22,marginBottom:'.5rem'}}>📋 LOG ITRs</h2>
          <p className="text-muted text-sm mb2">Submit how many ITRs you filled. You can submit multiple times — admin approves each.</p>
          <input className="input mb2" type="number" min="0" step="1" placeholder="e.g. 12"
            value={itrVal} onChange={e=>setItrVal(e.target.value)}
            style={{fontSize:30,textAlign:'center',fontFamily:"'Bebas Neue',sans-serif",letterSpacing:2,padding:'14px'}}
            autoFocus/>
          <div className="info-box mb2">
            <div className="info-box-body">Your score counts after an admin approves it.</div>
          </div>
          <div className="flex gap1">
            <button className="btn btn-primary" style={{flex:1}} onClick={handleLogScore} disabled={saving}>
              {saving?'Saving…':'Submit for Approval'}
            </button>
            <button className="btn btn-ghost" onClick={()=>setLogModal(null)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  )
}