import {
  Node,
  DOMParser as PmDomParser,
  DOMSerializer as PmDomSerializer,
  Schema,
} from "@tiptap/pm/model";
import { VHTMLDocument, createHTMLDocument, vdom } from "zeed-dom";

export const generateDocFromHtml = (
  html: string = "",
  schema: Schema,
): Node => {
  try {
    let doc: Document;
    if (typeof window !== "undefined") {
      const nativeDomParser = new DOMParser();
      doc = nativeDomParser.parseFromString(html, "text/html");
    } else {
      // If we are running in a non-browser environment (node, etc),
      // we can use zeed-dom
      doc = vdom(html) as unknown as Document;
    }

    return PmDomParser.fromSchema(schema).parse(doc);
  } catch (error) {
    console.error("Error parsing html", error);
    throw error;
  }
};

export const generateHtmlFromDoc = (doc: Node, schema: Schema): string => {
  /**
   * Since Prosemirror's DomSerializer does not have a way to serialize to raw html strings,
   * we first convert to a document (dom) and then serialize using zeed-dom.render()
   */
  const serializer = (d: Node) =>
    PmDomSerializer.fromSchema(schema).serializeFragment(d.content, {
      document: createHTMLDocument() as unknown as Document,
    }) as unknown as VHTMLDocument;

  try {
    const zeedDom = serializer(doc);
    return zeedDom.render();
  } catch (error) {
    throw error;
  }
};
