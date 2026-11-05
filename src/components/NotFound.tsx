import { Link } from '@tanstack/react-router'

export function NotFound() {
  return (
    <main
      id="main"
      className="grid min-h-dvh place-items-center bg-night-950 px-6 text-center text-mist-200"
    >
      <div>
        <p className="font-mono text-sm tracking-widest text-peach-300 uppercase">404</p>
        <h1 className="mt-3 font-display text-5xl font-bold text-mist-100">Nothing lives here.</h1>
        <p className="mt-4 text-mist-300">The page you were looking for has wandered off.</p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-full bg-lilac-300 px-5 py-2.5 font-medium text-night-950 transition hover:bg-lilac-200"
        >
          Take me home
        </Link>
      </div>
    </main>
  )
}
