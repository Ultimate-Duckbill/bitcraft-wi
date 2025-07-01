import React from 'react';
import { useCrafting, MaterialRequirement } from '../context/CraftingContext';
import MaterialCard from './MaterialCard';
import { withPrefix } from 'gatsby';

// Intermediate Materials コンポーネントを分離
const IntermediateMaterialsSection: React.FC<{
  intermediateMaterials: MaterialRequirement[];
  getIconPath: (iconName?: string) => string | null;
}> = ({ intermediateMaterials, getIconPath }) => {
  // depthでグループ化
  const groupedByDepth = intermediateMaterials.reduce((acc, material) => {
    const depth = material.depth || 0;
    if (!acc[depth]) acc[depth] = [];
    acc[depth].push(material);
    return acc;
  }, {} as Record<number, MaterialRequirement[]>);

  // depth順にソート（大きい順 = 右から左へ）
  const sortedDepths = Object.keys(groupedByDepth)
    .map(d => parseInt(d))
    .sort((a, b) => b - a);

  return (
    <>
      {sortedDepths.map(depth => (
        <div key={depth} className="flex-shrink-0 w-36">
          <div className="bg-orange-800 rounded-lg p-4 h-full">
            <h3 className="text-lg font-semibold text-orange-200 mb-4 text-center">
              Depth {depth}
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {groupedByDepth[depth].map(material => (
                <MaterialCard 
                  key={material.id} 
                  material={material} 
                  getIconPath={getIconPath} 
                  isBase={false}
                />
              ))}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

const CraftingTodo: React.FC = () => {
  const { todoItems, removeFromTodo, updateQuantity, calculateDetailedMaterials, clearTodo } = useCrafting();
  
  // TODOアイテムが変更されたときに材料を再計算
  const { baseMaterials, intermediateMaterials } = React.useMemo(() => {
    console.log('🔄 [CraftingTodo] Recalculating materials due to TODO items change');
    const result = calculateDetailedMaterials();
    console.log('📊 [CraftingTodo] Material calculation result:', {
      baseMaterials: result.baseMaterials.length,
      intermediateMaterials: result.intermediateMaterials.length,
      baseQuantities: result.baseMaterials.map(m => `${m.name}: ${m.quantity}`),
      intermediateQuantities: result.intermediateMaterials.map(m => `${m.name}: ${m.quantity}`)
    });
    return result;
  }, [todoItems, calculateDetailedMaterials]);

  // デバッグ用: 計算結果をコンソールに出力
  React.useEffect(() => {
    console.log('🔍 [CraftingTodo] === DEBUG: calculateDetailedMaterials ===');
    console.log('📋 [CraftingTodo] TODO Items:', todoItems.map(t => `${t.item.name}: ${t.quantity}`));
    console.log('📦 [CraftingTodo] Base Materials:', baseMaterials.map(m => `${m.name}: ${m.quantity}`));
    console.log('🏭 [CraftingTodo] Intermediate Materials:', intermediateMaterials.map(m => `${m.name}: ${m.quantity} (depth: ${m.depth})`));
    
    // 深さ別にグループ化して確認
    const depthGroups = intermediateMaterials.reduce((acc, material) => {
      const depth = material.depth || 0;
      if (!acc[depth]) acc[depth] = [];
      acc[depth].push(material);
      return acc;
    }, {} as Record<number, MaterialRequirement[]>);
    
    console.log('📊 [CraftingTodo] Intermediate Materials grouped by depth:', depthGroups);
    console.log('🔢 [CraftingTodo] Available depths:', Object.keys(depthGroups));
    console.log('🏁 [CraftingTodo] =========================================');
  }, [todoItems, baseMaterials, intermediateMaterials]);

  const getIconPath = (iconName?: string) => {
    if (!iconName) return null;
    const iconWithExtension = iconName.endsWith('.png') ? iconName : `${iconName}.png`;
    return withPrefix(`/Assets/${iconWithExtension}`);
  };

  if (todoItems.length === 0) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 max-w-4xl mx-auto">
        <h2 className="text-xl font-bold text-yellow-300 mb-4">Crafting TODO</h2>
        <p className="text-slate-400 text-center py-8">
          No items in TODO list. Click "Add to TODO" on any item to start planning your crafting!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-yellow-300">Crafting TODO</h2>
        <button
          onClick={clearTodo}
          className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* TODO Items */}
      <div className="space-y-3 mb-6">
        {todoItems.map(todo => {
          const iconPath = getIconPath(todo.item.icon);
          
          return (
            <div key={todo.id} className="bg-slate-700 rounded-lg p-4 relative">
              {/* 削除ボタン（右上） */}
              <button
                onClick={() => removeFromTodo(todo.id)}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white w-5 h-5 rounded text-xs flex items-center justify-center"
              >
                ×
              </button>
              
              {/* 上段: アイコン + アイテム名 + 必要数表示 */}
              <div className="flex items-center gap-3 mb-3">
                {/* アイコン */}
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                  {iconPath ? (
                    <img
                      src={iconPath}
                      alt={todo.item.name}
                      className="w-8 h-8 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                        if (nextElement) nextElement.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <span style={iconPath ? { display: 'none' } : {}} className="text-xl">🔧</span>
                </div>
                
                {/* アイテム名 */}
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium text-sm truncate">{todo.item.name}</div>
                  <div className="text-slate-400 text-xs">ID: {todo.item.id}</div>
                </div>
                
                {/* 必要数表示 */}
                <div className="text-right">
                  <div className="text-yellow-300 text-sm font-semibold">
                    必要数: {todo.quantity}
                  </div>
                </div>
              </div>
              
              {/* 下段: 数量調整 */}
              <div className="flex justify-center">
                {/* 必要数調整 */}
                <div>
                  <label className="block text-slate-300 text-xs mb-1 text-center">必要数</label>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(todo.id, todo.quantity - 1)}
                      className="bg-slate-600 hover:bg-slate-500 text-white w-6 h-6 rounded text-sm flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="text-white min-w-[40px] text-center font-semibold bg-slate-600 rounded px-2 py-1 text-sm">
                      {todo.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(todo.id, todo.quantity + 1)}
                      className="bg-slate-600 hover:bg-slate-500 text-white w-6 h-6 rounded text-sm flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Materials Layout - 横並び配置 */}
      <div className="flex flex-col gap-4">
        {/* Base Materials + Intermediate Materials - 横並び */}
        {(baseMaterials.length > 0 || intermediateMaterials.length > 0) && (
          <div className="overflow-x-auto">
            <div className="flex gap-4 pb-2" style={{ minWidth: "max-content" }}>
              {/* Base Materials - 一番左、緑の背景 */}
              {baseMaterials.length > 0 && (
                <div className="flex-shrink-0 w-36">
                  <div className="bg-green-800 rounded-md p-2 h-full">
                    <h3 className="text-lg font-semibold text-green-200 mb-4 text-center">Base Materials</h3>
                    <div className="space-y-3">
                      {baseMaterials.map(material => {
                        return (
                          <MaterialCard
                            key={material.id}
                            material={material}
                            getIconPath={getIconPath}
                            isBase={true} />
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Intermediate Materials - depth順に右から左へ */}
              {intermediateMaterials.length > 0 && (
                <IntermediateMaterialsSection 
                  intermediateMaterials={intermediateMaterials} 
                  getIconPath={getIconPath} 
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CraftingTodo;
