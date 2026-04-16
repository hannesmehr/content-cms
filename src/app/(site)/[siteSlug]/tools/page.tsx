// @ts-nocheck
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllSiteSlugs, getSiteBySlug } from "@/lib/get-sites";
import { getGroupedToolsForSite, getToolsForSite, toolsPageMeta } from "@/lib/tools";
import type { ToolDefinition } from "@/lib/tools";
import { ToolIcon } from "@/components/tools/ToolIcon";

type Props = {
  params: Promise<{ siteSlug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getAllSiteSlugs();
  return slugs.map((siteSlug) => ({ siteSlug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { siteSlug } = await params;
  const site = await getSiteBySlug(siteSlug);
  const meta = toolsPageMeta[siteSlug];
  if (!site || !meta) return {};

  const toolsUrl = `https://${site.domain}/tools`;

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: toolsUrl },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: "website",
      url: toolsUrl,
      siteName: site.name,
      locale: "de_DE",
    },
  };
}

function ToolCard({ tool }: { tool: ToolDefinition }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="group relative flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-primary-500 hover:shadow-lg hover:-translate-y-0.5"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-700 transition-colors group-hover:bg-primary-600 group-hover:text-white">
        <ToolIcon icon={tool.icon} />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="font-semibold text-gray-900 group-hover:text-primary-700">
          {tool.shortTitle}
        </h2>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
          {tool.description}
        </p>
      </div>
      <svg
        className="h-5 w-5 shrink-0 mt-1 text-gray-300 transition-all group-hover:text-primary-500 group-hover:translate-x-0.5"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 4.5l7.5 7.5-7.5 7.5"
        />
      </svg>
    </Link>
  );
}

function ToolsOverviewSchema({
  title,
  description,
  url,
  siteName,
  siteUrl,
  tools,
}: {
  title: string;
  description: string;
  url: string;
  siteName: string;
  siteUrl: string;
  tools: ToolDefinition[];
}) {
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Startseite", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Tools & Rechner", item: url },
    ],
  };

  const itemList = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url,
    isPartOf: { "@type": "WebSite", name: siteName, url: siteUrl },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: tools.length,
      itemListElement: tools.map((tool, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: tool.shortTitle,
        url: `${siteUrl}/tools/${tool.slug}`,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
    </>
  );
}

export default async function ToolsOverviewPage({ params }: Props) {
  const { siteSlug } = await params;
  const groups = getGroupedToolsForSite(siteSlug);
  const meta = toolsPageMeta[siteSlug];
  const totalTools = groups.reduce((sum, g) => sum + g.tools.length, 0);

  if (totalTools === 0 || !meta) {
    notFound();
  }

  const site = await getSiteBySlug(siteSlug);
  const siteUrl = site ? `https://${site.domain}` : "";
  const allTools = getToolsForSite(siteSlug);
  const hasGroups = groups.length > 1 || groups[0]?.name !== "";

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <ToolsOverviewSchema
        title={meta.title}
        description={meta.description}
        url={`${siteUrl}/tools`}
        siteName={site?.name || ""}
        siteUrl={siteUrl}
        tools={allTools}
      />
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">{meta.heading}</h1>
        <p className="mt-3 text-lg text-gray-600">{meta.description}</p>
      </div>

      {hasGroups ? (
        <div className="space-y-10">
          {groups.map((group) => (
            <section key={group.name}>
              <div className="mb-4 flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-800">
                  {group.name}
                </h2>
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-sm text-gray-400">
                  {group.tools.length}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {group.tools.map((tool) => (
                  <ToolCard key={tool.slug} tool={tool} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {groups[0]?.tools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}
