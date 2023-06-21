import type { JSXElement } from "solid-js";
import { Portal } from "solid-js/web";

let newDocs: Document | { body: any };

try {
  newDocs = globalThis.document;
} catch {
  newDocs = {
    body: <div></div>,
  };
}

export default function PortalBody({ children }: { children: JSXElement }) {
  return <Portal mount={newDocs.body}>{children}</Portal>;
}
