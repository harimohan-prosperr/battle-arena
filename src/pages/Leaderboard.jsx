// import { useEffect, useState } from 'react'
// import { supabase } from '../lib/supabase'
// import { Avatar, TeamLogo, Spinner } from '../components/UI'

// export default function Leaderboard() {
//   const [view,    setView]    = useState('players')
//   const [players, setPlayers] = useState([])
//   const [teams,   setTeams]   = useState([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     async function load() {
//       const [{ data: p }, { data: t }] = await Promise.all([
//         supabase.from('profiles').select('id,username,color,total_itrs,battle_wins,teams(name)').order('total_itrs',{ascending:false}),
//         supabase.from('teams').select('id,name,tag,color,total_itrs,battle_wins').order('total_itrs',{ascending:false}),
//       ])
//       setPlayers(p||[]); setTeams(t||[]); setLoading(false)
//     }
//     load()
//   }, [])

//   if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'4rem'}}><Spinner size={32}/></div>

//   const list   = view==='players' ? players : teams
//   const maxPts = list[0]?.total_itrs || 1

//   const medalColor = i => i===0?'#ffd700':i===1?'#c0c0c0':i===2?'#cd7f32':'#555'
//   const medal      = i => i===0?'👑':i===1?'🥈':i===2?'🥉':`#${i+1}`

//   return (
//     <div>
//       <div className="flex items-center justify-between mb3">
//         <div>
//           <h1 className="section-title">LEADERBOARD</h1>
//           <p className="section-sub">All-time ITRs filed</p>
//         </div>
//         <div className="flex gap1">
//           {['players','teams'].map(v=>(
//             <button key={v} className={`btn btn-sm ${view===v?'btn-primary':'btn-secondary'}`}
//               onClick={()=>setView(v)} style={{textTransform:'uppercase'}}>{v}</button>
//           ))}
//         </div>
//       </div>

//       <div className="card">
//         {list.map((item,i) => (
//           <div key={item.id}>
//             <div className="lb-row">
//               <div className="rank-num" style={{color:medalColor(i),fontSize:i===0?22:18}}>
//                 {medal(i)}
//               </div>
//               {view==='players'
//                 ? <Avatar name={item.username} color={item.color}/>
//                 : <TeamLogo tag={item.tag} color={item.color}/>
//               }
//               <div style={{flex:1}}>
//                 <div style={{fontWeight:700,fontSize:16}}>{view==='players'?item.username:item.name}</div>
//                 <div className="text-muted text-xs" style={{textTransform:'uppercase',letterSpacing:.5}}>
//                   {view==='players' ? (item.teams?.name||'No team') : ''}
//                 </div>
//                 <div style={{marginTop:6,background:'#1a1a2e',borderRadius:3,height:4,overflow:'hidden'}}>
//                   <div style={{height:'100%',width:`${Math.round(((item.total_itrs||0)/maxPts)*100)}%`,
//                     background:item.color||'#00e5ff',borderRadius:3,transition:'width .5s'}}/>
//                 </div>
//               </div>
//               <div style={{textAlign:'right',minWidth:100}}>
//                 <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,color:item.color||'#00e5ff'}}>
//                   {(item.total_itrs||0).toLocaleString()}
//                 </div>
//                 <div className="text-xs text-muted">{item.battle_wins||0} wins</div>
//               </div>
//             </div>
//             {i<list.length-1 && <div className="divider" style={{margin:'0 1rem'}}/>}
//           </div>
//         ))}
//         {list.length===0 && <p className="text-muted text-sm" style={{padding:'1rem'}}>Nothing yet.</p>}
//       </div>
//     </div>
//   )
// }
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Avatar, TeamLogo, Spinner } from '../components/UI'
const TABS = [
  { key: 'players', label: '👤 Players' },
  { key: 'teams',   label: '⚔ Teams' },
  { key: 'battles', label: '🏆 Battle Wins' },
]

function RankIcon({ rank }) {
  if (rank === 1) return <span style={{ fontSize: 20 }}>👑</span>
  if (rank === 2) return <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize: 20, color: '#c0c0c0' }}>#2</span>
  if (rank === 3) return <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize: 20, color: '#cd7f32' }}>#3</span>
  return <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize: 20, color: '#444' }}>#{rank}</span>
}

function PlayerRow({ player, rank }) {
  const isTop3 = rank <= 3
  return (
    <div className="lb-row" style={{
      background: rank === 1 ? '#ffd70008' : 'transparent',
      border: rank === 1 ? '1px solid #ffd70020' : '1px solid transparent',
      borderRadius: 6,
      marginBottom: 2
    }}>
      <div style={{ width: 36, textAlign: 'center', flexShrink: 0 }}>
        <RankIcon rank={rank} />
      </div>
      <Avatar name={player.username} color={player.color} size={36} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {player.username}
        </div>
        <div className="text-xs text-muted">
          {player.teams?.name || 'No team'}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{
          fontFamily: "'Bebas Neue',sans-serif",
          fontSize: 24,
          color: isTop3 ? (player.color || '#00e5ff') : '#00e5ff',
          lineHeight: 1
        }}>
          {(player.total_itrs || 0).toLocaleString()}
        </div>
        <div className="text-xs text-muted">{player.battle_wins || 0} wins</div>
      </div>
    </div>
  )
}

function TeamRow({ team, rank }) {
  const isTop3 = rank <= 3
  return (
    <div className="lb-row" style={{
      background: rank === 1 ? '#ffd70008' : 'transparent',
      border: rank === 1 ? '1px solid #ffd70020' : '1px solid transparent',
      borderRadius: 6,
      marginBottom: 2
    }}>
      <div style={{ width: 36, textAlign: 'center', flexShrink: 0 }}>
        <RankIcon rank={rank} />
      </div>
      <TeamLogo tag={team.tag} color={team.color} size={40} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{team.name}</div>
        <div className="text-xs text-muted">{team.member_count || 0} members</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{
          fontFamily: "'Bebas Neue',sans-serif",
          fontSize: 24,
          color: isTop3 ? (team.color || '#00e5ff') : team.color || '#00e5ff',
          lineHeight: 1
        }}>
          {(team.total_itrs || 0).toLocaleString()}
        </div>
        <div className="text-xs text-muted">{team.battle_wins || 0} wins</div>
      </div>
    </div>
  )
}

function BattleWinsRow({ player, rank }) {
  return (
    <div className="lb-row" style={{
      background: rank === 1 ? '#ffd70008' : 'transparent',
      border: rank === 1 ? '1px solid #ffd70020' : '1px solid transparent',
      borderRadius: 6,
      marginBottom: 2
    }}>
      <div style={{ width: 36, textAlign: 'center', flexShrink: 0 }}>
        <RankIcon rank={rank} />
      </div>
      <Avatar name={player.username} color={player.color} size={36} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{player.username}</div>
        <div className="text-xs text-muted">{player.teams?.name || 'No team'}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{
          fontFamily: "'Bebas Neue',sans-serif",
          fontSize: 24,
          color: '#ffd700',
          lineHeight: 1
        }}>
          {player.battle_wins || 0}
        </div>
        <div className="text-xs text-muted">battle wins</div>
      </div>
    </div>
  )
}

export default function Leaderboard() {
  const [tab,     setTab]     = useState('players')
  const [players, setPlayers] = useState([])
  const [teams,   setTeams]   = useState([])
  const [loading, setLoading] = useState(true)
  const [playerTeamTab, setPlayerTeamTab] = useState('RM TEAM')

  useEffect(() => {
    async function load() {
      const [{ data: p }, { data: t }] = await Promise.all([
        supabase
          .from('profiles')
          .select('id,username,color,total_itrs,battle_wins,team_id,teams(name,tag,color)')
          .order('total_itrs', { ascending: false }),
        supabase
          .from('teams')
          .select('id,name,tag,color,total_itrs,battle_wins')
          .order('total_itrs', { ascending: false }),
      ])

      // Attach member count to teams
      const withCount = await Promise.all((t || []).map(async team => {
        const { count } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('team_id', team.id)
        return { ...team, member_count: count || 0 }
      }))

      setPlayers(p || [])
      setTeams(withCount)
      setLoading(false)
    }
    load()
  }, [])

  // Battle wins leaderboard = players sorted by battle_wins
  const byWins = [...players].sort((a, b) => (b.battle_wins || 0) - (a.battle_wins || 0))

  const totalITRs    = players.reduce((s, p) => s + (p.total_itrs || 0), 0)
  const totalBattles = players.reduce((s, p) => s + (p.battle_wins || 0), 0)

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <Spinner size={32} />
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="mb3">
        <h1 className="section-title">LEADERBOARD</h1>
        <p className="section-sub">Season rankings · Metric: ITRs filled</p>
      </div>

      {/* Summary strip */}
      <div className="grid4 mb3">
        <div className="stat-card" style={{ border: '1px solid #00e5ff33' }}>
          <div className="text-muted text-xs mb1" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>Total Players</div>
          <div className="stat-val" style={{ color: '#00e5ff' }}>{players.length}</div>
        </div>
        <div className="stat-card" style={{ border: '1px solid #a855f733' }}>
          <div className="text-muted text-xs mb1" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>Total Teams</div>
          <div className="stat-val" style={{ color: '#a855f7' }}>{teams.length}</div>
        </div>
        <div className="stat-card" style={{ border: '1px solid #00ff8833' }}>
          <div className="text-muted text-xs mb1" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>Total ITRs</div>
          <div className="stat-val" style={{ color: '#00ff88' }}>{totalITRs.toLocaleString()}</div>
        </div>
        <div className="stat-card" style={{ border: '1px solid #ffd70033' }}>
          <div className="text-muted text-xs mb1" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>Battle Wins</div>
          <div className="stat-val" style={{ color: '#ffd700' }}>{totalBattles}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap1 mb3">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`btn btn-sm ${tab === t.key ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="card">
  {/* Players tab */}
  {tab === 'players' && (() => {
          const filtered = players
            .filter(p => p.teams?.name === playerTeamTab)
            .sort((a,b) => (b.total_itrs||0) - (a.total_itrs||0))

          return (
            <>
              <div className="flex items-center justify-between mb2">
                <h3 style={{ fontSize: 16, color: '#666', letterSpacing: 1 }}>TOP ITR FILLERS</h3>
                <div className="flex gap1">
                  {['RM TEAM','ADVISOR TEAM'].map(team => (
                    <button
                      key={team}
                      className={`btn btn-sm ${playerTeamTab===team?'btn-primary':'btn-ghost'}`}
                      onClick={()=>setPlayerTeamTab(team)}
                      style={{fontSize:11}}
                    >
                      {team}
                    </button>
                  ))}
                </div>
              </div>
              {filtered.length === 0
                ? <p className="text-muted text-sm">No players in this team yet.</p>
                : filtered.map((p, i) => <PlayerRow key={p.id} player={p} rank={i + 1} />)
              }
            </>
          )
        })()}

        {/* Teams tab */}
        {tab === 'teams' && (
          <>
            <div className="flex items-center justify-between mb2">
              <h3 style={{ fontSize: 16, color: '#666', letterSpacing: 1 }}>TEAM STANDINGS</h3>
              <span className="text-xs text-muted">{teams.length} teams</span>
            </div>
            {teams.length === 0
              ? <p className="text-muted text-sm">No teams yet.</p>
              : teams.map((t, i) => <TeamRow key={t.id} team={t} rank={i + 1} />)
            }
          </>
        )}

        {/* Battle wins tab */}
        {tab === 'battles' && (
          <>
            <div className="flex items-center justify-between mb2">
              <h3 style={{ fontSize: 16, color: '#666', letterSpacing: 1 }}>BATTLE CHAMPIONS</h3>
              <span className="text-xs text-muted">by wins</span>
            </div>
            {byWins.filter(p => (p.battle_wins || 0) > 0).length === 0
              ? <p className="text-muted text-sm">No battle wins yet. Start a battle!</p>
              : byWins.map((p, i) => <BattleWinsRow key={p.id} player={p} rank={i + 1} />)
            }
          </>
        )}
      </div>
    </div>
  )
}
