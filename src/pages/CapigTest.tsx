import { useState } from "react";
import { getCookie, getFbc, getExternalId } from "@/lib/tracking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type ChannelResult = {
  status: "idle" | "ok" | "error";
  message: string;
  eventId: string;
};

type CapigResult = ChannelResult & {
  httpStatus?: number;
  responseBody?: string;
};

export default function CapigTest() {
  const [capigUrl, setCapigUrl] = useState("https://capig.stape.at/event");
  const [capigKey, setCapigKey] = useState(
    import.meta.env.VITE_CAPIG_KEY ?? ""
  );
  const [eventName, setEventName] = useState("PageView");
  const [contentName, setContentName] = useState("CAPIG Test — ERA Music");

  const [pixelResult, setPixelResult] = useState<ChannelResult>({
    status: "idle",
    message: "",
    eventId: "",
  });
  const [capigResult, setCapigResult] = useState<CapigResult>({
    status: "idle",
    message: "",
    eventId: "",
  });
  const [payloadSent, setPayloadSent] = useState<string>("");
  const [running, setRunning] = useState(false);
  const [payloadOpen, setPayloadOpen] = useState(false);

  const runTest = async () => {
    setRunning(true);
    const sharedEventId = crypto.randomUUID();

    // Channel 1: Meta Pixel
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq(
        "track",
        eventName,
        { content_name: contentName },
        { eventID: sharedEventId }
      );
      setPixelResult({
        status: "ok",
        message: "fbq detected and event fired successfully.",
        eventId: sharedEventId,
      });
    } else {
      setPixelResult({
        status: "error",
        message:
          "fbq not found. This is normal outside production or if the Meta Pixel script is not loaded.",
        eventId: sharedEventId,
      });
    }

    // Channel 2: CAPIG
    const payload = {
      data: [
        {
          event_name: eventName,
          event_id: sharedEventId,
          event_time: Math.floor(Date.now() / 1000),
          event_source_url: window.location.href,
          action_source: "website",
          user_data: {
            client_user_agent: navigator.userAgent,
            fbp: getCookie("_fbp"),
            fbc: getFbc(),
            external_id: getExternalId(),
          },
          custom_data: {
            content_name: contentName,
            content_category: "ERA Music Test",
          },
        },
      ],
    };

    setPayloadSent(JSON.stringify(payload, null, 2));

    try {
      const res = await fetch(capigUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "capig-api-key": capigKey,
        },
        body: JSON.stringify(payload),
      });

      const body = await res.text();
      let formattedBody = body;
      try {
        formattedBody = JSON.stringify(JSON.parse(body), null, 2);
      } catch {}

      setCapigResult({
        status: res.ok ? "ok" : "error",
        message: res.ok
          ? "CAPIG request succeeded."
          : `CAPIG returned HTTP ${res.status}.`,
        eventId: sharedEventId,
        httpStatus: res.status,
        responseBody: formattedBody,
      });
    } catch (e: any) {
      setCapigResult({
        status: "error",
        message: `Network error: ${e.message}`,
        eventId: sharedEventId,
        responseBody: e.message,
      });
    }

    setRunning(false);
  };

  const dedupOk =
    capigResult.status === "ok" &&
    pixelResult.eventId === capigResult.eventId &&
    pixelResult.eventId !== "";

  const StatusDot = ({ ok }: { ok: boolean }) => (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full mr-2 ${
        ok ? "bg-green-500" : "bg-red-500"
      }`}
    />
  );

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">CAPIG Double Check</h1>

      {/* Inputs */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">
            CAPIG URL
          </label>
          <Input
            value={capigUrl}
            onChange={(e) => setCapigUrl(e.target.value)}
            className="bg-secondary border-border"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">
            CAPIG API key
          </label>
          <Input
            value={capigKey}
            onChange={(e) => setCapigKey(e.target.value)}
            className="bg-secondary border-border"
            type="password"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">
            Event name
          </label>
          <Select value={eventName} onValueChange={setEventName}>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PageView">PageView</SelectItem>
              <SelectItem value="ViewContent">ViewContent</SelectItem>
              <SelectItem value="Lead">Lead</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">
            content_name
          </label>
          <Input
            value={contentName}
            onChange={(e) => setContentName(e.target.value)}
            className="bg-secondary border-border"
          />
        </div>
      </div>

      <Button
        onClick={runTest}
        disabled={running}
        className="mb-8 w-full md:w-auto"
      >
        {running ? "Running…" : "Run double check"}
      </Button>

      {/* Results */}
      {pixelResult.eventId && (
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {/* Card 1: Meta Pixel */}
          <Card className="bg-secondary border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <StatusDot ok={pixelResult.status === "ok"} />
                Meta Pixel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {pixelResult.message}
              </p>
              <p className="text-xs font-mono text-muted-foreground break-all">
                event_id: {pixelResult.eventId}
              </p>
            </CardContent>
          </Card>

          {/* Card 2: CAPIG */}
          <Card className="bg-secondary border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <StatusDot ok={capigResult.status === "ok"} />
                CAPIG Server-side
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {capigResult.message}
              </p>
              {capigResult.httpStatus && (
                <p className="text-xs text-muted-foreground">
                  HTTP {capigResult.httpStatus}
                </p>
              )}
              {capigResult.responseBody && (
                <pre className="text-xs font-mono bg-muted p-2 rounded overflow-auto max-h-32">
                  {capigResult.responseBody}
                </pre>
              )}
              <p className="text-xs font-mono text-muted-foreground break-all">
                event_id: {capigResult.eventId}
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Deduplication */}
          <Card className="bg-secondary border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <StatusDot ok={dedupOk} />
                Deduplication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {dedupOk
                  ? "✓ Both channels share the same event_id. Meta will count one event only."
                  : "✗ Server-side failed — deduplication cannot work. Fix CAPIG first."}
              </p>
              <p className="text-xs font-mono text-muted-foreground break-all">
                shared event_id: {pixelResult.eventId}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payload inspector */}
      {payloadSent && (
        <Collapsible open={payloadOpen} onOpenChange={setPayloadOpen}>
          <CollapsibleTrigger className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            {payloadOpen ? "▾" : "▸"} Payload sent
          </CollapsibleTrigger>
          <CollapsibleContent>
            <pre className="mt-2 text-xs font-mono bg-secondary border border-border p-4 rounded overflow-auto max-h-96">
              {payloadSent}
            </pre>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
