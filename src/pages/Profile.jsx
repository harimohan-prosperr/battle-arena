// import { useEffect, useState } from 'react'
// import { supabase } from '../lib/supabase'
// import { useAuth } from '../lib/AuthContext'
// import { Avatar, StatCard, Spinner } from '../components/UI'
// import BattleCard from '../components/BattleCard'

// export default function Profile() {
//   const { profile } = useAuth()
//   const [battles, setBattles] = useState([])
//   const [rank,    setRank]    = useState('—')
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     if (!profile) return
//     async function load() {
//       // My battles
//       const { data: bm } = await supabase
//         .from('battle_members')
//         .select('battle_id')
//         .eq('user_id', profile.id)

//       const battleIds = (bm||[]).map(x=>x.battle_id)
//       if (battleIds.length > 0) {
//         const { data: b } = await supabase
//           .from('battles')
//           .select(`
//             *,
//             challenger_side:challenger_side_id(name,tag,color),
//             opponent_side:opponent_side_id(name,tag,color),
//             challenger_members:battle_members!battle_members_battle_id_fkey(user_id,side,username:profiles(username)),
//             daily_scores(side,day_number,itr_count,log_date)
//           `)
//           .in('id', battleIds)
//           .order('created_at',{ascending:false})

//         const fixed = (b||[]).map(x=>({
//           ...x,
//           challenger_members: x.challenger_members?.filter(m=>m.side==='challenger').map(m=>({...m,username:m.username?.username})),
//           opponent_members:   x.challenger_members?.filter(m=>m.side==='opponent').map(m=>({...m,username:m.username?.username})),
//         }))
//         setBattles(fixed)
//       }

//       // My rank
//       const { data: ranks } = await supabase
//         .from('profiles')
//         .select('id,total_itrs')
//         .order('total_itrs',{ascending:false})
//       const idx = (ranks||[]).findIndex(x=>x.id===profile.id)
//       setRank(idx>=0 ? `#${idx+1}` : '—')
//       setLoading(false)
//     }
//     load()
//   }, [profile])

//   if (!profile || loading) return <div style={{display:'flex',justifyContent:'center',padding:'4rem'}}><Spinner size={32}/></div>

//   const weekITRs = battles
//     .filter(b=>b.status==='active')
//     .reduce((s,b)=>{
//       const myRole = b.challenger_members?.some(m=>m.user_id===profile.id) ? 'challenger' : 'opponent'
//       return s + (b.daily_scores?.filter(x=>x.side===myRole).reduce((a,c)=>a+c.itr_count,0)||0)
//     },0)

//   return (
//     <div>
//       <div className="mb3">
//         <h1 className="section-title">MY PROFILE</h1>
//         <p className="section-sub">Your ITR battle record</p>
//       </div>

//       <div className="card card-blue mb3">
//         <div className="flex items-center gap2 mb3">
//           <Avatar name={profile.username} color={profile.color} size={64}/>
//           <div>
//             <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:2}}>{profile.username}</h2>
//             <div className="flex gap1 items-center mt1">
//               {profile.teams && <span className="tag tag-blue">{profile.teams.name}</span>}
//               <span className="tag tag-gold">Rank {rank}</span>
//               {profile.is_admin && <span className="tag tag-red">Admin</span>}
//             </div>
//           </div>
//           <div style={{marginLeft:'auto',textAlign:'right'}}>
//             <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:48,color:'#00e5ff',lineHeight:1}}>
//               {(profile.total_itrs||0).toLocaleString()}
//             </div>
//             <div className="text-muted text-sm">Total ITRs Filed</div>
//           </div>
//         </div>
//         <div className="grid4">
//           <StatCard label="Battle Wins"    value={profile.battle_wins||0}                color="#00ff88"/>
//           <StatCard label="All-time ITRs"  value={(profile.total_itrs||0).toLocaleString()} color="#00e5ff"/>
//           <StatCard label="Season Rank"    value={rank}                                  color="#ffd700"/>
//           <StatCard label="ITRs This Week" value={weekITRs}                              color="#ff3c5c"/>
//         </div>
//       </div>

//       <h3 style={{fontSize:18,marginBottom:'1rem'}}>MY BATTLES</h3>
//       {battles.length===0
//         ? <div className="card" style={{textAlign:'center',color:'#444',padding:'2.5rem'}}>No battles yet — issue a challenge!</div>
//         : <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
//             {battles.map(b=>(
//               <BattleCard key={b.id} battle={b} myId={profile.id} onAccept={()=>{}} onLogScore={()=>{}}/>
//             ))}
//           </div>
//       }
//     </div>
//   )
// }
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { Avatar, TeamLogo, Spinner, Modal, ITRBars } from '../components/UI'

const COLORS = [
  '#ff3c5c', '#00e5ff', '#a855f7', '#f97316',
  '#22d3ee', '#84cc16', '#f43f5e', '#06b6d4',
  '#ffd700', '#00ff88'
]

function StatBox({ label, value, color }) {
  return (
    <div className="stat-card" style={{ border: `1px solid ${color}33`, textAlign: 'center' }}>
      <div className="text-muted text-xs mb1" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>
        {label}
      </div>
      <div style={{
        fontFamily: "'Bebas Neue',sans-serif",
        fontSize: 30,
        color,
        lineHeight: 1
      }}>
        {value}
      </div>
    </div>
  )
}

function BattleHistoryRow({ battle, myId }) {
  const { challenger_side, opponent_side, daily_scores = [], status, winner_side, battle_type } = battle

  const challenger_members = battle.challenger_members || []
  const opponent_members   = battle.opponent_members   || []

  const iAmChallenger = challenger_members.some(m => m.user_id === myId)
  const myRole   = iAmChallenger ? 'challenger' : 'opponent'
  const myTotal  = daily_scores.filter(s => s.side === myRole).reduce((a, b) => a + (b.itr_count || 0), 0)
  const oppTotal = daily_scores.filter(s => s.side !== myRole).reduce((a, b) => a + (b.itr_count || 0), 0)

  const mySide  = iAmChallenger ? challenger_side : opponent_side
  const oppSide = iAmChallenger ? opponent_side   : challenger_side

  const won  = status === 'completed' && winner_side === myRole
  const lost = status === 'completed' && winner_side !== myRole && winner_side != null

  const dailyArr = Array.from({ length: 7 }, (_, i) => {
    const found = daily_scores.find(s => s.side === myRole && s.day_number === i + 1)
    return found ? found.itr_count : null
  })

  return (
    <div className="lb-row" style={{
      background: won ? '#00ff8808' : lost ? '#ff3c5c08' : 'transparent',
      border: won ? '1px solid #00ff8822' : lost ? '1px solid #ff3c5c22' : '1px solid transparent',
      borderRadius: 6,
      marginBottom: 4,
      alignItems: 'flex-start',
      flexWrap: 'wrap',
      gap: '.75rem'
    }}>
      {/* Result badge */}
      <div style={{ width: 44, textAlign: 'center', paddingTop: 4, flexShrink: 0 }}>
        {won  && <span className="tag tag-green" style={{ fontSize: 10 }}>WIN</span>}
        {lost && <span className="tag tag-red"   style={{ fontSize: 10 }}>LOSS</span>}
        {status === 'active'  && <span className="tag tag-blue"  style={{ fontSize: 10 }}>LIVE</span>}
        {status === 'pending' && <span className="tag tag-gray"  style={{ fontSize: 10 }}>PEND</span>}
      </div>

      {/* Opponent info */}
      <div style={{ flex: 1, minWidth: 120 }}>
        <div className="flex items-center gap1">
          <Avatar name={oppSide?.name} color={oppSide?.color} size={28} />
          <span style={{ fontWeight: 600, fontSize: 14 }}>vs {oppSide?.name || 'Unknown'}</span>
          <span className="tag tag-gray" style={{ fontSize: 10 }}>
            {battle_type === 'team' ? 'Team' : '1v1'}
          </span>
        </div>
      </div>

      {/* Score */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: won ? '#00ff88' : lost ? '#ff3c5c' : '#666' }}>
          {myTotal} <span style={{ color: '#444', fontSize: 14 }}>vs</span> {oppTotal}
        </div>
        <div className="text-xs text-muted">ITRs</div>
      </div>

      {/* Mini bars */}
      <div style={{ flexBasis: '100%', paddingLeft: 56 }}>
        <ITRBars scores={dailyArr} color={mySide?.color || '#00e5ff'} />
      </div>
    </div>
  )
}

export default function Profile() {
  const { profile, refetchProfile } = useAuth()
  const [battles,  setBattles]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [editForm, setEditForm] = useState({ username: '', color: '' })
  const [saving,   setSaving]   = useState(false)
  const [editErr,  setEditErr]  = useState('')

  useEffect(() => {
    if (!profile?.id) return
    setEditForm({ username: profile.username, color: profile.color || COLORS[0] })
    loadBattles()
  }, [profile?.id])

  async function loadBattles() {
    const { data } = await supabase
      .from('battles')
      .select(`
        id, status, battle_type, winner_side,
        challenger_side:challenger_side_id(name,tag,color),
        opponent_side:opponent_side_id(name,tag,color),
        challenger_members:battle_members!battle_members_battle_id_fkey(user_id,side),
        daily_scores(side,day_number,itr_count,log_date)
      `)
      .order('created_at', { ascending: false })

    // Filter battles where user is a member
    const myBattles = (data || []).filter(b => {
      const allMembers = b.challenger_members || []
      return allMembers.some(m => m.user_id === profile.id)
    }).map(b => ({
      ...b,
      challenger_members: b.challenger_members?.filter(m => m.side === 'challenger'),
      opponent_members:   b.challenger_members?.filter(m => m.side === 'opponent'),
    }))

    setBattles(myBattles)
    setLoading(false)
  }

  async function saveProfile() {
    if (!editForm.username.trim()) { setEditErr('Username is required.'); return }
    setSaving(true); setEditErr('')
    const { error } = await supabase
      .from('profiles')
      .update({ username: editForm.username.trim(), color: editForm.color })
      .eq('id', profile.id)
    if (error) { setEditErr(error.message); setSaving(false); return }
    await refetchProfile()
    setSaving(false)
    setShowEdit(false)
  }

  if (!profile || loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <Spinner size={32} />
    </div>
  )

  const wins   = profile.battle_wins  || 0
  const totalB = battles.filter(b => b.status === 'completed').length
  const losses = Math.max(0, totalB - wins)
  const active = battles.filter(b => b.status === 'active').length
  const winPct = totalB > 0 ? Math.round((wins / totalB) * 100) : 0

  return (
    <div>
      {/* Header */}
      <div className="mb3">
        <h1 className="section-title">MY PROFILE</h1>
        <p className="section-sub">Your stats & battle history</p>
      </div>

      {/* Profile card */}
      <div className="card mb3">
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div className="flex items-center gap2">
            <Avatar name={profile.username} color={profile.color} size={64} />
            <div>
              <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: '#fff', letterSpacing: 2 }}>
                {profile.username}
              </div>
              {profile.teams && (
                <div className="flex items-center gap1 mt1">
                  <TeamLogo tag={profile.teams.tag} color={profile.teams.color} size={22} />
                  <span className="text-sm" style={{ color: profile.teams.color }}>
                    {profile.teams.name}
                  </span>
                </div>
              )}
              {!profile.teams && (
                <span className="text-xs text-muted">No team assigned</span>
              )}
              {profile.is_admin && (
                <span className="tag tag-red mt1" style={{ fontSize: 10, marginTop: 4 }}>ADMIN</span>
              )}
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowEdit(true)}>
            ✏ Edit Profile
          </button>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid4 mb3">
        <StatBox label="Total ITRs"   value={(profile.total_itrs || 0).toLocaleString()} color="#00e5ff" />
        <StatBox label="Battle Wins"  value={wins}    color="#00ff88" />
        <StatBox label="Losses"       value={losses}  color="#ff3c5c" />
        <StatBox label="Win Rate"     value={`${winPct}%`} color="#ffd700" />
      </div>

      {/* Active battles callout */}
      {active > 0 && (
        <div className="info-box mb3">
          <div className="info-box-title">⚔ {active} active battle{active > 1 ? 's' : ''} in progress</div>
          <div className="info-box-body">Go to Battles to log today's ITRs and keep your streak alive.</div>
        </div>
      )}

      {/* Battle history */}
      <div className="card">
        <div className="flex items-center justify-between mb2">
          <h3 style={{ fontSize: 16, color: '#666', letterSpacing: 1 }}>BATTLE HISTORY</h3>
          <span className="text-xs text-muted">{battles.length} total</span>
        </div>
        {battles.length === 0
          ? <p className="text-muted text-sm">No battles yet. Issue your first challenge!</p>
          : battles.map(b => (
              <BattleHistoryRow key={b.id} battle={b} myId={profile.id} />
            ))
        }
      </div>

      {/* Edit modal */}
      {showEdit && (
        <Modal onClose={() => setShowEdit(false)} maxWidth={420}>
          <h2 style={{ fontSize: 22, marginBottom: '1rem' }}>✏ EDIT PROFILE</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="input-label">Display name</label>
              <input
                className="input"
                value={editForm.username}
                onChange={e => setEditForm(f => ({ ...f, username: e.target.value }))}
                placeholder="Your display name"
              />
            </div>
            <div>
              <label className="input-label">Avatar colour</label>
              <div className="flex gap1" style={{ flexWrap: 'wrap' }}>
                {COLORS.map(c => (
                  <div
                    key={c}
                    onClick={() => setEditForm(f => ({ ...f, color: c }))}
                    style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: c, cursor: 'pointer',
                      border: editForm.color === c ? '3px solid #fff' : '3px solid transparent',
                      transition: 'transform .1s',
                      transform: editForm.color === c ? 'scale(1.2)' : 'scale(1)'
                    }}
                  />
                ))}
              </div>
              {/* Preview */}
              <div className="flex items-center gap2 mt2">
                <Avatar name={editForm.username || profile.username} color={editForm.color} size={40} />
                <span style={{ color: editForm.color, fontFamily: "'Bebas Neue',sans-serif", fontSize: 18 }}>
                  {editForm.username || profile.username}
                </span>
              </div>
            </div>
            {editErr && <div className="form-error">⚠ {editErr}</div>}
            <div className="flex gap1">
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveProfile} disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button className="btn btn-ghost" onClick={() => setShowEdit(false)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
