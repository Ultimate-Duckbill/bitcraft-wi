import React from 'react';
import { MaterialRequirement } from '../context/CraftingContext';

/**
 * MaterialCardコンポーネントのプロパティです。
 *
 * @property material - 表示する素材の詳細情報を含むMaterialRequirementオブジェクト。
 * @property getIconPath - アイコン名を受け取り、該当するアイコンのパスを返す関数。アイコン名が指定されない場合はnullを返すことがあります。
 * @property isBase - オプション。trueの場合はベース素材として緑色の横並びレイアウト、falseの場合は中間素材としてオレンジ色の縦並びレイアウトで表示されます。
 */
interface MaterialCardProps {
  material: MaterialRequirement;
  getIconPath: (iconName?: string) => string | null;
  isBase?: boolean;
}

const MaterialCard: React.FC<MaterialCardProps> = ({ material, getIconPath, isBase = false }) => {
  const iconPath = getIconPath(material.icon);
  const cardBgClass = isBase ? 'bg-green-700 hover:bg-green-600' : 'bg-orange-700 hover:bg-orange-600';
  const cardTextClass = isBase ? 'text-green-100' : 'text-orange-100';
  const cardQuantityClass = isBase ? 'text-green-200 bg-green-600' : 'text-orange-200 bg-orange-600';
  
  return (
    <div className={`rounded-lg p-3 flex flex-col items-center text-center transition-colors ${cardBgClass}`}>
      <div className="w-8 h-8 flex items-center justify-center mb-2">
        {iconPath ? (
          <img
            src={iconPath}
            alt={material.name}
            className="w-6 h-6 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
              if (nextElement) nextElement.style.display = 'block';
            }}
          />
        ) : null}
        <span style={iconPath ? { display: 'none' } : {}} className="text-lg">🔧</span>
      </div>
      <div className={`${cardTextClass} text-xs font-medium leading-tight mb-1 overflow-hidden`} style={{
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical'
      }}>{material.name}</div>
      <div className={`${cardQuantityClass} font-bold text-sm px-2 py-1 rounded`}>
        {material.quantity}
      </div>
    </div>
  );
};

export default MaterialCard;
