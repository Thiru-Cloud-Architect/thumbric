import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './auth'
import { loadEntitlement, planDisplayName } from './entitlement'
import { loadSimpleUser } from './simpleAuth'

/** Shared header identity so every page shows the same signed-in state. */
export function useHeaderAuth() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [tick, setTick] = useState(0)

  useEffect(() => {
    function refresh() {
      setTick((n) => n + 1)
    }
    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', refresh)
    return () => {
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', refresh)
    }
  }, [])

  // tick forces re-read of localStorage after pricing unlock / other tabs.
  void tick
  const simple = loadSimpleUser()
  const entitlement = loadEntitlement()
  const name = user?.name || simple?.name || null
  const email = user?.email || simple?.email || entitlement.email || null
  const signedIn = Boolean(name || email)
  const plan = planDisplayName(entitlement)
  const userLabel = signedIn
    ? name || email?.split('@')[0] || 'Account'
    : loading
      ? '…'
      : null

  function onLoginClick() {
    if (signedIn) {
      navigate('/account')
      return
    }
    navigate('/account?signin=1')
  }

  return {
    userLabel: signedIn ? userLabel : null,
    planLabel: plan,
    signedIn,
    loading,
    onLoginClick,
    email,
    name: userLabel,
  }
}
