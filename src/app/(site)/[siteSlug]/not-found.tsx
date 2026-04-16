import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <div className="text-[120px] font-black leading-none bg-gradient-to-br from-primary-600 to-primary-700 bg-clip-text text-transparent">
        404
      </div>
      <h1 className="mt-4 text-3xl font-bold text-gray-900">
        Diese Seite gibt es nicht
      </h1>
      <p className="mt-4 text-lg text-gray-600">
        Die gewünschte Seite wurde nicht gefunden oder existiert nicht mehr.
        Vielleicht findest du was du suchst über eine dieser Optionen:
      </p>
      <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
        <Link
          href="/"
          className="px-6 py-3 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
        >
          Zur Startseite
        </Link>
        <Link
          href="/tools"
          className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Tools & Rechner
        </Link>
      </div>
    </div>
  );
}
