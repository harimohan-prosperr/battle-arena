import { useEffect, useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import BattleCard from '../components/BattleCard'
import { Modal, Spinner, Empty } from '../components/UI'

const COLORS = ['#ff3c5c','#00e5ff','#a855f7','#f97316','#22d3ee','#84cc16']

export default function Battles() {
  const { profile } = useAuth()
  const location = useLocation()
  const isAdmin = profile?.roles?.includes('ADMIN') || profile?.is_admin
  const [battles,  setBattles]  = useState([])
  const [allProfiles, setAllProfiles] = useState([])
  const [sameTeamProfiles, setSameTeamProfiles] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [showNew,  setShowNew]  = useState(false)
  const [logModal, setLogModal] = useState(null)
  const [itrVal,   setItrVal]   = useState('')
  const [saving,   setSaving]   = useState(false)
  const [statusFilter, setStatusFilter] = useState(location.state?.filter || 'all')
  const [adminForm, setAdminForm] = useState({ challengerId:'', opponentId:'', wager:'', duration:1 })
  const [playerForm, setPlayerForm] = useState({ opponentId:'', wager:'', duration:1 })

  const loadBattles = useCallback(async () => {
    const today = new Date().toISOString().slice(0,10)

    // Auto-cancel expired pending battles (calendar-day boundary)
    const { data: pendingBattles } = await supabase
      .from('battles')
      .select('id,created_at,duration_days')
      .eq('status','pending')

    const toCancel = (pendingBattles||[]).filter(b => {
      const createdDate = new Date(b.created_at).toISOString().slice(0,10)
      const daysSince = Math.floor((new Date(today) - new Date(createdDate)) / 86400000)
      return daysSince >= (b.duration_days || 7)
    }).map(b=>b.id)

    if (toCancel.length > 0) {
      await supabase.from('battles').update({ status:'cancelled' }).in('id', toCancel)
    }

    // Auto-complete active battles whose duration has ended (calendar-day boundary)
    const { data: activeBattles } = await supabase
      .from('battles')
      .select(`id,start_date,duration_days,challenger_side_id,opponent_side_id,
        daily_scores(side,itr_count,status)`)
      .eq('status','active')

    for (const b of (activeBattles||[])) {
      if (!b.start_date) continue
      const daysSince = Math.floor((new Date(today) - new Date(b.start_date)) / 86400000)
      if (daysSince >= (b.duration_days || 7)) {
        const cTotal = (b.daily_scores||[]).filter(s=>s.side==='challenger'&&s.status==='approved').reduce((s,d)=>s+(d.itr_count||0),0)
        const oTotal = (b.daily_scores||[]).filter(s=>s.side==='opponent'&&s.status==='approved').reduce((s,d)=>s+(d.itr_count||0),0)
        const winnerSide = cTotal===oTotal ? null : (cTotal>oTotal ? 'challenger' : 'opponent')
        await supabase.from('battles').update({ status:'completed', winner_side: winnerSide }).eq('id', b.id)
      }
    }

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

    const userId = (await supabase.auth.getUser()).data.user?.id
    const myProfile = (await supabase.from('profiles').select('is_admin,roles').eq('id', userId).single()).data
    const isAdminCheck = myProfile?.is_admin || myProfile?.roles?.includes('ADMIN')

    const filtered = isAdminCheck
      ? fixed
      : fixed.filter(b =>
          b.challenger_members?.some(m=>m.user_id===userId) ||
          b.opponent_members?.some(m=>m.user_id===userId)
        )

    // Sort: active > completed > pending > cancelled
    const statusOrder = { active: 0, completed: 1, pending: 2, cancelled: 3 }
    const sorted = [...filtered].sort((a,b) => {
      const orderDiff = (statusOrder[a.status] ?? 4) - (statusOrder[b.status] ?? 4)
      if (orderDiff !== 0) return orderDiff
      return new Date(b.created_at) - new Date(a.created_at)
    })

    setBattles(sorted)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadBattles()
    supabase.from('profiles').select('id,username,color,team_id,teams(name)')
      .then(({data}) => setAllProfiles(data||[]))
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
      const today = new Date().toISOString().slice(0,10)
      const daysSinceStart = Math.floor((new Date(today) - new Date(battle.start_date)) / 86400000)
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
    setAdminForm({ challengerId:'', opponentId:'', wager:'', duration:1 })
    loadBattles()
  }

  async function handlePlayerCreate() {
    if (!playerForm.opponentId) return
    setSaving(true)
    await createBattle(profile.id, playerForm.opponentId, playerForm.duration, playerForm.wager)
    setSaving(false); setShowNew(false)
    setPlayerForm({ opponentId:'', wager:'', duration:1 })
    loadBattles()
  }

  const adminOpponentList = adminForm.challengerId
    ? allProfiles.filter(p => {
        const challenger = allProfiles.find(x=>x.id===adminForm.challengerId)
        return p.id !== adminForm.challengerId && p.team_id === challenger?.team_id
      })
    : []

  const displayedBattles = statusFilter==='all'
    ? battles
    : battles.filter(b=>b.status===statusFilter)

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'4rem'}}><Spinner size={32}/></div>

  return (
    <div>
      <div className="flex items-center justify-between mb3">
        <div>
          <h1 className="section-title">BATTLES</h1>
          <p className="section-sub">ITR filling competitions</p>
          {statusFilter!=='all' && (
            <button className="btn btn-ghost btn-sm" style={{marginTop:6,fontSize:11}} onClick={()=>setStatusFilter('all')}>
              ✕ Clear filter: {statusFilter}
            </button>
          )}
        </div>
        <button className="btn btn-primary" onClick={()=>setShowNew(true)}>
          {isAdmin ? '⚔ Create Battle' : '⚔ Issue Challenge'}
        </button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))',gap:'1rem'}}>
        {displayedBattles.map(b=>(
          <BattleCard key={b.id} battle={b} myId={profile?.id} isAdmin={isAdmin}
            onAccept={handleAccept}
            onLogScore={(b,r)=>{setLogModal({battle:b,role:r});setItrVal('')}}
          />
        ))}
        {displayedBattles.length===0 && <Empty message="No battles found."/>}
      </div>

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
                4. Highest approved total when duration ends wins<br/>
                5. If opponent doesn't accept within the duration window, the challenge is cancelled
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