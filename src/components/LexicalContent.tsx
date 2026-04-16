import type {
  DefaultNodeTypes,
  SerializedBlockNode,
} from "@payloadcms/richtext-lexical";
import {
  type JSXConvertersFunction,
  RichText as PayloadRichText,
} from "@payloadcms/richtext-lexical/react";

// -- Block field types (matching the Block definitions in lexical/) --

type AffiliateBoxFields = {
  blockType: "affiliateBox";
  title: string;
  description?: string;
  slug?: string;
  linkUrl?: string;
  linkText?: string;
};

type FigureFields = {
  blockType: "figure";
  src: string;
  alt?: string;
  caption?: string;
};

type InlineAdFields = {
  blockType: "inlineAd";
  adConfig?: string;
};

type AffiliateLinkFields = {
  blockType: "affiliateLink";
  text: string;
  linkUrl?: string;
  slug?: string;
};

type ObfuscatedEmailFields = {
  blockType: "obfuscatedEmail";
  user: string;
  domain: string;
};

type BlockFields =
  | AffiliateBoxFields
  | FigureFields
  | InlineAdFields;

type InlineBlockFields =
  | AffiliateLinkFields
  | ObfuscatedEmailFields;

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<BlockFields | InlineBlockFields>;

// -- Block renderers --

function AffiliateBoxRenderer({ title, description, linkUrl, linkText }: AffiliateBoxFields) {
  // Hide boxes with EXAMPLE placeholder URLs
  if (!linkUrl || linkUrl.includes("/dp/EXAMPLE")) {
    return null;
  }

  return (
    <div className="not-prose my-6 rounded-xl border border-gray-200 bg-gray-50 p-5">
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
        Anzeige
      </div>
      <div className="text-base font-semibold text-gray-900">{title}</div>
      {description && (
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      )}
      {linkUrl && (
        <a
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer nofollow sponsored"
          className="mt-3 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          {linkText || "Jetzt ansehen"}
        </a>
      )}
    </div>
  );
}

function FigureRenderer({ src, alt, caption }: FigureFields) {
  const isExternal = src.startsWith("http");

  return (
    <figure className="my-6">
      <div className="relative aspect-video overflow-hidden rounded-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={isExternal ? src : src}
          alt={alt || ""}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-sm italic text-gray-500">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

function InlineAdRenderer(_props: InlineAdFields) {
  // Placeholder — actual ad rendering depends on site config
  return (
    <div className="my-6 flex items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-xs text-gray-400">
      Werbefläche
    </div>
  );
}

function AffiliateLinkRenderer({ text, linkUrl }: AffiliateLinkFields) {
  if (!linkUrl || linkUrl.includes("/dp/EXAMPLE")) {
    return <span>{text}</span>;
  }

  return (
    <a
      href={linkUrl}
      target="_blank"
      rel="noopener noreferrer nofollow sponsored"
      className="text-inherit underline decoration-dotted underline-offset-2"
    >
      {text}
      <sup className="text-[10px] text-gray-400 no-underline">*</sup>
    </a>
  );
}

function ObfuscatedEmailRenderer({ user, domain }: ObfuscatedEmailFields) {
  // Server-side: render obfuscated version, client hydrates with click handler
  return (
    <span className="cursor-pointer text-indigo-600 hover:underline">
      {user}(at){domain}
    </span>
  );
}

// -- JSX Converters --

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({
  defaultConverters,
}) => ({
  ...defaultConverters,
  blocks: {
    affiliateBox: ({ node }) => (
      <AffiliateBoxRenderer {...(node.fields as AffiliateBoxFields)} />
    ),
    figure: ({ node }) => (
      <FigureRenderer {...(node.fields as FigureFields)} />
    ),
    inlineAd: ({ node }) => (
      <InlineAdRenderer {...(node.fields as InlineAdFields)} />
    ),
  },
  inlineBlocks: {
    affiliateLink: ({ node }: { node: { fields: AffiliateLinkFields } }) => (
      <AffiliateLinkRenderer {...node.fields} />
    ),
    obfuscatedEmail: ({ node }: { node: { fields: ObfuscatedEmailFields } }) => (
      <ObfuscatedEmailRenderer {...node.fields} />
    ),
  },
});

// -- Public component --

type LexicalContentProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  className?: string;
  enableAds?: boolean;
  enableAffiliates?: boolean;
};

export default function LexicalContent({
  data,
  className,
}: LexicalContentProps) {
  if (!data) return null;

  return (
    <PayloadRichText
      data={data}
      converters={jsxConverters}
      className={className}
    />
  );
}
