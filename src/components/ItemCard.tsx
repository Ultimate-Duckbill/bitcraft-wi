import React from "react";
import { useCrafting } from "../context/CraftingContext";

export type ItemType = {
  id: number;
  name: string;
  tier?: number;
  rarity?: number;
  icon?: string;
  hasRecipes?: boolean;
  extractionSkill?: number;
  recipes?: any[];
};

const ItemCard: React.FC<{ item: ItemType }> = ({ item }) => {
  const { addToTodo } = useCrafting();
  
  // アイコン画像のパスを生成
  const getIconPath = (iconName?: string) => {
    if (!iconName) return null;
    // .pngが含まれていない場合は追加
    const iconWithExtension = iconName.endsWith('.png') ? iconName : `${iconName}.png`;
    return `/Assets/${iconWithExtension}`;
  };

  const iconPath = getIconPath(item.icon);
  console.log("ItemCard iconPath:", iconPath);

  const handleAddToTodo = () => {
    addToTodo(item as any, 1);
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow border border-slate-700 max-w-xs">
      <div className="text-2xl mb-2">
        {iconPath ? (
          <img 
            src={iconPath} 
            alt={item.name} 
            className="w-8 h-8 object-contain"
            onError={(e) => {
              // 画像が見つからない場合はデフォルトの絵文字を表示
              e.currentTarget.style.display = 'none';
              const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
              if (nextElement) {
                nextElement.style.display = 'block';
              }
            }}
          />
        ) : null}
        <span style={iconPath ? { display: 'none' } : {}}>🪙</span>
      </div>
      <h2 className="text-xl font-bold text-yellow-300 mb-1">{item.name}</h2>
      <div className="text-slate-400 text-sm mb-2">ID: {item.id}</div>
      <div className="flex flex-wrap gap-2 mb-2">
        <span className="bg-slate-700 text-xs px-2 py-1 rounded">Tier: {item.tier ?? '-'}</span>
        <span className="bg-slate-700 text-xs px-2 py-1 rounded">Rarity: {item.rarity ?? '-'}</span>
        {item.hasRecipes && (
          <span className="bg-green-600 text-xs px-2 py-1 rounded">Has Recipe</span>
        )}
      </div>
      <div className="text-slate-400 text-xs">icon: {item.icon ?? '-'}</div>
      
      {/* Add to TODO ボタン */}
      <button
        onClick={handleAddToTodo}
        className="mt-3 w-full bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium py-2 px-4 rounded transition-colors duration-200 flex items-center justify-center gap-2"
      >
        <span>+</span>
        Add to TODO
      </button>
    </div>
  );
};

export default ItemCard;
