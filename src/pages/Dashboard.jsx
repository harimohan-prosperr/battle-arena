// import { useEffect, useState } from 'react'
// import { supabase } from '../lib/supabase'
// import { Avatar, TeamLogo, StatCard, Spinner } from '../components/UI'

// export default function Dashboard() {
//   const [players, setPlayers] = useState([])
//   const [teams,   setTeams]   = useState([])
//   const [counts,  setCounts]  = useState({ active:0, completed:0 })
//   const [loading, setLoading] = useState(true)

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
//           <h3 style={{fontSize:18,marginBottom:'1rem',color:'#ffd700'}}>🏆 Top ITR Fillers</h3>
//           {players.slice(0,6).map((p,i) => (
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
//           {players.length===0 && <p className="text-muted text-sm">No players yet.</p>}
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
import { supabase } from '../lib/supabase'
import { Avatar, TeamLogo, StatCard, Spinner } from '../components/UI'

export default function Dashboard() {
  const [players, setPlayers] = useState([])
  const [teams,   setTeams]   = useState([])
  const [counts,  setCounts]  = useState({ active:0, completed:0 })
  const [loading, setLoading] = useState(true)
  const [teamTab, setTeamTab] = useState('RM TEAM')

  useEffect(() => {
    async function load() {
      const [{ data: p }, { data: t }, { data: b }] = await Promise.all([
        supabase.from('profiles').select('id,username,color,total_itrs,battle_wins,team_id,teams(name)').order('total_itrs',{ascending:false}),
        supabase.from('teams').select('id,name,tag,color,total_itrs,battle_wins').order('total_itrs',{ascending:false}),
        supabase.from('battles').select('status'),
      ])
      setPlayers(p||[])
      setTeams(t||[])
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

  const filteredPlayers = players
    .filter(p => p.teams?.name === teamTab)
    .sort((a,b)=>(b.total_itrs||0)-(a.total_itrs||0))

  return (
    <div>
      <div className="mb3">
        <h1 className="section-title">BATTLE ARENA</h1>
        <p className="section-sub">Season Dashboard · Metric: ITRs Filled</p>
      </div>

      <div className="grid4 mb3">
        <StatCard label="Active Battles"   value={counts.active}                    color="#ff3c5c"/>
        <StatCard label="Completed"        value={counts.completed}                 color="#00ff88"/>
        <StatCard label="Total ITRs Filed" value={totalITRs.toLocaleString()}       color="#00e5ff"/>
        <StatCard label="Players"          value={players.length}                   color="#a855f7"/>
      </div>

      <div className="grid2 gap2">
        <div className="card">
          <div className="flex items-center justify-between mb2">
            <h3 style={{fontSize:18,color:'#ffd700',margin:0}}>🏆 Top ITR Fillers</h3>
            <div className="flex gap1">
              {['RM TEAM','ADVISOR TEAM'].map(team => (
                <button
                  key={team}
                  className={`btn btn-sm ${teamTab===team?'btn-primary':'btn-ghost'}`}
                  onClick={()=>setTeamTab(team)}
                  style={{fontSize:11}}
                >
                  {team}
                </button>
              ))}
            </div>
          </div>
          {filteredPlayers.slice(0,6).map((p,i) => (
            <div key={p.id} className="lb-row">
              <div className="rank-num" style={{color:i===0?'#ffd700':i===1?'#c0c0c0':i===2?'#cd7f32':'#555'}}>
                {i===0?'👑':`#${i+1}`}
              </div>
              <Avatar name={p.username} color={p.color}/>
              <div style={{flex:1}}>
                <div style={{fontWeight:600}}>{p.username}</div>
                <div className="text-muted text-xs">{p.teams?.name||'No team'}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:'#00e5ff'}}>
                  {(p.total_itrs||0).toLocaleString()}
                </div>
                <div className="text-xs text-muted">{p.battle_wins||0} wins</div>
              </div>
            </div>
          ))}
          {filteredPlayers.length===0 && <p className="text-muted text-sm">No players in this team yet.</p>}
        </div>

        <div className="card">
          <h3 style={{fontSize:18,marginBottom:'1rem',color:'#ffd700'}}>⚔️ Team Rankings</h3>
          {teams.map((t,i) => (
            <div key={t.id} className="lb-row">
              <div className="rank-num" style={{color:i===0?'#ffd700':i===1?'#c0c0c0':i===2?'#cd7f32':'#555'}}>
                {i===0?'👑':`#${i+1}`}
              </div>
              <TeamLogo tag={t.tag} color={t.color}/>
              <div style={{flex:1}}>
                <div style={{fontWeight:600}}>{t.name}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:t.color}}>
                  {(t.total_itrs||0).toLocaleString()}
                </div>
                <div className="text-xs text-muted">{t.battle_wins||0} wins</div>
              </div>
            </div>
          ))}
          {teams.length===0 && <p className="text-muted text-sm">No teams yet.</p>}
        </div>
      </div>
    </div>
  )
}