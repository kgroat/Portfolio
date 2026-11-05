import { type ErrorComponentProps, Link, useRouter } from '@tanstack/react-router'

export function RouteError({ error, reset }: ErrorComponentProps) {
  const router = useRouter()

  return (
    <main
      id="main"
      className="grid min-h-dvh place-items-center bg-night-950 px-6 text-center text-mist-200"
    >
      <div className="max-w-md">
        <p className="font-mono text-sm tracking-widest text-peach-300 uppercase">Error</p>
        <h1 className="mt-3 font-display text-4xl font-bold text-mist-100">
          Something went sideways.
        </h1>
        <p className="mt-4 text-mist-300">
          {error instanceof Error ? error.message : 'An unexpected error occurred.'}
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              reset()
              void router.invalidate()
            }}
            className="rounded-full bg-lilac-300 px-5 py-2.5 font-medium text-night-950 transition hover:bg-lilac-200"
          >
            Try again
          </button>
          <Link
            to="/"
            className="rounded-full border border-mist-100/15 px-5 py-2.5 font-medium transition hover:border-mist-100/40"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  )
}
