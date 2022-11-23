import Link from 'next/link'

export default function FreestandingHeader() {
  
  return <>
    <header className="container">
      <div className="row">
        <div className="col-12 text-center">
          <Link href="/"><a><img src="/logo-silberpfoten.png" width="75" alt="SilberPfoten" className="mt-5 cursor-pointer" /></a></Link>
        </div>
      </div>
    </header>
  </>
}