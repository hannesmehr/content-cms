import { NextResponse } from "next/server";
import {
  convertHTMLToLexical,
  editorConfigFactory,
} from "@payloadcms/richtext-lexical";
import { JSDOM } from "jsdom";
import { getPayload } from "payload";
import configPromise from "@payload-config";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { html } = await request.json();
    if (!html) {
      return NextResponse.json({ error: "html required" }, { status: 400 });
    }

    // Get the sanitized Payload config
    const payload = await getPayload({ config: configPromise });
    const sanitizedConfig = payload.config;

    const editorConfig = await editorConfigFactory.default({
      config: sanitizedConfig,
    });

    const lexicalJSON = convertHTMLToLexical({
      editorConfig,
      html,
      JSDOM,
    });

    return NextResponse.json({ lexical: lexicalJSON });
  } catch (error) {
    console.error("Convert HTML error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Conversion failed" },
      { status: 500 }
    );
  }
}
