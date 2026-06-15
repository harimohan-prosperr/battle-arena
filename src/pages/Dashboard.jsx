

// import { useEffect, useState } from 'react'
// import { supabase } from '../lib/supabase'
// import { Avatar, TeamLogo, StatCard, Spinner } from '../components/UI'

// export default function Dashboard() {
//   const [players, setPlayers] = useState([])
//   const [teams,   setTeams]   = useState([])
//   const [counts,  setCounts]  = useState({ active:0, completed:0 })
//   const [loading, setLoading] = useState(true)
//   const [teamTab, setTeamTab] = useState('RM TEAM')

//   useEffect(() => {
//     async function load() {
//       const [{ data: p }, { data: t }, { data: b }] = await Promise.all([
//         supabase.from('profiles').select('id,username,color,total_itrs,battle_wins,team_id,teams(name)').order('total_itrs',{ascending:false}),
//         supabase.from('teams').select('id,name,tag,color,total_itrs,battle_wins').order('total_itrs',{ascending:false}),
//         supabase.from('battles').select('status'),
//       ])
//       setPlayers(p||[])
//       setTeams(t||[])
//       setCounts({
//         active:    (b||[]).filter(x=>x.status==='active').length,
//         completed: (b||[]).filter(x=>x.status==='completed').length,
//       })
//       setLoading(false)
//     }
//     load()
//   }, [])

//   if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'4rem'}}><Spinner size={32}/></div>

//   const totalITRs = players.reduce((s,p)=>s+(p.total_itrs||0),0)

//   const filteredPlayers = players
//     .filter(p => p.teams?.name === teamTab)
//     .sort((a,b)=>(b.total_itrs||0)-(a.total_itrs||0))

//   return (
//     <div>
//       <div className="mb3">
//         <h1 className="section-title">BATTLE ARENA</h1>
//         <p className="section-sub">Season Dashboard · Metric: ITRs Filled</p>
//       </div>

//       <div className="grid4 mb3">
//         <StatCard label="Active Battles"   value={counts.active}                    color="#ff3c5c"/>
//         <StatCard label="Completed"        value={counts.completed}                 color="#00ff88"/>
//         <StatCard label="Total ITRs Filed" value={totalITRs.toLocaleString()}       color="#00e5ff"/>
//         <StatCard label="Players"          value={players.length}                   color="#a855f7"/>
//       </div>

//       <div className="grid2 gap2">
//         <div className="card">
//           <div className="flex items-center justify-between mb2">
//             <h3 style={{fontSize:18,color:'#ffd700',margin:0}}>🏆 Top ITR Fillers</h3>
//             <div className="flex gap1">
//               {['RM TEAM','ADVISOR TEAM'].map(team => (
//                 <button
//                   key={team}
//                   className={`btn btn-sm ${teamTab===team?'btn-primary':'btn-ghost'}`}
//                   onClick={()=>setTeamTab(team)}
//                   style={{fontSize:11}}
//                 >
//                   {team}
//                 </button>
//               ))}
//             </div>
//           </div>
//           {filteredPlayers.slice(0,6).map((p,i) => (
//             <div key={p.id} className="lb-row">
//               <div className="rank-num" style={{color:i===0?'#ffd700':i===1?'#c0c0c0':i===2?'#cd7f32':'#555'}}>
//                 {i===0?'👑':`#${i+1}`}
//               </div>
//               <Avatar name={p.username} color={p.color}/>
//               <div style={{flex:1}}>
//                 <div style={{fontWeight:600}}>{p.username}</div>
//                 <div className="text-muted text-xs">{p.teams?.name||'No team'}</div>
//               </div>
//               <div style={{textAlign:'right'}}>
//                 <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:'#00e5ff'}}>
//                   {(p.total_itrs||0).toLocaleString()}
//                 </div>
//                 <div className="text-xs text-muted">{p.battle_wins||0} wins</div>
//               </div>
//             </div>
//           ))}
//           {filteredPlayers.length===0 && <p className="text-muted text-sm">No players in this team yet.</p>}
//         </div>

//         <div className="card">
//           <h3 style={{fontSize:18,marginBottom:'1rem',color:'#ffd700'}}>⚔️ Team Rankings</h3>
//           {teams.map((t,i) => (
//             <div key={t.id} className="lb-row">
//               <div className="rank-num" style={{color:i===0?'#ffd700':i===1?'#c0c0c0':i===2?'#cd7f32':'#555'}}>
//                 {i===0?'👑':`#${i+1}`}
//               </div>
//               <TeamLogo tag={t.tag} color={t.color}/>
//               <div style={{flex:1}}>
//                 <div style={{fontWeight:600}}>{t.name}</div>
//               </div>
//               <div style={{textAlign:'right'}}>
//                 <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:t.color}}>
//                   {(t.total_itrs||0).toLocaleString()}
//                 </div>
//                 <div className="text-xs text-muted">{t.battle_wins||0} wins</div>
//               </div>
//             </div>
//           ))}
//           {teams.length===0 && <p className="text-muted text-sm">No teams yet.</p>}
//         </div>
//       </div>
//     </div>
//   )
// }

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Avatar, StatCard, Spinner } from '../components/UI'

export default function Dashboard() {
  const navigate = useNavigate()
  const [players, setPlayers] = useState([])
  const [counts,  setCounts]  = useState({ active:0, completed:0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: p }, { data: b }] = await Promise.all([
        supabase.from('profiles').select('id,username,color,total_itrs,battle_wins,team_id,teams(name)').order('total_itrs',{ascending:false}),
        supabase.from('battles').select('status'),
      ])
      setPlayers(p||[])
      setCounts({
        active:    (b||[]).filter(x=>x.status==='active').length,
        completed: (b||[]).filter(x=>x.status==='completed').length,
      })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'4rem'}}><Spinner size={32}/></div>

  const totalITRs = players.reduce((s,p)=>s+(p.total_itrs||0),0)

  const rmTop = players
    .filter(p => p.teams?.name === 'RM TEAM')
    .sort((a,b)=>(b.total_itrs||0)-(a.total_itrs||0))
    .slice(0,5)

  const advisorTop = players
    .filter(p => p.teams?.name === 'ADVISOR TEAM')
    .sort((a,b)=>(b.total_itrs||0)-(a.total_itrs||0))
    .slice(0,5)

  function TopFillersCard({ title, list, teamFilter }) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb2">
          <h3 style={{fontSize:16,color:'#666',letterSpacing:1,margin:0}}>{title}</h3>
          <button className="btn btn-sm btn-ghost" style={{fontSize:11}}
            onClick={()=>navigate('/leaderboard',{state:{team:teamFilter}})}>
            View all →
          </button>
        </div>
        {list.length===0
          ? <p className="text-muted text-sm" style={{padding:'2rem 0',textAlign:'center'}}>No ITRs logged yet.</p>
          : list.map((p,i) => (
            <div key={p.id} className="lb-row" style={{
              background: i===0 ? '#ffd70008' : 'transparent',
              border: i===0 ? '1px solid #ffd70020' : '1px solid transparent',
              borderRadius:6, marginBottom:2
            }}>
              <div style={{width:28,textAlign:'center',flexShrink:0}}>
                {i===0
                  ? <span style={{fontSize:18}}>👑</span>
                  : <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:'#555'}}>#{i+1}</span>
                }
              </div>
              <Avatar name={p.username} color={p.color} size={32}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:600,fontSize:14,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{p.username}</div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color: i===0 ? '#ffd700' : '#00e5ff'}}>
                  {(p.total_itrs||0).toLocaleString()}
                </div>
                <div className="text-xs text-muted">{p.battle_wins||0} wins</div>
              </div>
            </div>
          ))
        }
      </div>
    )
  }

  return (
    <div>
      <div className="mb3">
        <h1 className="section-title">BATTLE ARENA</h1>
        <p className="section-sub">Season Dashboard · Metric: ITRs Filled</p>
      </div>

      <div className="grid4 mb3">
        <button className="stat-card" style={{border:'1px solid #ff3c5c33',cursor:'pointer',textAlign:'left',background:'transparent'}}
          onClick={()=>navigate('/battles',{state:{filter:'active'}})}>
          <div className="text-muted text-xs mb1" style={{textTransform:'uppercase',letterSpacing:1}}>Active Battles</div>
          <div className="stat-val" style={{color:'#ff3c5c'}}>{counts.active}</div>
        </button>
        <button className="stat-card" style={{border:'1px solid #00ff8833',cursor:'pointer',textAlign:'left',background:'transparent'}}
          onClick={()=>navigate('/battles',{state:{filter:'completed'}})}>
          <div className="text-muted text-xs mb1" style={{textTransform:'uppercase',letterSpacing:1}}>Completed</div>
          <div className="stat-val" style={{color:'#00ff88'}}>{counts.completed}</div>
        </button>
        <StatCard label="Total ITRs Filed" value={totalITRs.toLocaleString()} color="#00e5ff"/>
        <StatCard label="Players" value={players.length} color="#a855f7"/>
      </div>

      <div className="grid2 gap2">
        <TopFillersCard title="🏆 TOP FILLERS · RM TEAM" list={rmTop} teamFilter="RM TEAM"/>
        <TopFillersCard title="🏆 TOP FILLERS · ADVISOR TEAM" list={advisorTop} teamFilter="ADVISOR TEAM"/>
      </div>
    </div>
  )
}