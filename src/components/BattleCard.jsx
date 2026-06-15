


// import { Avatar, TeamLogo, ITRBars } from './UI'

// const DAYS = ['M','T','W','T','F','S','S']

// function SideBlock({ side, members = [], scores = [], color, isMe }) {
//   // Only count approved scores in totals and bars
//   const approved = scores.filter(s => s.status === 'approved')
//   const pending  = scores.filter(s => s.status === 'pending')
//   const rejected = scores.filter(s => s.status === 'rejected')
//   const total    = approved.reduce((s, d) => s + (d?.itr_count || 0), 0)

//   const dailyArr = Array.from({ length: 7 }, (_, i) => {
//     const found = approved.find(s => s.day_number === i + 1)
//     return found ? found.itr_count : null
//   })

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
//             {side?.name || '—'}
//           </div>
//           {members.length > 1 && (
//             <div className="text-xs text-muted">
//               {members.map(m => m.username).filter(Boolean).join(', ')}
//             </div>
//           )}
//         </div>
//         {isMe && <span className="tag tag-blue" style={{marginLeft:'auto',flexShrink:0}}>You</span>}
//       </div>

//       <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,color:side?.color||color,lineHeight:1,marginBottom:4}}>
//         {total.toLocaleString()}
//         <span style={{fontSize:13,color:'#555',fontFamily:"'Rajdhani',sans-serif",marginLeft:4}}>ITRs</span>
//       </div>

//       {/* Pending / rejected badges */}
//       <div className="flex gap1" style={{marginBottom:4,flexWrap:'wrap'}}>
//         {pending.length > 0 && (
//           <span className="tag tag-gold" style={{fontSize:10}}>⏳ {pending.length} pending</span>
//         )}
//         {rejected.length > 0 && (
//           <span className="tag tag-red" style={{fontSize:10}}>✗ {rejected.length} rejected</span>
//         )}
//       </div>

//       <ITRBars scores={dailyArr} color={side?.color||color}/>
//     </div>
//   )
// }

// export default function BattleCard({ battle, myId, onAccept, onLogScore }) {
//   const {
//     id, status, battle_type, wager,
//     challenger_side, opponent_side,
//     challenger_members = [],
//     opponent_members   = [],
//     daily_scores       = [],
//     winner_side,
//   } = battle

//   const cScores = daily_scores.filter(s => s.side === 'challenger')
//   const oScores = daily_scores.filter(s => s.side === 'opponent')

//   const cApproved = cScores.filter(s => s.status === 'approved')
//   const oApproved = oScores.filter(s => s.status === 'approved')
//   const cTotal    = cApproved.reduce((s, d) => s + (d?.itr_count || 0), 0)
//   const oTotal    = oApproved.reduce((s, d) => s + (d?.itr_count || 0), 0)

//   const iAmChallenger = challenger_members.some(m => m.user_id === myId)
//   const iAmOpponent   = opponent_members.some(m => m.user_id === myId)
//   const myRole        = iAmChallenger ? 'challenger' : iAmOpponent ? 'opponent' : null

//   const today             = new Date().toISOString().slice(0, 10)
//   const myScoresToday     = daily_scores.filter(s => s.side === myRole && s.log_date === today)
//   const todayStatus       = myScoresToday[0]?.status
//   const alreadyPending    = todayStatus === 'pending'
//   const alreadyApproved   = todayStatus === 'approved'
//   const isRejectedToday   = todayStatus === 'rejected'

//   const approvedDays = myRole ? daily_scores.filter(s => s.side === myRole && s.status === 'approved').length : 0
//   const daysLeft     = Math.max(0, 7 - approvedDays)

//   const statusMeta = {
//     pending:   { color:'#f97316', label:'PENDING',  tagClass:'tag-red'   },
//     active:    { color:'#00ff88', label:'ACTIVE',   tagClass:'tag-green' },
//     completed: { color:'#a855f7', label:'DONE',     tagClass:'tag-gray'  },
//   }[status] || { color:'#555', label: status?.toUpperCase(), tagClass:'tag-gray' }

//   const grandTotal = cTotal + oTotal || 1
//   const cPct = Math.round((cTotal / grandTotal) * 100)
//   const oPct = 100 - cPct
//   const winnerName = winner_side === 'challenger' ? challenger_side?.name : opponent_side?.name

//   // Button label logic
//   function getButtonLabel() {
//     if (alreadyApproved) return `✓ Day ${approvedDays} approved`
//     if (alreadyPending)  return `⏳ Day ${approvedDays + 1} pending approval`
//     if (isRejectedToday) return `✗ Rejected — click to resubmit`
//     return `📋 Log Today's ITRs (Day ${approvedDays + 1})`
//   }

//   return (
//     <div className="card" style={{
//       borderColor: status==='active'?'#00ff8822':status==='pending'?'#f9731622':'#1e1e3a',
//       position:'relative', overflow:'hidden'
//     }}>
//       <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:statusMeta.color,opacity:status==='active'?0.7:0.3}}/>

//       {/* Header */}
//       <div className="flex items-center justify-between mb2" style={{marginTop:4}}>
//         <div className="flex items-center gap1">
//           <span className={`tag ${statusMeta.tagClass}`}>{statusMeta.label}</span>
//           <span className="tag tag-gray" style={{fontSize:11}}>{battle_type==='team'?'⚔ Team':'⚔ 1v1'}</span>
//           {status==='active' && daysLeft>0 && <span className="text-xs text-muted">{daysLeft}d left</span>}
//         </div>
//         {wager && <div className="itr-chip">🏆 {wager}</div>}
//       </div>

//       {/* Sides */}
//       <div style={{display:'flex',alignItems:'flex-start',gap:'1rem'}}>
//         <SideBlock side={challenger_side} members={challenger_members} scores={cScores} color="#ff3c5c" isMe={iAmChallenger}/>
//         <div style={{display:'flex',flexDirection:'column',alignItems:'center',paddingTop:6,flexShrink:0}}>
//           <div className="vs-badge">VS</div>
//           {status==='active' && (cTotal>0||oTotal>0) && (
//             <div style={{marginTop:8,fontSize:10,color:'#555',textAlign:'center'}}>
//               {cTotal>oTotal && <div style={{color:'#ff3c5c'}}>▲ leading</div>}
//               {oTotal>cTotal && <div style={{color:'#00e5ff'}}>▲ leading</div>}
//               {cTotal===oTotal && cTotal>0 && <div>tied</div>}
//             </div>
//           )}
//         </div>
//         <SideBlock side={opponent_side} members={opponent_members} scores={oScores} color="#00e5ff" isMe={iAmOpponent}/>
//       </div>

//       {/* Progress bar */}
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

//       {/* Winner banner */}
//       {status==='completed' && winnerName && (
//         <div style={{marginTop:'1rem',background:'#ffd70011',border:'1px solid #ffd70033',
//           borderRadius:6,padding:'8px 14px',textAlign:'center',
//           fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:'#ffd700',letterSpacing:2}}>
//           🏆 {winnerName} wins!
//         </div>
//       )}

//       {/* Action buttons */}
//       {(status==='pending'||status==='active') && (
//         <div className="flex gap1" style={{marginTop:'1rem'}}>
//           {status==='pending' && iAmOpponent && (
//             <button className="btn btn-success btn-sm" onClick={() => onAccept(id)}>✓ Accept Challenge</button>
//           )}
//           {status==='active' && myRole && (
//             <button
//               className={`btn btn-sm ${isRejectedToday?'btn-danger':alreadyPending||alreadyApproved?'btn-ghost':'btn-primary'}`}
//               onClick={() => !alreadyApproved && !alreadyPending && onLogScore(battle, myRole)}
//               disabled={alreadyApproved || alreadyPending}
//             >
//               {getButtonLabel()}
//             </button>
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

  // Group approved by day for bars
  const byDay = {}
  approved.forEach(s=>{ byDay[s.day_number] = (byDay[s.day_number]||0) + s.itr_count })
  const maxDay = Math.max(...Object.keys(byDay).map(Number), 0)
  const dailyArr = Array.from({length: Math.max(maxDay,7)}, (_,i) => byDay[i+1]||null)

  return (
    <div style={{flex:1,minWidth:0}}>
      <div className="flex items-center gap1" style={{marginBottom:8}}>
        {side?.tag
          ? <TeamLogo tag={side.tag} color={side.color||color} size={36}/>
          : <Avatar name={side?.name} color={side?.color||color} size={36}/>
        }
        <div style={{minWidth:0}}>
          <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:'#e0e0f0',
            whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
            {side?.name||'—'}
          </div>
          {members.length>1 && (
            <div className="text-xs text-muted">{members.map(m=>m.username).filter(Boolean).join(', ')}</div>
          )}
        </div>
        {isMe && <span className="tag tag-blue" style={{marginLeft:'auto',flexShrink:0}}>You</span>}
      </div>
      <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,color:side?.color||color,lineHeight:1,marginBottom:4}}>
        {total.toLocaleString()}
        <span style={{fontSize:13,color:'#555',fontFamily:"'Rajdhani',sans-serif",marginLeft:4}}>ITRs</span>
      </div>
      <div className="flex gap1" style={{marginBottom:4,flexWrap:'wrap'}}>
        {pending.length>0 && <span className="tag tag-gold" style={{fontSize:10}}>⏳ {pending.length} pending</span>}
        {rejected.length>0 && <span className="tag tag-red" style={{fontSize:10}}>✗ {rejected.length} rejected</span>}
      </div>
      <ITRBars scores={dailyArr} color={side?.color||color}/>
    </div>
  )
}

export default function BattleCard({ battle, myId, onAccept, onLogScore }) {
  const {
    id, status, battle_type, wager, duration_days=7,
    challenger_side, opponent_side,
    challenger_members=[], opponent_members=[],
    daily_scores=[], winner_side, start_date,
  } = battle

  const cScores = daily_scores.filter(s=>s.side==='challenger')
  const oScores = daily_scores.filter(s=>s.side==='opponent')
  const cTotal  = cScores.filter(s=>s.status==='approved').reduce((s,d)=>s+(d?.itr_count||0),0)
  const oTotal  = oScores.filter(s=>s.status==='approved').reduce((s,d)=>s+(d?.itr_count||0),0)

  const iAmChallenger = challenger_members.some(m=>m.user_id===myId)
  const iAmOpponent   = opponent_members.some(m=>m.user_id===myId)
  const myRole        = iAmChallenger?'challenger':iAmOpponent?'opponent':null

  // Days remaining
  const daysLeft = start_date
    ? Math.max(0, duration_days - Math.floor((Date.now()-new Date(start_date)) / 86400000))
    : duration_days
    const battleEnded = start_date
    ? Math.floor((Date.now()-new Date(start_date)) / 86400000) >= duration_days
    : false
  const statusMeta = {
    pending:   {color:'#f97316',label:'PENDING', tagClass:'tag-red'},
    active:    {color:'#00ff88',label:'ACTIVE',  tagClass:'tag-green'},
    completed: {color:'#a855f7',label:'DONE',    tagClass:'tag-gray'},
  }[status]||{color:'#555',label:status?.toUpperCase(),tagClass:'tag-gray'}

  const grandTotal = cTotal+oTotal||1
  const cPct = Math.round((cTotal/grandTotal)*100)
  const oPct = 100-cPct
  const winnerName = winner_side==='challenger'?challenger_side?.name:opponent_side?.name

  return (
    <div className="card" style={{
      borderColor:status==='active'?'#00ff8822':status==='pending'?'#f9731622':'#1e1e3a',
      position:'relative',overflow:'hidden'
    }}>
      <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:statusMeta.color,opacity:status==='active'?0.7:0.3}}/>

      <div className="flex items-center justify-between mb2" style={{marginTop:4}}>
        <div className="flex items-center gap1">
          <span className={`tag ${statusMeta.tagClass}`}>{statusMeta.label}</span>
          <span className="tag tag-gray" style={{fontSize:11}}>⚔ 1v1</span>
          {status==='active' && <span className="text-xs text-muted">{daysLeft}d left · {duration_days}d battle</span>}
        </div>
        {wager && <div className="itr-chip">🏆 {wager}</div>}
      </div>

      <div style={{display:'flex',alignItems:'flex-start',gap:'1rem'}}>
        <SideBlock side={challenger_side} members={challenger_members} scores={cScores} color="#ff3c5c" isMe={iAmChallenger}/>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',paddingTop:6,flexShrink:0}}>
          <div className="vs-badge">VS</div>
          {status==='active' && (cTotal>0||oTotal>0) && (
            <div style={{marginTop:8,fontSize:10,color:'#555',textAlign:'center'}}>
              {cTotal>oTotal&&<div style={{color:'#ff3c5c'}}>▲ leading</div>}
              {oTotal>cTotal&&<div style={{color:'#00e5ff'}}>▲ leading</div>}
              {cTotal===oTotal&&cTotal>0&&<div>tied</div>}
            </div>
          )}
        </div>
        <SideBlock side={opponent_side} members={opponent_members} scores={oScores} color="#00e5ff" isMe={iAmOpponent}/>
      </div>

      {status==='active' && (cTotal+oTotal)>0 && (
        <div style={{marginTop:'1rem'}}>
          <div style={{display:'flex',height:6,borderRadius:3,overflow:'hidden',gap:2}}>
            <div style={{width:`${cPct}%`,background:challenger_side?.color||'#ff3c5c',borderRadius:'3px 0 0 3px',transition:'width .5s'}}/>
            <div style={{width:`${oPct}%`,background:opponent_side?.color||'#00e5ff',borderRadius:'0 3px 3px 0',transition:'width .5s'}}/>
          </div>
          <div className="flex justify-between mt1">
            <span className="text-xs" style={{color:challenger_side?.color||'#ff3c5c'}}>{cPct}%</span>
            <span className="text-xs" style={{color:opponent_side?.color||'#00e5ff'}}>{oPct}%</span>
          </div>
        </div>
      )}

      {status==='completed' && winnerName && (
        <div style={{marginTop:'1rem',background:'#ffd70011',border:'1px solid #ffd70033',
          borderRadius:6,padding:'8px 14px',textAlign:'center',
          fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:'#ffd700',letterSpacing:2}}>
          🏆 {winnerName} wins!
        </div>
      )}

      {(status==='pending'||status==='active') && (
        <div className="flex gap1" style={{marginTop:'1rem'}}>
          {status==='pending' && iAmOpponent && (
            <button className="btn btn-success btn-sm" onClick={()=>onAccept(id)}>✓ Accept Challenge</button>
          )}
         {status==='active' && myRole && !battleEnded && (
            <button className="btn btn-primary btn-sm" onClick={()=>onLogScore(battle,myRole)}>
              📋 Log ITRs
            </button>
          )}
          {status==='active' && myRole && battleEnded && (
            <span className="text-xs text-muted" style={{alignSelf:'center'}}>⏳ Battle duration ended — waiting for admin to mark complete</span>
          )}
          {status==='pending' && iAmChallenger && (
            <span className="text-xs text-muted" style={{alignSelf:'center'}}>⏳ Waiting for opponent to accept…</span>
          )}
        </div>
      )}
    </div>
  )
}
