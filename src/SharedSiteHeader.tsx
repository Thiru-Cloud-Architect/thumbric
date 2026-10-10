import { SiteHeader } from './SiteHeader'
import { useHeaderAuth } from './useHeaderAuth'

/** SiteHeader wired to auth + plan so every page stays consistent. */
export function SharedSiteHeader() {
  const header = useHeaderAuth()
  return (
    <SiteHeader
      userLabel={header.userLabel}
      planLabel={header.signedIn ? header.planLabel : null}
      onLoginClick={header.onLoginClick}
    />
  )
}
