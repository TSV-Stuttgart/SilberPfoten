import Link from 'next/link'
import Image from 'next/image'

export default function FreestandingHeader() {
  
  return <>
    <header className="container">
      <div className="row">
        <div className="col-12 text-center">
          <Link href="/"><Image src="/logo-silberpfoten.png" width="75" height="75" alt="SilberPfoten" className="mt-5 cursor-pointer" /></Link>
        </div>
      </div>
    </header>
  </>
}