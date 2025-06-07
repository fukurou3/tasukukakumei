import * as AuthSession from 'expo-auth-session'
import * as SecureStore from 'expo-secure-store'

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
}

const SCOPES = ['https://www.googleapis.com/auth/calendar']
const ACCESS_TOKEN_KEY = 'google_access_token'
const REFRESH_TOKEN_KEY = 'google_refresh_token'

export type GoogleEventInput = {
  id?: string
  summary: string
  start: { dateTime: string }
  end: { dateTime: string }
}

export async function authenticateAsync() {
  const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID
  if (!clientId) throw new Error('No client id')
  const redirectUri = AuthSession.makeRedirectUri({ useProxy: true })
  const result = await AuthSession.startAsync({
    authUrl:
      discovery.authorizationEndpoint +
      `?client_id=${clientId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent(SCOPES.join(' '))}`,
  })
  if (result.type !== 'success') return
  const tokenRes = await AuthSession.exchangeCodeAsync(
    {
      clientId,
      code: result.params.code,
      redirectUri,
      extraParams: { code_verifier: result.params.code_verifier },
    },
    discovery
  )
  if (tokenRes.accessToken) await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokenRes.accessToken)
  if (tokenRes.refreshToken) await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokenRes.refreshToken)
}

async function getAccessToken(): Promise<string | null> {
  let token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY)
  if (token) return token
  const refresh = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY)
  if (!refresh) return null
  const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID
  if (!clientId) return null
  const res = await fetch(discovery.tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `client_id=${clientId}&grant_type=refresh_token&refresh_token=${refresh}`,
  })
  const json = await res.json()
  token = json.access_token
  if (token) await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token)
  return token
}

export async function fetchEvents(syncToken?: string) {
  const token = await getAccessToken()
  if (!token) throw new Error('No access token')
  const params = new URLSearchParams()
  params.append('singleEvents', 'true')
  if (syncToken) {
    params.append('syncToken', syncToken)
  } else {
    params.append('timeMin', new Date(0).toISOString())
  }
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
    { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) throw new Error('Failed to fetch events')
  return res.json()
}

export async function insertEvent(event: GoogleEventInput) {
  const token = await getAccessToken()
  if (!token) throw new Error('No access token')
  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  })
  if (!res.ok) throw new Error('Failed to create event')
  return res.json()
}

export async function updateEvent(eventId: string, event: GoogleEventInput) {
  const token = await getAccessToken()
  if (!token) throw new Error('No access token')
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(event),
  })
  if (!res.ok) throw new Error('Failed to update event')
  return res.json()
}

export async function deleteEvent(eventId: string) {
  const token = await getAccessToken()
  if (!token) throw new Error('No access token')
  await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
}
