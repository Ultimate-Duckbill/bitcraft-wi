import React from "react";

export type ItemType = {
  id: number;
  name: string;
  tier?: number;
  rarity?: number;
  icon?: string;
};

const ItemCard: React.FC<{ item: ItemType }> = ({ item }) => (
  <div className="bg-slate-800 rounded-lg p-6 shadow border border-slate-700 max-w-xs">
    <div className="text-2xl mb-2">🪙</div>
    <h2 className="text-xl font-bold text-yellow-300 mb-1">{item.name}</h2>
    <div className="text-slate-400 text-sm mb-2">ID: {item.id}</div>
    <div className="flex flex-wrap gap-2 mb-2">
      <span className="bg-slate-700 text-xs px-2 py-1 rounded">Tier: {item.tier ?? '-'}</span>
      <span className="bg-slate-700 text-xs px-2 py-1 rounded">Rarity: {item.rarity ?? '-'}</span>
    </div>
    <div className="text-slate-400 text-xs">icon: {item.icon ?? '-'}</div>
  </div>
);

export default ItemCard;
