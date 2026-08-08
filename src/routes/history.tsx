import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { server } from "@/api/client";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import type { PullRecord, Banner, Character } from "@memoria/shared";
import { EntityImage } from "@/components/ui/entity-image";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
});

function HistoryPage() {
  const [search, setSearch] = useState("");
  const [bannerFilter, setBannerFilter] = useState("all");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 20;

  // Fetch banners for the filter dropdown
  const { data: banners } = useQuery<Banner[]>({
    queryKey: ["banners-list"],
    queryFn: async () => {
      const res = await server.api.banners.get();
      if (res.error) throw new Error(res.error.value as string);
      return res.data as Banner[];
    },
  });

  // Fetch characters to resolve pull images by name
  const { data: characters } = useQuery<Character[]>({
    queryKey: ["characters-all"],
    queryFn: async () => {
      const res = await server.api.characters.get();
      if (res.error) throw new Error(res.error.value as string);
      return res.data as Character[];
    },
  });

  const charImageByName = new Map(
    (characters ?? []).map((c) => [c.name, c.imageUrl])
  );

  // Fetch summons
  const { data: result, isLoading } = useQuery<{
    data: PullRecord[];
    total: number;
    page: number;
    limit: number;
  }>({
    queryKey: ["summons", page, search, bannerFilter, rarityFilter],
    queryFn: async () => {
      const queryParams: Record<string, string> = {
        page: page.toString(),
        limit: limit.toString(),
      };
      if (search) queryParams.search = search;
      if (bannerFilter && bannerFilter !== "all") queryParams.banner = bannerFilter;
      if (rarityFilter && rarityFilter !== "all") queryParams.rarity = rarityFilter;

      const res = await server.api.summons.get({ query: queryParams });
      if (res.error) throw new Error(res.error.value.message);
      return res.data;
    },
  });

  const totalPages = result ? Math.ceil(result.total / limit) : 0;

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Summon History</h2>
        <p className="text-muted-foreground mt-1">Search, sort, and analyze your permanent gacha logs.</p>
      </div>

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
                {banners?.map((b) => (
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
            {result ? `${result.total} records found` : "Loading..."}
          </div>
        </div>
      </Card>

      {/* Summons Table */}
      <Card className="shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : result && result.data.length > 0 ? (
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
                {result.data.map((pull) => (
                  <TableRow key={pull.id}>
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
                  Page {page} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
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
            No summon records matching criteria.
          </div>
        )}
      </Card>
    </div>
  );
}
