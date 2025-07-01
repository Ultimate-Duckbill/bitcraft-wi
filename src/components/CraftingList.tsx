import React, { useState, useMemo } from "react";
import ItemCard, { ItemType } from "./ItemCard";
import CraftingTodo from "./CraftingTodo";
import { CraftingProvider } from "../context/CraftingContext";
import { withPrefix } from "gatsby";

// ビルド時にデータを埋め込む方式（シンプル）
const craftingDataRaw = require("../data/crafting_data.json");

// クラフトデータの型定義
type CraftingItem = {
  name: string;
  tier: number;
  rarity: number;
  icon: string;
  recipes: Array<{
    consumed_items: Array<{
      id: number;
      quantity: number;
    }>;
    level_requirements: number[];
    output_quantity: number;
    possibilities: Record<string, unknown>;
  }>;
  extraction_skill: number;
};

type CraftingData = Record<string, CraftingItem>;

const CraftingList: React.FC = () => {
  const craftingData = craftingDataRaw as CraftingData;
  console.log('CraftingList: Loaded data with', Object.keys(craftingData).length, 'items');

  return (
    <CraftingProvider craftingData={craftingData}>
      <CraftingListContent craftingData={craftingData} />
    </CraftingProvider>
  );
};

const CraftingListContent: React.FC<{ craftingData: CraftingData }> = ({ craftingData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState<number | "">("");
  const [rarityFilter, setRarityFilter] = useState<number | "">("");
  const [hasRecipesOnly, setHasRecipesOnly] = useState(false);

  // クラフトデータをItemType形式に変換
  const items: ItemType[] = useMemo(() => {
    console.log('CraftingListContent: Processing data with', Object.keys(craftingData).length, 'items');
    const convertedItems = Object.entries(craftingData).map(([id, item]) => ({
      id: parseInt(id),
      name: item.name,
      tier: item.tier,
      rarity: item.rarity,
      icon: item.icon,
      hasRecipes: item.recipes.length > 0,
      extractionSkill: item.extraction_skill,
      recipes: item.recipes
    }));
    console.log('CraftingListContent: Converted', convertedItems.length, 'items');
    return convertedItems;
  }, [craftingData]);

  // フィルタリングされたアイテム（最大10件）
  const filteredItems = useMemo(() => {
    let filtered = items.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTier = tierFilter === "" || item.tier === tierFilter;
      const matchesRarity = rarityFilter === "" || item.rarity === rarityFilter;
      const matchesRecipes = !hasRecipesOnly || (item as any).hasRecipes;
      
      return matchesSearch && matchesTier && matchesRarity && matchesRecipes;
    });
    
    // 最大10件に制限
    return filtered.slice(0, 10);
  }, [items, searchTerm, tierFilter, rarityFilter, hasRecipesOnly]);

  // ユニークなTierとRarityの値を取得
  const uniqueTiers = useMemo(() => {
    const tiers = [...new Set(items.map(item => item.tier))].filter(tier => tier !== undefined);
    return tiers.sort((a, b) => a! - b!);
  }, [items]);

  const uniqueRarities = useMemo(() => {
    const rarities = [...new Set(items.map(item => item.rarity))].filter(rarity => rarity !== undefined);
    return rarities.sort((a, b) => a! - b!);
  }, [items]);

  return (
    <div className="p-6 bg-slate-900 min-h-screen">
      <div className="max-w-full mx-auto">
        <h1 className="text-3xl font-bold text-yellow-300 mb-6">Bitcraft Wiki - Crafting Guide</h1>
        
        {/* レイアウト: 左側にフィルター＆縦スクロールアイテム一覧、右側に固定TODO */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 左側: フィルター＆アイテム一覧 (縦スクロール) */}
          <div className="flex-1 space-y-6 min-w-0">
            {/* フィルター */}
            <div className="bg-slate-800 rounded-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                {/* 検索 */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Search Items
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter item name..."
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-300"
                  />
                </div>

                {/* Tier フィルター */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tier
                  </label>
                  <select
                    value={tierFilter}
                    onChange={(e) => setTierFilter(e.target.value === "" ? "" : parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-300"
                  >
                    <option value="">All Tiers</option>
                    {uniqueTiers.map(tier => (
                      <option key={tier} value={tier}>Tier {tier}</option>
                    ))}
                  </select>
                </div>

                {/* Rarity フィルター */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Rarity
                  </label>
                  <select
                    value={rarityFilter}
                    onChange={(e) => setRarityFilter(e.target.value === "" ? "" : parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-300"
                  >
                    <option value="">All Rarities</option>
                    {uniqueRarities.map(rarity => (
                      <option key={rarity} value={rarity}>Rarity {rarity}</option>
                    ))}
                  </select>
                </div>

                {/* レシピ有無フィルター */}
                <div className="flex items-end">
                  <label className="flex items-center text-slate-300">
                    <input
                      type="checkbox"
                      checked={hasRecipesOnly}
                      onChange={(e) => setHasRecipesOnly(e.target.checked)}
                      className="mr-2 rounded border-slate-600 text-yellow-300 focus:ring-yellow-300"
                    />
                    Has Recipes Only
                  </label>
                </div>
              </div>

              {/* 結果数 */}
              <div className="text-slate-400 text-sm">
                Showing {filteredItems.length} of {items.length} items (max 10 displayed)
              </div>
            </div>

            {/* アイテム一覧 (縦スクロール) */}
            <div className="bg-slate-800 rounded-lg p-6">
              <h2 className="text-xl font-bold text-yellow-300 mb-4">アイテムリスト</h2>
              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[32rem] overflow-y-auto pr-2">
                  {filteredItems.map(item => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-slate-400 text-lg">No items found matching your criteria</div>
                  <div className="text-slate-500 text-sm mt-2">Try adjusting your filters</div>
                </div>
              )}
            </div>
          </div>
          
          {/* 右側: TODO リスト (固定幅) */}
          <div className="w-full lg:w-96 xl:w-112 flex-shrink-0">
            <CraftingTodo />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CraftingList;
