import Link from "next/link";

type FooterProps = {
  siteName: string;
  enableAffiliates?: boolean;
};

export function Footer({ siteName, enableAffiliates }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t-2 border-primary-600 bg-gray-50 mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>&copy; {year} {siteName}</p>
          <nav className="flex gap-4">
            <Link href="/impressum" className="hover:text-primary-700 transition-colors">
              Impressum
            </Link>
            <Link href="/datenschutz" className="hover:text-primary-700 transition-colors">
              Datenschutz
            </Link>
          </nav>
        </div>
        {enableAffiliates && (
          <p className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-400 text-center">
            * Mit Stern (*) markierte Links sind Affiliate-Links. Beim Kauf über diese Links erhalten wir eine Provision &ndash; für dich bleibt der Preis gleich.
          </p>
        )}
      </div>
    </footer>
  );
}
