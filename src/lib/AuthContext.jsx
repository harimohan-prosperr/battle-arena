// import { createContext, useContext, useEffect, useState } from 'react'
// import { supabase } from './supabase'

// const AuthContext = createContext(null)

// export function AuthProvider({ children }) {
//   const [session, setSession] = useState(undefined) // undefined = still loading
//   const [profile, setProfile] = useState(null)

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setSession(session)
//       if (session) loadProfile(session.user.id)
//     })

//     const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
//       setSession(session)
//       if (session) loadProfile(session.user.id)
//       else setProfile(null)
//     })

//     return () => subscription.unsubscribe()
//   }, [])

//   async function loadProfile(uid) {
//     const { data } = await supabase
//       .from('profiles')
//       .select('*, teams(id,name,tag,color)')
//       .eq('id', uid)
//       .single()
//     setProfile(data)
//   }

//   const signIn  = (email, password) => supabase.auth.signInWithPassword({ email, password })
//   const signOut = () => supabase.auth.signOut()
//   const refetchProfile = () => session && loadProfile(session.user.id)

//   return (
//     <AuthContext.Provider value={{ session, profile, signIn, signOut, refetchProfile }}>
//       {children}
//     </AuthContext.Provider>
//   )
// }

// export const useAuth = () => useContext(AuthContext)

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined)
  const [profile, setProfile] = useState(null)

  async function loadProfile(uid) {
    const { data } = await supabase
      .from('profiles')
      .select('*, teams(id,name,tag,color)')
      .eq('id', uid)
      .single()
    setProfile(data)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loadProfile(session.user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session)
      if (session) loadProfile(session.user.id)
      else { setSession(null); setProfile(null) }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn  = (email, password) => supabase.auth.signInWithPassword({ email, password })
  const signOut = () => supabase.auth.signOut()
  const refetchProfile = () => session && loadProfile(session.user.id)

  return (
    <AuthContext.Provider value={{ session, profile, signIn, signOut, refetchProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
