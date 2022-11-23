import useSession from '../lib/auth/useSession'
import Wrapper from '../components/Wrapper'
import {useRouter} from 'next/router'
import Error from '../components/Error'
import Loading from '../components/Loading'

export default function Home() {
  const router = useRouter()
  const {session, isLoading: sessionIsLoading, isError: sessionHasError, isAuthenticated} = useSession()

  if (sessionHasError) return <Error />
  if (sessionIsLoading) return <Loading />
  if (!isAuthenticated) {
    router.push('/signin')

    return
  }

  return (
    <>
      <Wrapper>

      foo

      </Wrapper>
    </>
  )
}
