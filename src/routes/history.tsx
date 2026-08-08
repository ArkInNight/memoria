import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search, ChevronLeft, ChevronRight, UserPlus, PlusCircle } from "lucide-react";
import type { PullRecord } from "@memoria/shared";
import { EntityImage } from "@/components/ui/entity-image";
import { CHARACTERS, getAggregatedBanners } from "@/lib/domain/assets";
import { useActiveProfile } from "@/lib/store/profiles";
import { usePullRecords } from "@/lib/store/summons";
import { ManualSummonDialog } from "@/features/history/manual-summon-dialog";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
});

const getRarityBadge = (rarity: number) => {
  switch (rarity) {
    case 6:
      return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">6★</Badge>;
    case 5:
      return <Badge className="bg-purple-600 hover:bg-purple-700 text-white font-semibold">5★</Badge>;
    case 4:
      return <Badge variant="secondary" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold">4★</Badge>;
    default:
      return <Badge variant="outline">{rarity}★</Badge>;
  }
};

const getRateOnBadge = (rateOn: boolean | null) => {
  if (rateOn === true) {
    return <Badge className="bg-emerald-600 text-white text-xs">Rate ON</Badge>;
  }
  if (rateOn === false) {
    return <Badge variant="destructive" className="text-xs">Rate OFF</Badge>;
  }
  return <span className="text-muted-foreground">-</span>;
};

const getGuaranteeBadge = (guaranteed: boolean | null, rarity: number) => {
  if (rarity !== 6) return <span className="text-muted-foreground">-</span>;
  if (guaranteed === true) {
    return <Badge className="bg-cyan-600 text-white text-xs">Guaranteed</Badge>;
  }
  return <Badge variant="outline" className="text-xs">50/50</Badge>;
};

function HistoryPage() {
  const profile = useActiveProfile();
  const allPulls = usePullRecords(profile?.id);

  const [search, setSearch] = useState("");
  const [bannerFilter, setBannerFilter] = useState("all");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [manualOpen, setManualOpen] = useState(false);
  const limit = 20;

  const banners = useMemo(() => getAggregatedBanners(), []);
  const charImageByName = useMemo(
    () => new Map(CHARACTERS.map((c) => [c.name, c.imageUrl])),
    []
  );

  const filtered = useMemo(() => {
    let rows = [...allPulls];
    if (search) {
      const q = search.toLowerCase();
      rows = rows.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (bannerFilter !== "all") {
      rows = rows.filter((p) => p.poolName === bannerFilter);
    }
    if (rarityFilter !== "all") {
      rows = rows.filter((p) => p.rarity === parseInt(rarityFilter));
    }
    rows.sort((a, b) => b.createTime.localeCompare(a.createTime));
    return rows;
  }, [allPulls, search, bannerFilter, rarityFilter]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const pageData: PullRecord[] = filtered.slice((safePage - 1) * limit, safePage * limit);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  if (!profile) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Summon History</h2>
          <p className="text-muted-foreground mt-1">Search, sort, and analyze your permanent gacha logs.</p>
        </div>
        <Card className="p-12 text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            <UserPlus className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Belum ada profile</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
              Riwayat summon disimpan per profile. Buat profile dulu untuk melihat data.
            </p>
          </div>
          <Button asChild>
            <Link to="/profiles">Buat Profile</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Summon History</h2>
          <p className="text-muted-foreground mt-1">Search, sort, and analyze your permanent gacha logs.</p>
        </div>
        <Button onClick={() => setManualOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Manual
        </Button>
      </div>

      <ManualSummonDialog profile={profile} open={manualOpen} onOpenChange={setManualOpen} />

      {/* Filters Card */}
      <Card className="p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search character name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>

          <div>
            <Select
              value={bannerFilter}
              onValueChange={(val) => {
                setBannerFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Banners" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Banners</SelectItem>
                {banners.map((b) => (
                  <SelectItem key={b.name} value={b.name}>
                    {b.name} {b.version ? `(${b.version})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select
              value={rarityFilter}
              onValueChange={(val) => {
                setRarityFilter(val);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Rarities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rarities</SelectItem>
                <SelectItem value="6">6★ Rarity</SelectItem>
                <SelectItem value="5">5★ Rarity</SelectItem>
                <SelectItem value="4">4★ Rarity</SelectItem>
                <SelectItem value="3">3★ Rarity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-end text-sm text-muted-foreground font-medium">
            {`${total} records found`}
          </div>
        </div>
      </Card>

      {/* Summons Table */}
      <Card className="shadow-sm overflow-hidden">
        {pageData.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time</TableHead>
                  <TableHead>Banner</TableHead>
                  <TableHead>Character</TableHead>
                  <TableHead>Rarity</TableHead>
                  <TableHead>Pull Type</TableHead>
                  <TableHead className="text-center">Pity</TableHead>
                  <TableHead className="text-center">Rate ON/OFF</TableHead>
                  <TableHead className="text-center">Guarantee State</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageData.map((pull) => (
                  <TableRow key={`${profile.id}-${pull.id}`}>
                    <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {pull.createTime.split(".")[0]}
                    </TableCell>
                    <TableCell className="font-medium">{pull.poolName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <EntityImage name={pull.name} imageUrl={charImageByName.get(pull.name)} rarity={pull.rarity} className="h-9 w-9 rounded-full shrink-0" />
                        <span className="font-semibold text-primary">{pull.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getRarityBadge(pull.rarity)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{pull.summonType === "10" ? "10-pull" : "Single"}</Badge>
                    </TableCell>
                    <TableCell className="text-center font-mono font-bold">
                      {pull.rarity === 6 ? (
                        <span className="text-yellow-500 font-extrabold">{pull.pity}</span>
                      ) : pull.rarity === 5 ? (
                        <span className="text-purple-500 font-bold">{pull.pity}</span>
                      ) : (
                        <span className="text-muted-foreground font-normal">{pull.pity}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">{getRateOnBadge(pull.rateOn)}</TableCell>
                    <TableCell className="text-center">{getGuaranteeBadge(pull.guaranteed, pull.rarity)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-border bg-card">
                <div className="text-xs text-muted-foreground">
                  Page {safePage} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(safePage - 1)}
                    disabled={safePage === 1}
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(safePage + 1)}
                    disabled={safePage === totalPages}
                  >
                    Next
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground">
            {allPulls.length === 0
              ? "Belum ada data summon di profile ini. Import dulu dari halaman Import."
              : "No summon records matching criteria."}
          </div>
        )}
      </Card>
    </div>
  );
}
