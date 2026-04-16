import { Image } from "@/components/Image";
import Link from "next/link";

type HeroSectionProps = {
  title: string;
  subline: string;
  style: "minimal" | "image" | "gradient";
  image: string | null;
  imageAlt: string;
  ctaText: string;
  ctaLink: string;
};

function CtaButton({
  text,
  href,
  variant,
}: {
  text: string;
  href: string;
  variant: "solid" | "white";
}) {
  const className =
    variant === "white"
      ? "inline-block mt-6 px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
      : "inline-block mt-6 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors";

  return (
    <Link href={href} className={className}>
      {text}
    </Link>
  );
}

function HeroMinimal({ title, subline, ctaText, ctaLink }: HeroSectionProps) {
  return (
    <div className="bg-primary-50 rounded-2xl px-6 py-16 sm:px-12 sm:py-20 text-center mb-12">
      <h1 className="text-[1.625rem] sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
        {title}
      </h1>
      {subline && (
        <p className="mt-4 text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
          {subline}
        </p>
      )}
      {ctaText && ctaLink && (
        <CtaButton text={ctaText} href={ctaLink} variant="solid" />
      )}
    </div>
  );
}

function HeroImage({
  title,
  subline,
  image,
  imageAlt,
  ctaText,
  ctaLink,
}: HeroSectionProps) {
  return (
    <div className="relative rounded-2xl overflow-hidden mb-12">
      {image ? (
        <div className="relative aspect-[5/2] min-h-[320px]">
          <Image
            src={image}
            alt={imageAlt || title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 1152px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
        </div>
      ) : (
        <div className="aspect-[5/2] min-h-[320px] bg-gray-800" />
      )}
      <div className="absolute inset-0 flex items-end p-6 sm:p-10 lg:p-14">
        <div className="max-w-2xl">
          <h1 className="text-[1.625rem] sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            {title}
          </h1>
          {subline && (
            <p className="mt-3 text-lg sm:text-xl text-white/80">
              {subline}
            </p>
          )}
          {ctaText && ctaLink && (
            <CtaButton text={ctaText} href={ctaLink} variant="white" />
          )}
        </div>
      </div>
    </div>
  );
}

function HeroGradient({
  title,
  subline,
  image,
  imageAlt,
  ctaText,
  ctaLink,
}: HeroSectionProps) {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary-600 to-primary-700 mb-12">
      <div className="flex flex-col lg:flex-row items-center">
        <div className="flex-1 px-6 py-12 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
          <h1 className="text-[1.625rem] sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            {title}
          </h1>
          {subline && (
            <p className="mt-4 text-lg sm:text-xl text-white/80 max-w-xl">
              {subline}
            </p>
          )}
          {ctaText && ctaLink && (
            <CtaButton text={ctaText} href={ctaLink} variant="white" />
          )}
        </div>
        {image && (
          <div className="relative w-full lg:w-1/2 aspect-[4/3] lg:aspect-auto lg:self-stretch shrink-0">
            <Image
              src={image}
              alt={imageAlt || title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 576px"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function HeroSection(props: HeroSectionProps) {
  switch (props.style) {
    case "image":
      return <HeroImage {...props} />;
    case "gradient":
      return <HeroGradient {...props} />;
    default:
      return <HeroMinimal {...props} />;
  }
}
