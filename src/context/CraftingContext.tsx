import React, { createContext, useContext, useState, ReactNode } from 'react';

export type CraftingItem = {
  id: number;
  name: string;
  tier?: number;
  rarity?: number;
  icon?: string;
  hasRecipes?: boolean;
  extractionSkill?: number;
  recipes?: Array<{
    consumed_items: Array<{
      id: number;
      quantity: number;
    }>;
    level_requirements: number[];
    output_quantity: number;
    possibilities: Record<string, unknown>;
  }>;
};

export type TodoItem = {
  id: number;
  quantity: number;
  ownedQuantity: number; // 所持数
  item: CraftingItem;
};

export type MaterialRequirement = {
  id: number;
  name: string;
  quantity: number;
  ownedQuantity?: number; // 所持数
  neededQuantity?: number; // 不足数
  icon?: string;
  isIntermediate?: boolean; // 中間アイテムかどうか
  depth?: number; // クラフトの深さ
  outputRange?: { min: number; max: number }; // 出力範囲
};

/**
 * @description
 * クラフト関連の状態と操作を定義する型
 */
type CraftingContextType = {
  todoItems: TodoItem[];
  materialOwnedQuantities: Record<number, number>; // 基本素材・中間アイテムの所持数
  addToTodo: (item: CraftingItem, quantity?: number) => void;
  removeFromTodo: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  updateOwnedQuantity: (id: number, ownedQuantity: number) => void;
  updateMaterialOwnedQuantity: (id: number, ownedQuantity: number) => void;
  calculateMaterials: () => MaterialRequirement[];
  calculateDetailedMaterials: () => { baseMaterials: MaterialRequirement[]; intermediateMaterials: MaterialRequirement[] };
  getOutputRange: (itemId: number) => { min: number; max: number } | null; // 新しい関数
  clearTodo: () => void;
};

/**
 * CraftingContextは、クラフト関連の状態と操作を提供するコンテキスト
 */
const CraftingContext = createContext<CraftingContextType | undefined>(undefined);

/**
 * @returns {CraftingContextType} 現在の `CraftingContext` の値
 * @throws {Error} `CraftingProvider` の外部で使用された場合にエラーをスロー
 *
 * @example
 * const crafting = useCrafting();
 *
 * @remarks
 * このフックは `CraftingProvider` の内部でのみ使用可能。
 * それ以外の場合はエラーがスロー
 */
export const useCrafting = () => {
  // CraftingContext から値を取得するカスタムフック
  // このフックは CraftingProvider の内部でのみ使用可能
  const context = useContext(CraftingContext);
  if (!context) {
    throw new Error('useCrafting must be used within a CraftingProvider');
  }
  return context;
};

type CraftingProviderProps = {
  children: ReactNode;
  craftingData: Record<string, any>;
};

export const CraftingProvider: React.FC<CraftingProviderProps> = ({ children, craftingData }) => {
  const [todoItems, setTodoItems] = useState<TodoItem[]>([]);
  const [materialOwnedQuantities, setMaterialOwnedQuantities] = useState<Record<number, number>>({});

  // possibilitiesから出力範囲を計算する関数
  const calculateOutputRange = (recipe: any): { min: number; max: number } => {
    if (recipe.possibilities && typeof recipe.possibilities === 'object' && Object.keys(recipe.possibilities).length > 0) {
      const quantities = Object.keys(recipe.possibilities).map(q => parseInt(q)).filter(q => !isNaN(q));
      if (quantities.length > 0) {
        return {
          min: Math.min(...quantities),
          max: Math.max(...quantities)
        };
      }
    }
    // possibilitiesが空または無効な場合はoutput_quantityを使用
    const outputQuantity = recipe.output_quantity || 1;
    return { min: outputQuantity, max: outputQuantity };
  };

  const addToTodo = (item: CraftingItem, quantity: number = 1) => {
    setTodoItems(prev => {
      const existingIndex = prev.findIndex(todo => todo.id === item.id);
      if (existingIndex >= 0) {
        // 既に存在する場合は数量を増やす
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        // 新しいアイテムを追加
        return [...prev, { id: item.id, quantity, ownedQuantity: 0, item }];
      }
    });
  };

  const removeFromTodo = (id: number) => {
    setTodoItems(prev => prev.filter(todo => todo.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromTodo(id);
      return;
    }
    setTodoItems(prev => 
      prev.map(todo => 
        todo.id === id ? { ...todo, quantity } : todo
      )
    );
  };

  const updateOwnedQuantity = (id: number, ownedQuantity: number) => {
    setTodoItems(prev => 
      prev.map(todo => 
        todo.id === id ? { ...todo, ownedQuantity: Math.max(0, ownedQuantity) } : todo
      )
    );
  };

  const updateMaterialOwnedQuantity = (id: number, ownedQuantity: number) => {
    setMaterialOwnedQuantities(prev => ({
      ...prev,
      [id]: Math.max(0, ownedQuantity)
    }));
  };

  const calculateMaterials = (): MaterialRequirement[] => {
    const materials: Record<number, MaterialRequirement> = {};

    // TODOアイテムと基本素材・中間アイテムの所持数を統合したマップ
    const allOwnedQuantities = { ...materialOwnedQuantities };
    todoItems.forEach(todo => {
      allOwnedQuantities[todo.id] = todo.ownedQuantity;
    });

    const processItem = (itemId: number, needed: number) => {
      const itemData = craftingData[itemId.toString()];
      if (!itemData) return;

      // 所持数を考慮して実際に必要な数を計算
      const ownedQuantity = allOwnedQuantities[itemId] || 0;
      const actualNeeded = Math.max(0, needed - ownedQuantity);

      // レシピがない場合は基本素材として追加
      if (!itemData.recipes || itemData.recipes.length === 0) {
        if (materials[itemId]) {
          materials[itemId].quantity += needed;
          materials[itemId].ownedQuantity = ownedQuantity;
          materials[itemId].neededQuantity = Math.max(0, materials[itemId].quantity - ownedQuantity);
        } else {
          materials[itemId] = {
            id: itemId,
            name: itemData.name,
            quantity: needed,
            ownedQuantity,
            neededQuantity: actualNeeded,
            icon: itemData.icon
          };
        }
        return;
      }

      // 所持数を考慮して実際に作る必要がある数がある場合のみレシピを処理
      if (actualNeeded > 0) {
        // 常に最初のレシピを使用（複数レシピがある場合）
        const recipe = itemData.recipes[0];
        const outputRange = calculateOutputRange(recipe);
        // 最悪ケース（最小出力）を考慮してクラフト回数を計算
        const craftsNeeded = Math.ceil(actualNeeded / outputRange.min);

        // 必要な素材を再帰的に計算（実際に作る分だけ）
        if (recipe.consumed_items && Array.isArray(recipe.consumed_items)) {
          recipe.consumed_items.forEach((material: any) => {
            // 可能性のあるプロパティ名を試行
            const materialQuantity = material.quantity || material.amount || material.count || 1;
            const materialId = material.id || material.item_id || material.itemId;
            
            const totalMaterialNeeded = materialQuantity * craftsNeeded;
            if (materialId) {
              processItem(materialId, totalMaterialNeeded);
            }
          });
        }
      }
    };

    // 各TODOアイテムを処理
    todoItems.forEach(todo => {
      processItem(todo.id, todo.quantity);
    });

    return Object.values(materials).sort((a, b) => a.name.localeCompare(b.name));
  };

  const calculateDetailedMaterials = React.useCallback(() => {
    const baseMaterials: Record<number, MaterialRequirement> = {};
    const intermediateMaterials: Record<number, MaterialRequirement> = {};

    const processItem = (itemId: number, needed: number, depth: number = 0, currentPath: number[] = []) => {
      try {
        console.log(`🔍 Processing item ${itemId}, needed: ${needed}, depth: ${depth}, path: [${currentPath.join(' -> ')}${currentPath.length > 0 ? ' -> ' : ''}${itemId}]`);
        
        // 入力値の検証
        if (needed <= 0) {
          console.log(`⚠️ Skip processing ${itemId}: needed quantity is ${needed}`);
          return;
        }
        
        // 現在のパスで循環参照をチェック
        if (currentPath.includes(itemId)) {
          console.warn(`🔄 Circular reference detected for item ${itemId} in path: [${currentPath.join(' -> ')} -> ${itemId}]. Adding to base materials.`);
          // 循環参照の場合は基本素材として扱う
          if (baseMaterials[itemId]) {
            baseMaterials[itemId].quantity += needed;
          } else {
            const itemData = craftingData[itemId.toString()];
            baseMaterials[itemId] = {
              id: itemId,
              name: itemData?.name || `Item ${itemId}`,
              quantity: needed,
              icon: itemData?.icon,
              isIntermediate: false,
              depth
            };
          }
          console.log(`✅ Added to base materials due to circular reference: ${baseMaterials[itemId].name}, quantity: ${baseMaterials[itemId].quantity}`);
          return;
        }
        
        // 深すぎる場合の保護
        if (depth > 10) {
          console.warn(`🔄 Maximum depth (10) reached for item ${itemId}. Adding to base materials.`);
          // 深度制限に達した場合も基本素材として扱う
          if (baseMaterials[itemId]) {
            baseMaterials[itemId].quantity += needed;
          } else {
            const itemData = craftingData[itemId.toString()];
            baseMaterials[itemId] = {
              id: itemId,
              name: itemData?.name || `Item ${itemId}`,
              quantity: needed,
              icon: itemData?.icon,
              isIntermediate: false,
              depth
            };
          }
          console.log(`✅ Added to base materials due to depth limit: ${baseMaterials[itemId].name}, quantity: ${baseMaterials[itemId].quantity}`);
          return;
        }

        const itemData = craftingData[itemId.toString()];
        if (!itemData) {
          console.log(`❌ No data found for item ${itemId}, adding to base materials`);
          // データがない場合は基本素材として扱う
          if (baseMaterials[itemId]) {
            baseMaterials[itemId].quantity += needed;
          } else {
            baseMaterials[itemId] = {
              id: itemId,
              name: `Unknown Item ${itemId}`,
              quantity: needed,
              icon: undefined,
              isIntermediate: false,
              depth
            };
          }
          console.log(`✅ Added unknown item to base materials: ${baseMaterials[itemId].name}, quantity: ${baseMaterials[itemId].quantity}`);
          return;
        }

        // 新しいパスを作成（現在のアイテムを追加）
        const newPath = [...currentPath, itemId];

        // レシピがない場合は基本素材として追加
        if (!itemData.recipes || itemData.recipes.length === 0) {
          if (baseMaterials[itemId]) {
            const oldQuantity = baseMaterials[itemId].quantity;
            baseMaterials[itemId].quantity += needed;
            console.log(`📦 Updated base material: ${itemData.name}, old: ${oldQuantity}, added: ${needed}, new total: ${baseMaterials[itemId].quantity}`);
          } else {
            baseMaterials[itemId] = {
              id: itemId,
              name: itemData.name,
              quantity: needed,
              icon: itemData.icon,
              isIntermediate: false,
              depth
            };
            console.log(`📦 Added new base material: ${itemData.name}, quantity: ${needed}`);
          }
          return;
        }

        // 中間アイテムとして記録（深度1以上のレシピ持ちアイテム）
        if (depth > 0) { // TODOアイテム自体は中間アイテムに含めない
          if (intermediateMaterials[itemId]) {
            const oldQuantity = intermediateMaterials[itemId].quantity;
            intermediateMaterials[itemId].quantity += needed;
            console.log(`🏭 Updated intermediate material: ${itemData.name}, old: ${oldQuantity}, added: ${needed}, new total: ${intermediateMaterials[itemId].quantity}, depth: ${depth}`);
          } else {
            intermediateMaterials[itemId] = {
              id: itemId,
              name: itemData.name,
              quantity: needed,
              icon: itemData.icon,
              isIntermediate: true,
              depth
            };
            console.log(`🏭 Added new intermediate material: ${itemData.name}, quantity: ${needed}, depth: ${depth}`);
          }
        }

        // レシピを処理
        if (itemData.recipes && itemData.recipes.length > 0) {
          // 常に最初のレシピを使用（複数レシピがある場合）
          const recipe = itemData.recipes[0];
          console.log(`🔧 Processing recipe for ${itemData.name}:`, {
            consumed_items: recipe.consumed_items,
            output_quantity: recipe.output_quantity,
            possibilities: recipe.possibilities,
            possibilitiesKeys: recipe.possibilities ? Object.keys(recipe.possibilities) : 'N/A',
            possibilitiesLength: recipe.possibilities ? Object.keys(recipe.possibilities).length : 0
          });
          
          const outputRange = calculateOutputRange(recipe);
          // 最悪ケース（最小出力）を考慮してクラフト回数を計算
          const craftsNeeded = Math.ceil(needed / outputRange.min);

          console.log(`📊 Recipe calculation for ${itemData.name}: needed=${needed}, output range=${outputRange.min}-${outputRange.max}, crafts needed=${craftsNeeded}`);

          // 必要な素材を再帰的に計算
          if (recipe.consumed_items && Array.isArray(recipe.consumed_items)) {
            console.log(`🔄 Processing ${recipe.consumed_items.length} consumed items for ${itemData.name}:`);
            recipe.consumed_items.forEach((material: any, index: number) => {
              try {
                console.log(`  📋 Material ${index + 1}:`, material);
                
                // 可能性のあるプロパティ名を試行
                const materialQuantity = material.quantity || material.amount || material.count || 1;
                const materialId = material.id || material.item_id || material.itemId;
                
                const totalMaterialNeeded = materialQuantity * craftsNeeded;
                if (materialId && typeof materialId === 'number' && materialQuantity > 0) {
                  console.log(`    ➡️ Processing material ${materialId}: ${totalMaterialNeeded} (${materialQuantity} x ${craftsNeeded})`);
                  processItem(materialId, totalMaterialNeeded, depth + 1, newPath);
                } else {
                  console.error(`    ❌ Invalid material for ${itemData.name}:`, { materialId, materialQuantity, material });
                }
              } catch (materialError) {
                console.error(`❌ Error processing material ${index + 1} for ${itemData.name}:`, material, materialError);
              }
            });
          } else {
            console.log(`⚠️ No consumed_items found for ${itemData.name} recipe`);
          }
        } else {
          console.log(`⚠️ No recipes found for ${itemData.name}`);
        }
      } catch (error) {
        console.error(`❌ Error processing item ${itemId}:`, error);
      }
    };

    console.log('🚀 === Starting calculateDetailedMaterials ===');
    console.log('📋 TODO Items:', todoItems.map(todo => `${todo.item.name} (${todo.id}) x${todo.quantity}`));
    
    // 各TODOアイテムを処理
    todoItems.forEach((todo, index) => {
      console.log(`\n🎯 --- Processing TODO item ${index + 1}: ${todo.item.name} (${todo.id}), quantity: ${todo.quantity} ---`);
      processItem(todo.id, todo.quantity, 0, []);
    });

    console.log('\n✅ === Final Results ===');
    console.log('📦 Base materials count:', Object.keys(baseMaterials).length);
    Object.values(baseMaterials).forEach(m => {
      console.log(`  📦 ${m.name} (${m.id}): ${m.quantity}`);
    });
    
    console.log('🏭 Intermediate materials count:', Object.keys(intermediateMaterials).length);
    Object.values(intermediateMaterials).forEach(m => {
      console.log(`  🏭 ${m.name} (${m.id}): ${m.quantity} (depth: ${m.depth})`);
    });

    const result = {
      baseMaterials: Object.values(baseMaterials).sort((a, b) => a.name.localeCompare(b.name)),
      intermediateMaterials: Object.values(intermediateMaterials).sort((a, b) => (a.depth || 0) - (b.depth || 0) || a.name.localeCompare(b.name))
    };

    console.log('🏁 === End calculateDetailedMaterials ===\n');
    return result;
  }, [todoItems, craftingData]);

  const clearTodo = () => {
    setTodoItems([]);
  };

  const getOutputRange = (itemId: number): { min: number; max: number } | null => {
    const itemData = craftingData[itemId.toString()];
    if (!itemData || !itemData.recipes || itemData.recipes.length === 0) {
      return null;
    }
    // 常に最初のレシピを使用
    return calculateOutputRange(itemData.recipes[0]);
  };

  return (
    <CraftingContext.Provider value={{
      todoItems,
      materialOwnedQuantities,
      addToTodo,
      removeFromTodo,
      updateQuantity,
      updateOwnedQuantity,
      updateMaterialOwnedQuantity,
      calculateMaterials,
      calculateDetailedMaterials,
      getOutputRange,
      clearTodo
    }}>
      {children}
    </CraftingContext.Provider>
  );
};
