import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { releases } from "@/config/releases";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";

// Map slug → release info
const releaseMap = Object.fromEntries(
  releases.map((r) => [`/${r.slug}`, r])
);

const uniqueArtists = [...new Set(releases.map((r) => r.artist))];

type ClickRow = { dsp_name: string | null; page_path: string; created_at: string };
type TimeRow = { created_at: string; event_type: string };

const COLORS = ["#fff", "#aaa", "#888", "#666", "#555"];

export default function Analytics() {
  const [artist, setArtist] = useState("all");
  const [release, setRelease] = useState("all");
  const [period, setPeriod] = useState("all");

  const [viewCount, setViewCount] = useState(0);
  const [clickData, setClickData] = useState<ClickRow[]>([]);
  const [timeData, setTimeData] = useState<TimeRow[]>([]);
  const [loading, setLoading] = useState(true);

  const filteredReleases = useMemo(
    () =>
      artist === "all"
        ? releases
        : releases.filter((r) => r.artist === artist),
    [artist]
  );

  const artistSlugs = useMemo(
    () => filteredReleases.map((r) => `/${r.slug}`),
    [filteredReleases]
  );

  const cutoffISO = useMemo(() => {
    if (period === "all") return null;
    const d = new Date();
    d.setDate(d.getDate() - (period === "7" ? 7 : 30));
    return d.toISOString();
  }, [period]);

  const fetchData = useCallback(async () => {
    setLoading(true);

    // Build filter helper
    const applyFilters = (q: any) => {
      if (release !== "all") {
        q = q.eq("page_path", `/${release}`);
      } else if (artist !== "all") {
        q = q.in("page_path", artistSlugs);
      }
      if (cutoffISO) {
        q = q.gte("created_at", cutoffISO);
      }
      return q;
    };

    // Views count
    const { count } = await applyFilters(
      supabase
        .from("dsp_events")
        .select("*", { count: "exact", head: true })
        .eq("event_type", "view")
    );

    // Click data
    const { data: clicks } = await applyFilters(
      supabase
        .from("dsp_events")
        .select("dsp_name, page_path, created_at")
        .eq("event_type", "click")
    );

    // Time series
    const { data: time } = await applyFilters(
      supabase
        .from("dsp_events")
        .select("created_at, event_type")
    );

    setViewCount(count ?? 0);
    setClickData((clicks as ClickRow[]) ?? []);
    setTimeData((time as TimeRow[]) ?? []);
    setLoading(false);
  }, [artist, release, cutoffISO, artistSlugs]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset release when artist changes
  useEffect(() => {
    setRelease("all");
  }, [artist]);

  // Computed values
  const clickCount = clickData.length;
  const ctr = viewCount > 0 ? ((clickCount / viewCount) * 100).toFixed(1) : "0.0";

  const topDsp = useMemo(() => {
    const counts: Record<string, number> = {};
    clickData.forEach((c) => {
      if (c.dsp_name) counts[c.dsp_name] = (counts[c.dsp_name] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] ?? "—";
  }, [clickData]);

  // Chart: time series
  const timeSeriesData = useMemo(() => {
    const days: Record<string, { views: number; clicks: number }> = {};
    timeData.forEach((r) => {
      const day = r.created_at.slice(0, 10);
      if (!days[day]) days[day] = { views: 0, clicks: 0 };
      if (r.event_type === "view") days[day].views++;
      else if (r.event_type === "click") days[day].clicks++;
    });
    return Object.entries(days)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, d]) => ({ date, ...d }));
  }, [timeData]);

  // Chart: clicks by DSP
  const dspChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    clickData.forEach((c) => {
      if (c.dsp_name) counts[c.dsp_name] = (counts[c.dsp_name] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name, clicks]) => ({ name, clicks }));
  }, [clickData]);

  // Chart: views by release (top 5)
  const viewsByRelease = useMemo(() => {
    const counts: Record<string, number> = {};
    timeData.forEach((r) => {
      if (r.event_type === "view") {
        const label =
          releaseMap[r.created_at]?.title ??
          r.created_at; // fallback — we need page_path
        counts[label] = (counts[label] || 0) + 1;
      }
    });
    // Actually we need page_path for this — let's recount from the full timeData
    // But timeData only has created_at & event_type. We need a separate approach.
    return [];
  }, [timeData]);

  // For views by release we need page_path — use clickData views from a separate query
  // Actually let's derive from the raw time data. We should fetch page_path too.
  // Let me fix: we'll do a separate calculation using an additional fetch.

  const [viewsByReleaseFetch, setViewsByReleaseFetch] = useState<
    { name: string; views: number }[]
  >([]);

  useEffect(() => {
    const fetchViewsByRelease = async () => {
      const applyFilters = (q: any) => {
        if (release !== "all") {
          q = q.eq("page_path", `/${release}`);
        } else if (artist !== "all") {
          q = q.in("page_path", artistSlugs);
        }
        if (cutoffISO) {
          q = q.gte("created_at", cutoffISO);
        }
        return q;
      };

      const { data } = await applyFilters(
        supabase
          .from("dsp_events")
          .select("page_path")
          .eq("event_type", "view")
      );

      if (!data) return;
      const counts: Record<string, number> = {};
      (data as { page_path: string }[]).forEach((r) => {
        counts[r.page_path] = (counts[r.page_path] || 0) + 1;
      });
      const sorted = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([path, views]) => ({
          name: releaseMap[path]
            ? `${releaseMap[path].artist} – ${releaseMap[path].title}`
            : path,
          views,
        }));
      setViewsByReleaseFetch(sorted);
    };
    fetchViewsByRelease();
  }, [artist, release, cutoffISO, artistSlugs]);

  // Tables: by artist
  const byArtistData = useMemo(() => {
    // We need views per artist — we don't have page_path in timeData.
    // We'll compute from clickData (which has page_path) + viewsByReleaseFetch
    // Actually let's build from viewsByReleaseFetch for views and clickData for clicks
    const artistViews: Record<string, number> = {};
    const artistClicks: Record<string, number> = {};
    const artistTopRelease: Record<string, { title: string; views: number }> = {};

    // Derive from viewsByReleaseFetch — but it's top 5 only. Let's compute separately.
    return [];
  }, []);

  // We need full data for tables — let me fetch page_path for views too
  const [allViewData, setAllViewData] = useState<{ page_path: string }[]>([]);

  useEffect(() => {
    const fetchAllViews = async () => {
      const applyFilters = (q: any) => {
        if (release !== "all") {
          q = q.eq("page_path", `/${release}`);
        } else if (artist !== "all") {
          q = q.in("page_path", artistSlugs);
        }
        if (cutoffISO) {
          q = q.gte("created_at", cutoffISO);
        }
        return q;
      };
      const { data } = await applyFilters(
        supabase
          .from("dsp_events")
          .select("page_path")
          .eq("event_type", "view")
      );
      setAllViewData((data as { page_path: string }[]) ?? []);
    };
    fetchAllViews();
  }, [artist, release, cutoffISO, artistSlugs]);

  // By artist table
  const byArtistTable = useMemo(() => {
    const map: Record<
      string,
      { views: number; clicks: number; topRelease: string; topViews: number }
    > = {};

    allViewData.forEach((r) => {
      const rel = releaseMap[r.page_path];
      const a = rel?.artist ?? "Unknown";
      if (!map[a]) map[a] = { views: 0, clicks: 0, topRelease: "", topViews: 0 };
      map[a].views++;
    });

    clickData.forEach((r) => {
      const rel = releaseMap[r.page_path];
      const a = rel?.artist ?? "Unknown";
      if (!map[a]) map[a] = { views: 0, clicks: 0, topRelease: "", topViews: 0 };
      map[a].clicks++;
    });

    // Top release per artist
    const releaseViews: Record<string, Record<string, number>> = {};
    allViewData.forEach((r) => {
      const rel = releaseMap[r.page_path];
      const a = rel?.artist ?? "Unknown";
      const t = rel?.title ?? r.page_path;
      if (!releaseViews[a]) releaseViews[a] = {};
      releaseViews[a][t] = (releaseViews[a][t] || 0) + 1;
    });

    Object.entries(releaseViews).forEach(([a, rels]) => {
      const top = Object.entries(rels).sort((x, y) => y[1] - x[1])[0];
      if (top && map[a]) {
        map[a].topRelease = top[0];
        map[a].topViews = top[1];
      }
    });

    return Object.entries(map)
      .sort((a, b) => b[1].views - a[1].views)
      .map(([artist, d]) => ({
        artist,
        views: d.views,
        clicks: d.clicks,
        ctr: d.views > 0 ? ((d.clicks / d.views) * 100).toFixed(1) : "0.0",
        topRelease: d.topRelease || "—",
      }));
  }, [allViewData, clickData]);

  // By release table
  const byReleaseTable = useMemo(() => {
    const viewCounts: Record<string, number> = {};
    const clickCounts: Record<string, number> = {};

    allViewData.forEach((r) => {
      viewCounts[r.page_path] = (viewCounts[r.page_path] || 0) + 1;
    });
    clickData.forEach((r) => {
      clickCounts[r.page_path] = (clickCounts[r.page_path] || 0) + 1;
    });

    const allPaths = new Set([
      ...Object.keys(viewCounts),
      ...Object.keys(clickCounts),
    ]);

    const rows = [...allPaths].map((path) => {
      const rel = releaseMap[path];
      const v = viewCounts[path] || 0;
      const c = clickCounts[path] || 0;
      return {
        path,
        release: rel ? `${rel.artist} – ${rel.title}` : path,
        artist: rel?.artist ?? "Unknown",
        fullUrl: `link.eramusic.fr${path}`,
        views: v,
        clicks: c,
        ctr: v > 0 ? ((c / v) * 100).toFixed(1) : "0.0",
      };
    });

    return rows.sort((a, b) => b.views - a.views);
  }, [allViewData, clickData]);

  const maxViews = useMemo(
    () => Math.max(...byReleaseTable.map((r) => r.views), 1),
    [byReleaseTable]
  );

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Select value={artist} onValueChange={setArtist}>
          <SelectTrigger className="w-[180px] bg-secondary border-border">
            <SelectValue placeholder="All artists" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All artists</SelectItem>
            {uniqueArtists.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={release} onValueChange={setRelease}>
          <SelectTrigger className="w-[220px] bg-secondary border-border">
            <SelectValue placeholder="All releases" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All releases</SelectItem>
            {filteredReleases.map((r) => (
              <SelectItem key={r.slug} value={r.slug}>
                {r.artist} – {r.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[160px] bg-secondary border-border">
            <SelectValue placeholder="All time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All time</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="7">Last 7 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-secondary border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground font-normal">
                  Page views
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{viewCount.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="bg-secondary border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground font-normal">
                  DSP clicks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{clickCount.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="bg-secondary border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground font-normal">
                  CTR
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{ctr}%</p>
              </CardContent>
            </Card>
            <Card className="bg-secondary border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground font-normal">
                  Top DSP
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold truncate">{topDsp}</p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Line chart: views & clicks over time */}
            <Card className="bg-secondary border-border">
              <CardHeader>
                <CardTitle className="text-sm">Views & Clicks over time</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 20%)" />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(0 0% 60%)"
                      fontSize={11}
                      tickFormatter={(v: string) => v.slice(5)}
                    />
                    <YAxis stroke="hsl(0 0% 60%)" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(0 0% 10%)",
                        border: "1px solid hsl(0 0% 20%)",
                        borderRadius: 4,
                        color: "#fff",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="views"
                      stroke="#fff"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="clicks"
                      stroke="#888"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bar chart: clicks by DSP */}
            <Card className="bg-secondary border-border">
              <CardHeader>
                <CardTitle className="text-sm">Clicks by DSP</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dspChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 20%)" />
                    <XAxis dataKey="name" stroke="hsl(0 0% 60%)" fontSize={11} />
                    <YAxis stroke="hsl(0 0% 60%)" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(0 0% 10%)",
                        border: "1px solid hsl(0 0% 20%)",
                        borderRadius: 4,
                        color: "#fff",
                      }}
                    />
                    <Bar dataKey="clicks" radius={[4, 4, 0, 0]}>
                      {dspChartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Horizontal bar: views by release (top 5) */}
          <Card className="bg-secondary border-border mb-8">
            <CardHeader>
              <CardTitle className="text-sm">Top 5 releases by views</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={viewsByReleaseFetch} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 20%)" />
                  <XAxis type="number" stroke="hsl(0 0% 60%)" fontSize={11} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="hsl(0 0% 60%)"
                    fontSize={11}
                    width={160}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(0 0% 10%)",
                      border: "1px solid hsl(0 0% 20%)",
                      borderRadius: 4,
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="views" fill="#fff" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* By artist table */}
          <Card className="bg-secondary border-border mb-8">
            <CardHeader>
              <CardTitle className="text-sm">By artist</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead>Artist</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="text-right">CTR</TableHead>
                    <TableHead>Top release</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byArtistTable.map((row) => (
                    <TableRow key={row.artist} className="border-border">
                      <TableCell className="font-medium">{row.artist}</TableCell>
                      <TableCell className="text-right">{row.views.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{row.clicks.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{row.ctr}%</TableCell>
                      <TableCell>{row.topRelease}</TableCell>
                    </TableRow>
                  ))}
                  {byArtistTable.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No data yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* By release table */}
          <Card className="bg-secondary border-border mb-8">
            <CardHeader>
              <CardTitle className="text-sm">By release / link</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead>Release</TableHead>
                    <TableHead>Artist</TableHead>
                    <TableHead>Full URL</TableHead>
                    <TableHead className="text-right">Views</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="text-right">CTR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byReleaseTable.map((row) => (
                    <TableRow key={row.path} className="border-border">
                      <TableCell className="font-medium">{row.release}</TableCell>
                      <TableCell>{row.artist}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {row.fullUrl}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-foreground rounded-full"
                              style={{
                                width: `${(row.views / maxViews) * 100}%`,
                              }}
                            />
                          </div>
                          {row.views.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{row.clicks.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{row.ctr}%</TableCell>
                    </TableRow>
                  ))}
                  {byReleaseTable.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No data yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
