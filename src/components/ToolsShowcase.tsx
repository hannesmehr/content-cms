import Link from "next/link";
import { ToolIcon } from "@/components/tools/ToolIcon";
import type { ToolDefinition } from "@/lib/tools";

type ToolsShowcaseProps = {
  tools: ToolDefinition[];
  title?: string;
  count?: number;
};

export function ToolsShowcase({ tools, title, count = 6 }: ToolsShowcaseProps) {
  const visibleTools = tools.slice(0, count);
  if (visibleTools.length === 0) return null;

  return (
    <section className="mt-12 mb-8">
      {title && (
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <Link
            href="/tools"
            className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            Alle Tools →
          </Link>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visibleTools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="group relative flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-primary-500 hover:shadow-lg hover:-translate-y-0.5"
          >
            {/* Icon */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-600 group-hover:text-white">
              <ToolIcon icon={tool.icon} className="h-5 w-5" />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 text-sm leading-tight group-hover:text-primary-700 transition-colors">
                {tool.shortTitle}
              </h3>
              <p className="mt-1 text-xs text-gray-500 line-clamp-2 leading-relaxed">
                {tool.description}
              </p>
            </div>

            {/* Arrow indicator */}
            <svg
              className="h-4 w-4 shrink-0 mt-0.5 text-gray-300 transition-all group-hover:text-primary-500 group-hover:translate-x-0.5"
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
        ))}
      </div>

      {/* CTA Banner if more tools available */}
      {tools.length > count && (
        <Link
          href="/tools"
          className="mt-4 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-6 py-3 text-sm font-medium text-gray-500 transition-all hover:border-primary-300 hover:bg-primary-50/50 hover:text-primary-600"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z"
            />
          </svg>
          Alle {tools.length} Tools & Rechner entdecken
        </Link>
      )}
    </section>
  );
}
