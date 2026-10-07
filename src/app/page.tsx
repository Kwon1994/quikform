import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-slate-50">
      <h1 className="text-4xl font-bold text-slate-900">
        Formly
      </h1>
      <p className="text-lg text-slate-600">
        Build forms. Share them. Get responses. Free.
      </p>
      <div className="flex gap-3">
        <Link
          href="/builder"
          className="rounded-lg bg-indigo-600 px-6 py-3 text-white font-medium hover:bg-indigo-700"
        >
          Create a form
        </Link>
        <Link
          href="/responses"
          className="rounded-lg border border-slate-300 px-6 py-3 font-medium hover:bg-white"
        >
          View responses
        </Link>
      </div>
    </div>
  );
}
