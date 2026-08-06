import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { Download, Copy, Check } from "lucide-react";

export function BuildingQRCode({ id, name }: { id: string; name: string }) {
  const url = typeof window !== "undefined" ? `${window.location.origin}/buildings/${id}` : `/buildings/${id}`;
  const [copied, setCopied] = useState(false);

  const download = () => {
    const svg = document.getElementById(`qr-${id}`);
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([xml], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `campus-compass-${id}.svg`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <h3 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        Share via QR
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">Scan to open {name} on any phone.</p>
      <div className="mt-3 grid place-items-center rounded-xl bg-white p-4">
        <QRCodeSVG id={`qr-${id}`} value={url} size={160} level="M" includeMargin={false} />
      </div>
      <div className="mt-3 flex gap-2">
        <button onClick={download} className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-border px-3 py-2 text-xs hover:bg-secondary">
          <Download className="h-3.5 w-3.5" /> Download
        </button>
        <button onClick={copy} className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg border border-border px-3 py-2 text-xs hover:bg-secondary">
          {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
