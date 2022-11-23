import useSWR from 'swr'

export default function useSession() {
  const {data, error} = useSWR(`/api/auth/session`, (url) => fetch(url).then(r => r.json()))

  return {
    session: data,
    isLoading: !error && !data,
    isError: error,
    isAuthenticated: data ? (Object.keys(data).length > 0) : false,
  }
}