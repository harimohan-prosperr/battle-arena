
// import { Avatar, TeamLogo, ITRBars } from './UI'

// function SideBlock({ side, members=[], scores=[], color, isMe }) {
//   const approved = scores.filter(s=>s.status==='approved')
//   const pending  = scores.filter(s=>s.status==='pending')
//   const rejected = scores.filter(s=>s.status==='rejected')
//   const total    = approved.reduce((s,d)=>s+(d?.itr_count||0),0)

//   // Group approved by day for bars
//   const byDay = {}
//   approved.forEach(s=>{ byDay[s.day_number] = (byDay[s.day_number]||0) + s.itr_count })
//   const maxDay = Math.max(...Object.keys(byDay).map(Number), 0)
//   const dailyArr = Array.from({length: Math.max(maxDay,7)}, (_,i) => byDay[i+1]||null)

//   return (
//     <div style={{flex:1,minWidth:0}}>
//       <div className="flex items-center gap1" style={{marginBottom:8}}>
//         {side?.tag
//           ? <TeamLogo tag={side.tag} color={side.color||color} size={36}/>
//           : <Avatar name={side?.name} color={side?.color||color} size={36}/>
//         }
//         <div style={{minWidth:0}}>
//           <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:'#e0e0f0',
//             whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
//             {side?.name||'—'}
//           </div>
//           {members.length>1 && (
//             <div className="text-xs text-muted">{members.map(m=>m.username).filter(Boolean).join(', ')}</div>
//           )}
//         </div>
//         {isMe && <span className="tag tag-blue" style={{marginLeft:'auto',flexShrink:0}}>You</span>}
//       </div>
//       <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,color:side?.color||color,lineHeight:1,marginBottom:4}}>
//         {total.toLocaleString()}
//         <span style={{fontSize:13,color:'#555',fontFamily:"'Rajdhani',sans-serif",marginLeft:4}}>ITRs</span>
//       </div>
//       <div className="flex gap1" style={{marginBottom:4,flexWrap:'wrap'}}>
//         {pending.length>0 && <span className="tag tag-gold" style={{fontSize:10}}>⏳ {pending.length} pending</span>}
//         {rejected.length>0 && <span className="tag tag-red" style={{fontSize:10}}>✗ {rejected.length} rejected</span>}
//       </div>
//       <ITRBars scores={dailyArr} color={side?.color||color}/>
//     </div>
//   )
// }

// export default function BattleCard({ battle, myId, onAccept, onLogScore }) {
//   const {
//     id, status, battle_type, wager, duration_days=7,
//     challenger_side, opponent_side,
//     challenger_members=[], opponent_members=[],
//     daily_scores=[], winner_side, start_date,
//   } = battle

//   const cScores = daily_scores.filter(s=>s.side==='challenger')
//   const oScores = daily_scores.filter(s=>s.side==='opponent')
//   const cTotal  = cScores.filter(s=>s.status==='approved').reduce((s,d)=>s+(d?.itr_count||0),0)
//   const oTotal  = oScores.filter(s=>s.status==='approved').reduce((s,d)=>s+(d?.itr_count||0),0)

//   const iAmChallenger = challenger_members.some(m=>m.user_id===myId)
//   const iAmOpponent   = opponent_members.some(m=>m.user_id===myId)
//   const myRole        = iAmChallenger?'challenger':iAmOpponent?'opponent':null

//   // Days remaining
//   const daysLeft = start_date
//     ? Math.max(0, duration_days - Math.floor((Date.now()-new Date(start_date)) / 86400000))
//     : duration_days
//     const battleEnded = start_date
//     ? Math.floor((Date.now()-new Date(start_date)) / 86400000) >= duration_days
//     : false
//   const statusMeta = {
//     pending:   {color:'#f97316',label:'PENDING', tagClass:'tag-red'},
//     active:    {color:'#00ff88',label:'ACTIVE',  tagClass:'tag-green'},
//     completed: {color:'#a855f7',label:'DONE',    tagClass:'tag-gray'},
//   }[status]||{color:'#555',label:status?.toUpperCase(),tagClass:'tag-gray'}

//   const grandTotal = cTotal+oTotal||1
//   const cPct = Math.round((cTotal/grandTotal)*100)
//   const oPct = 100-cPct
//   const winnerName = winner_side==='challenger'?challenger_side?.name:opponent_side?.name

//   return (
//     <div className="card" style={{
//       borderColor:status==='active'?'#00ff8822':status==='pending'?'#f9731622':'#1e1e3a',
//       position:'relative',overflow:'hidden'
//     }}>
//       <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:statusMeta.color,opacity:status==='active'?0.7:0.3}}/>

//       <div className="flex items-center justify-between mb2" style={{marginTop:4}}>
//         <div className="flex items-center gap1">
//           <span className={`tag ${statusMeta.tagClass}`}>{statusMeta.label}</span>
//           <span className="tag tag-gray" style={{fontSize:11}}>⚔ 1v1</span>
//           {status==='active' && <span className="text-xs text-muted">{daysLeft}d left · {duration_days}d battle</span>}
//         </div>
//         {wager && <div className="itr-chip">🏆 {wager}</div>}
//       </div>

//       <div style={{display:'flex',alignItems:'flex-start',gap:'1rem'}}>
//         <SideBlock side={challenger_side} members={challenger_members} scores={cScores} color="#ff3c5c" isMe={iAmChallenger}/>
//         <div style={{display:'flex',flexDirection:'column',alignItems:'center',paddingTop:6,flexShrink:0}}>
//           <div className="vs-badge">VS</div>
//           {status==='active' && (cTotal>0||oTotal>0) && (
//             <div style={{marginTop:8,fontSize:10,color:'#555',textAlign:'center'}}>
//               {cTotal>oTotal&&<div style={{color:'#ff3c5c'}}>▲ leading</div>}
//               {oTotal>cTotal&&<div style={{color:'#00e5ff'}}>▲ leading</div>}
//               {cTotal===oTotal&&cTotal>0&&<div>tied</div>}
//             </div>
//           )}
//         </div>
//         <SideBlock side={opponent_side} members={opponent_members} scores={oScores} color="#00e5ff" isMe={iAmOpponent}/>
//       </div>

//       {status==='active' && (cTotal+oTotal)>0 && (
//         <div style={{marginTop:'1rem'}}>
//           <div style={{display:'flex',height:6,borderRadius:3,overflow:'hidden',gap:2}}>
//             <div style={{width:`${cPct}%`,background:challenger_side?.color||'#ff3c5c',borderRadius:'3px 0 0 3px',transition:'width .5s'}}/>
//             <div style={{width:`${oPct}%`,background:opponent_side?.color||'#00e5ff',borderRadius:'0 3px 3px 0',transition:'width .5s'}}/>
//           </div>
//           <div className="flex justify-between mt1">
//             <span className="text-xs" style={{color:challenger_side?.color||'#ff3c5c'}}>{cPct}%</span>
//             <span className="text-xs" style={{color:opponent_side?.color||'#00e5ff'}}>{oPct}%</span>
//           </div>
//         </div>
//       )}

//       {status==='completed' && winnerName && (
//         <div style={{marginTop:'1rem',background:'#ffd70011',border:'1px solid #ffd70033',
//           borderRadius:6,padding:'8px 14px',textAlign:'center',
//           fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:'#ffd700',letterSpacing:2}}>
//           🏆 {winnerName} wins!
//         </div>
//       )}

//       {(status==='pending'||status==='active') && (
//         <div className="flex gap1" style={{marginTop:'1rem'}}>
//           {status==='pending' && iAmOpponent && (
//             <button className="btn btn-success btn-sm" onClick={()=>onAccept(id)}>✓ Accept Challenge</button>
//           )}
//          {status==='active' && myRole && !battleEnded && (
//             <button className="btn btn-primary btn-sm" onClick={()=>onLogScore(battle,myRole)}>
//               📋 Log ITRs
//             </button>
//           )}
//           {status==='active' && myRole && battleEnded && (
//             <span className="text-xs text-muted" style={{alignSelf:'center'}}>⏳ Battle duration ended — waiting for admin to mark complete</span>
//           )}
//           {status==='pending' && iAmChallenger && (
//             <span className="text-xs text-muted" style={{alignSelf:'center'}}>⏳ Waiting for opponent to accept…</span>
//           )}
//         </div>
//       )}
//     </div>
//   )
// }


import { Avatar, TeamLogo, ITRBars } from './UI'

function SideBlock({ side, members=[], scores=[], color, isMe }) {
  const approved = scores.filter(s=>s.status==='approved')
  const pending  = scores.filter(s=>s.status==='pending')
  const rejected = scores.filter(s=>s.status==='rejected')
  const total    = approved.reduce((s,d)=>s+(d?.itr_count||0),0)

  const byDay = {}
  approved.forEach(s=>{ byDay[s.day_number] = (byDay[s.day_number]||0) + s.itr_count })
  const maxDay = Math.max(...Object.keys(byDay).map(Number), 0)
  const dailyArr = Array.from({length: Math.max(maxDay,7)}, (_,i) => byDay[i+1]||null)

  return (
    <div style={{flex:1,minWidth:0,textAlign:'center'}}>
      <div style={{display:'flex',justifyContent:'center',marginBottom:6}}>
        {side?.tag
          ? <TeamLogo tag={side.tag} color={side.color||color} size={32}/>
          : <Avatar name={side?.name} color={side?.color||color} size={32}/>
        }
      </div>
      <div style={{fontSize:12,fontWeight:600,color:'#e0e0f0',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',padding:'0 4px'}}>
        {side?.name||'—'}
        {isMe && <span className="tag tag-blue" style={{marginLeft:4,fontSize:9}}>You</span>}
      </div>
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,color:side?.color||color,lineHeight:1.3}}>
        {total.toLocaleString()}
      </div>
      {(pending.length>0 || rejected.length>0) && (
        <div className="flex gap1" style={{justifyContent:'center',marginTop:2,flexWrap:'wrap'}}>
          {pending.length>0 && <span className="tag tag-gold" style={{fontSize:9}}>⏳{pending.length}</span>}
          {rejected.length>0 && <span className="tag tag-red" style={{fontSize:9}}>✗{rejected.length}</span>}
        </div>
      )}
    </div>
  )
}

export default function BattleCard({ battle, myId, onAccept, onLogScore }) {
  const {
    id, status, wager, duration_days=7,
    challenger_side, opponent_side,
    challenger_members=[], opponent_members=[],
    daily_scores=[], winner_side, start_date, created_at,
  } = battle

  const cScores = daily_scores.filter(s=>s.side==='challenger')
  const oScores = daily_scores.filter(s=>s.side==='opponent')
  const cTotal  = cScores.filter(s=>s.status==='approved').reduce((s,d)=>s+(d?.itr_count||0),0)
  const oTotal  = oScores.filter(s=>s.status==='approved').reduce((s,d)=>s+(d?.itr_count||0),0)

  const iAmChallenger = challenger_members.some(m=>m.user_id===myId)
  const iAmOpponent   = opponent_members.some(m=>m.user_id===myId)
  const myRole        = iAmChallenger?'challenger':iAmOpponent?'opponent':null

  const daysLeft = start_date
    ? Math.max(0, duration_days - Math.floor((Date.now()-new Date(start_date)) / 86400000))
    : duration_days
  const battleEnded = start_date
    ? Math.floor((Date.now()-new Date(start_date)) / 86400000) >= duration_days
    : false

  // For pending battles: time left to accept, based on created_at + duration_days
  const pendingExpired = status==='pending' && created_at
    ? Math.floor((Date.now()-new Date(created_at)) / 86400000) >= duration_days
    : false

  const statusMeta = {
    pending:   {color:'#f97316',label:'PENDING', tagClass:'tag-red'},
    active:    {color:'#00ff88',label:'ACTIVE',  tagClass:'tag-green'},
    completed: {color:'#a855f7',label:'DONE',    tagClass:'tag-gray'},
    cancelled: {color:'#555',   label:'CANCELLED', tagClass:'tag-gray'},
  }[status]||{color:'#555',label:status?.toUpperCase(),tagClass:'tag-gray'}

  const total = cTotal+oTotal
  const diff = Math.abs(cTotal-oTotal)
  const knotPct = total===0 ? 50 : Math.round((cTotal/total)*100)
  const leaderName = cTotal>oTotal ? challenger_side?.name : oTotal>cTotal ? opponent_side?.name : null
  const winnerName = winner_side==='challenger'?challenger_side?.name:winner_side==='opponent'?opponent_side?.name:null

  const isCancelled = status==='cancelled'

  return (
    <div className="card" style={{
      borderColor:status==='active'?'#00ff8822':status==='pending'?'#f9731622':'#1e1e3a',
      position:'relative', overflow:'hidden',
      opacity: isCancelled ? 0.5 : 1,
    }}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:statusMeta.color,opacity:status==='active'?0.7:0.3}}/>

      <div className="flex items-center justify-between mb2" style={{marginTop:4}}>
        <div className="flex items-center gap1">
          <span className={`tag ${statusMeta.tagClass}`}>{statusMeta.label}</span>
          <span className="tag tag-gray" style={{fontSize:11}}>⚔ 1v1</span>
          {status==='active' && <span className="text-xs text-muted">{daysLeft}d left</span>}
          {status==='pending' && !pendingExpired && <span className="text-xs text-muted">expires in {Math.max(0,duration_days - Math.floor((Date.now()-new Date(created_at))/86400000))}d</span>}
        </div>
        {wager && <div className="itr-chip" style={{fontSize:11}}>🏆 {wager}</div>}
      </div>

      <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
        <SideBlock side={challenger_side} members={challenger_members} scores={cScores} color="#ff3c5c" isMe={iAmChallenger}/>
        <span style={{fontSize:11,color:'#555',flexShrink:0}}>vs</span>
        <SideBlock side={opponent_side} members={opponent_members} scores={oScores} color="#00e5ff" isMe={iAmOpponent}/>
      </div>

      {!isCancelled && (status==='active'||status==='completed') && (
        <div style={{margin:'14px 0 6px'}}>
          <div style={{position:'relative',height:4,background:'#1a1a2e',borderRadius:2}}>
            <div style={{
              position:'absolute',left:`${knotPct}%`,top:'50%',
              transform:'translate(-50%,-50%)',
              width:14,height:14,borderRadius:'50%',
              background: status==='completed' ? '#ffd700' : (leaderName ? (leaderName===challenger_side?.name?'#ff3c5c':'#00e5ff') : '#555'),
              border:'3px solid #0d0d1a',
              transition:'left .5s',
            }}/>
          </div>
          {status==='completed' && winnerName ? (
            <div style={{textAlign:'center',marginTop:8}}>
              <span className="tag tag-gold" style={{fontSize:11}}>🏆 {winnerName} wins</span>
            </div>
          ) : status==='completed' ? (
            <div style={{textAlign:'center',marginTop:8}}>
              <span className="tag tag-gray" style={{fontSize:11}}>🤝 It's a draw — {cTotal} ITRs each</span>
            </div>
          ) : (
            <p className="text-xs text-muted" style={{textAlign:'center',marginTop:6}}>
              {leaderName ? `${leaderName} leads by ${diff}` : total===0 ? 'No ITRs logged yet' : "It's a tie!"}
            </p>
          )}
        </div>
      )}

      {isCancelled && (
        <p className="text-xs text-muted" style={{textAlign:'center',marginTop:10}}>
          Cancelled — opponent did not accept in time
        </p>
      )}

      {(status==='pending'||status==='active') && (
        <div className="flex gap1" style={{marginTop:'1rem',justifyContent:'center'}}>
          {status==='pending' && iAmOpponent && !pendingExpired && (
            <button className="btn btn-success btn-sm" onClick={()=>onAccept(id)}>✓ Accept</button>
          )}
          {status==='active' && myRole && !battleEnded && (
            <button className="btn btn-primary btn-sm" onClick={()=>onLogScore(battle,myRole)}>📋 Log ITRs</button>
          )}
          {status==='active' && myRole && battleEnded && (
            <span className="text-xs text-muted">⏳ Duration ended — admin will finalize</span>
          )}
          {status==='pending' && iAmChallenger && (
            <span className="text-xs text-muted">⏳ Waiting for opponent…</span>
          )}
        </div>
      )}
    </div>
  )
}