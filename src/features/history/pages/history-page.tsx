import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search, ChevronLeft, ChevronRight, UserPlus, PlusCircle } from "lucide-react";
import type { PullRecord } from "@/lib/shared";
import { EntityImage } from "@/components/ui/entity-image";
import { CHARACTERS, getAggregatedBanners } from "@/lib/domain/assets";
import { useActiveProfile } from "@/lib/store/profiles";
import { usePullRecords } from "@/lib/store/summons";
import { YStack, XStack } from "@/components/layout/stack";
import { Grid } from "@/components/layout/grid";
import { Text } from "@/components/typography";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Empty, EmptyContent } from "@/components/ui/empty";
import { ManualSummonDialog } from "../manual-summon-dialog";

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
  return <Text variant="muted">-</Text>;
};

const getGuaranteeBadge = (guaranteed: boolean | null, rarity: number) => {
  if (rarity !== 6) return <Text variant="muted">-</Text>;
  if (guaranteed === true) {
    return <Badge className="bg-cyan-600 text-white text-xs">Guaranteed</Badge>;
  }
  return <Badge variant="outline" className="text-xs">50/50</Badge>;
};

export function HistoryPage() {
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
      <YStack gap={24}>
        <PageHeader
          title="Summon History"
          description="Search, sort, and analyze your permanent gacha logs."
        />
        <EmptyState
          icon={<UserPlus className="h-7 w-7 text-primary" />}
          title="Belum ada profile"
          description="Riwayat summon disimpan per profile. Buat profile dulu untuk melihat data."
          action={
            <Button asChild>
              <Link to="/profiles">Buat Profile</Link>
            </Button>
          }
        />
      </YStack>
    );
  }

  return (
    <YStack gap={24}>
      <PageHeader
        title="Summon History"
        description="Search, sort, and analyze your permanent gacha logs."
      >
        <Button onClick={() => setManualOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Manual
        </Button>
      </PageHeader>

      <ManualSummonDialog profile={profile} open={manualOpen} onOpenChange={setManualOpen} />

      {/* Filters Card */}
      <Card className="p-4 shadow-sm">
        <Grid md={4} gap={16}>
          <YStack gap={0} className="relative">
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
          </YStack>

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

          <XStack gap={8} className="justify-end text-sm text-muted-foreground font-medium">
            <Text size="sm" variant="muted" weight="medium">
              {`${total} records found`}
            </Text>
          </XStack>
        </Grid>
      </Card>

      {/* Summons Table */}
      <Card className="shadow-sm overflow-hidden">
        {pageData.length > 0 ? (
          <YStack gap={0} className="overflow-x-auto">
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
                      <XStack gap={10} className="flex-row items-center">
                        <EntityImage name={pull.name} imageUrl={charImageByName.get(pull.name)} rarity={pull.rarity} className="h-9 w-9 rounded-full shrink-0" />
                        <Text weight="semibold" variant="primary">
                          {pull.name}
                        </Text>
                      </XStack>
                    </TableCell>
                    <TableCell>{getRarityBadge(pull.rarity)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{pull.summonType === "10" ? "10-pull" : "Single"}</Badge>
                    </TableCell>
                    <TableCell className="text-center font-mono font-bold">
                      {pull.rarity === 6 ? (
                        <Text variant="yellow" weight="extrabold" className="font-mono">
                          {pull.pity}
                        </Text>
                      ) : pull.rarity === 5 ? (
                        <Text variant="purple" weight="bold" className="font-mono">
                          {pull.pity}
                        </Text>
                      ) : (
                        <Text variant="muted" weight="normal" className="font-mono">
                          {pull.pity}
                        </Text>
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
              <XStack gap={8} className="justify-between p-4 border-t border-border bg-card">
                <Text size="xs" variant="muted">
                  Page {safePage} of {totalPages}
                </Text>
                <XStack gap={8}>
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
                </XStack>
              </XStack>
            )}
          </YStack>
        ) : (
          <Empty className="border-0 p-12">
            <EmptyContent>
              <Text variant="muted">
                {allPulls.length === 0
                  ? "Belum ada data summon di profile ini. Import dulu dari halaman Import."
                  : "No summon records matching criteria."}
              </Text>
            </EmptyContent>
          </Empty>
        )}
      </Card>
    </YStack>
  );
}
