// @ts-nocheck
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPageBySlug } from "@/lib/get-pages";
import LexicalContent from "@/components/LexicalContent";

type Props = {
  params: Promise<{ siteSlug: string }>;
};

export const metadata: Metadata = {
  title: "Impressum",
};

export default async function ImpressumPage({ params }: Props) {
  const { siteSlug } = await params;
  const page = await getPageBySlug("impressum", siteSlug);

  if (!page) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{page.title}</h1>
      <div className="prose prose-gray max-w-none">
        <LexicalContent data={page.content} />
      </div>
    </div>
  );
}
