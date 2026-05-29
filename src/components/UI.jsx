// const DAYS = ['M','T','W','T','F','S','S']

// export function Avatar({ name, color, size = 36 }) {
//   return (
//     <div style={{
//       width: size, height: size, borderRadius: '50%',
//       background: (color||'#00e5ff')+'33', border:`2px solid ${color||'#00e5ff'}`,
//       display:'flex', alignItems:'center', justifyContent:'center',
//       fontWeight:700, fontSize:Math.round(size*.38), color:color||'#00e5ff',
//       flexShrink:0, fontFamily:"'Bebas Neue',sans-serif"
//     }}>
//       {name?.slice(0,2).toUpperCase()}
//     </div>
//   )
// }

// export function TeamLogo({ tag, color, size = 40 }) {
//   return (
//     <div className="team-logo" style={{
//       width:size, height:size,
//       background:(color||'#00e5ff')+'22', color:color||'#00e5ff',
//       border:`1px solid ${color||'#00e5ff'}55`
//     }}>{tag}</div>
//   )
// }

// export function Spinner({ size = 24 }) {
//   return <div className="spinner" style={{ width:size, height:size }} />
// }

// export function ITRBars({ scores = [], color = '#00e5ff' }) {
//   const max = Math.max(...scores.map(s => s??0), 1)
//   return (
//     <div className="day-bars">
//       {DAYS.map((d,i) => (
//         <div key={i} className="day-bar-col">
//           <div className="day-bar" style={{
//             width:20,
//             height: scores[i]!=null ? Math.max(4, Math.round((scores[i]/max)*36)) : 4,
//             background: scores[i]!=null ? color : '#1a1a2e'
//           }} />
//           <span style={{ fontSize:9, color:'#444', fontFamily:"'Rajdhani',sans-serif" }}>{d}</span>
//         </div>
//       ))}
//     </div>
//   )
// }

// export function Modal({ onClose, children, maxWidth = 520 }) {
//   return (
//     <div className="modal-bg" onClick={e => e.target===e.currentTarget && onClose()}>
//       <div className="modal" style={{ maxWidth }}>{children}</div>
//     </div>
//   )
// }

// export function StatCard({ label, value, color }) {
//   return (
//     <div className="stat-card" style={{ border:`1px solid ${color}33` }}>
//       <div className="text-muted text-xs mb1" style={{ textTransform:'uppercase', letterSpacing:1 }}>{label}</div>
//       <div className="stat-val" style={{ color }}>{value}</div>
//     </div>
//   )
// }

// export function Empty({ message = 'Nothing here yet.' }) {
//   return (
//     <div className="card" style={{ textAlign:'center', color:'#444', padding:'2.5rem', fontSize:14 }}>
//       {message}
//     </div>
//   )
// }

const DAYS = ['M','T','W','T','F','S','S']

export function Avatar({ name, color, size = 36 }) {
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%',
      background:(color||'#00e5ff')+'33', border:`2px solid ${color||'#00e5ff'}`,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontWeight:700, fontSize:Math.round(size*.38), color:color||'#00e5ff',
      flexShrink:0, fontFamily:"'Bebas Neue',sans-serif"
    }}>
      {name?.slice(0,2).toUpperCase()}
    </div>
  )
}

export function TeamLogo({ tag, color, size = 40 }) {
  return (
    <div className="team-logo" style={{
      width:size, height:size,
      background:(color||'#00e5ff')+'22', color:color||'#00e5ff',
      border:`1px solid ${color||'#00e5ff'}55`
    }}>{tag}</div>
  )
}

export function Spinner({ size = 24 }) {
  return <div className="spinner" style={{ width:size, height:size }} />
}

export function ITRBars({ scores = [], color = '#00e5ff' }) {
  const max = Math.max(...scores.map(s => s??0), 1)
  return (
    <div className="day-bars">
      {DAYS.map((d,i) => (
        <div key={i} className="day-bar-col">
          <div className="day-bar" style={{
            width:20,
            height: scores[i]!=null ? Math.max(4, Math.round((scores[i]/max)*36)) : 4,
            background: scores[i]!=null ? color : '#1a1a2e'
          }} />
          <span style={{ fontSize:9, color:'#444', fontFamily:"'Rajdhani',sans-serif" }}>{d}</span>
        </div>
      ))}
    </div>
  )
}

export function Modal({ onClose, children, maxWidth = 520 }) {
  return (
    <div className="modal-bg" onClick={e => e.target===e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth, position:'relative' }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position:'absolute', top:12, right:12,
            background:'transparent', border:'none',
            color:'#666', fontSize:20, cursor:'pointer',
            lineHeight:1, padding:'2px 6px', borderRadius:4,
          }}
          onMouseEnter={e=>e.target.style.color='#fff'}
          onMouseLeave={e=>e.target.style.color='#666'}
        >×</button>
        {children}
      </div>
    </div>
  )
}

export function StatCard({ label, value, color }) {
  return (
    <div className="stat-card" style={{ border:`1px solid ${color}33` }}>
      <div className="text-muted text-xs mb1" style={{ textTransform:'uppercase', letterSpacing:1 }}>{label}</div>
      <div className="stat-val" style={{ color }}>{value}</div>
    </div>
  )
}

export function Empty({ message = 'Nothing here yet.' }) {
  return (
    <div className="card" style={{ textAlign:'center', color:'#444', padding:'2.5rem', fontSize:14 }}>
      {message}
    </div>
  )
}
