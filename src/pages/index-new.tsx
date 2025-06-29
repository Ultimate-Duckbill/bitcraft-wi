import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"
import "../styles/global.css"

// サンプルアイテムデータ
const gameItems = [
  {
    id: 1,
    name: "鉄の剣",
    description: "基本的な鉄製の剣",
    materials: [
      { name: "鉄鉱石", quantity: 3 },
      { name: "木材", quantity: 1 },
    ],
    category: "武器"
  },
  {
    id: 2,
    name: "体力ポーション",
    description: "HPを50回復する",
    materials: [
      { name: "薬草", quantity: 2 },
      { name: "水", quantity: 1 },
    ],
    category: "消耗品"
  },
  {
    id: 3,
    name: "鉄の鎧",
    description: "防御力+10の鎧",
    materials: [
      { name: "鉄鉱石", quantity: 5 },
      { name: "布", quantity: 2 },
    ],
    category: "防具"
  },
  {
    id: 4,
    name: "魔法の杖",
    description: "魔力+15の杖",
    materials: [
      { name: "魔石", quantity: 1 },
      { name: "木材", quantity: 2 },
      { name: "銀", quantity: 1 },
    ],
    category: "武器"
  },
  {
    id: 5,
    name: "マナポーション",
    description: "MPを30回復する",
    materials: [
      { name: "魔草", quantity: 1 },
      { name: "水", quantity: 1 },
      { name: "魔石", quantity: 1 },
    ],
    category: "消耗品"
  },
]

const IndexPage: React.FC<PageProps> = () => {
  const [selectedItems, setSelectedItems] = React.useState<{[key: number]: number}>({})
  const [materialTotal, setMaterialTotal] = React.useState<{[key: string]: number}>({})

  // アイテム数量の更新
  const updateItemQuantity = (itemId: number, quantity: number) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: quantity
    }))
  }

  // 必要素材の計算
  React.useEffect(() => {
    const total: {[key: string]: number} = {}
    
    Object.entries(selectedItems).forEach(([itemId, quantity]) => {
      const item = gameItems.find(i => i.id === parseInt(itemId))
      if (item && quantity > 0) {
        item.materials.forEach(material => {
          total[material.name] = (total[material.name] || 0) + (material.quantity * quantity)
        })
      }
    })
    
    setMaterialTotal(total)
  }, [selectedItems])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "武器": return "⚔️"
      case "防具": return "🛡️"
      case "消耗品": return "🧪"
      default: return "📦"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "武器": return "bg-red-600"
      case "防具": return "bg-blue-600"
      case "消耗品": return "bg-green-600"
      default: return "bg-gray-600"
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 text-white">
      {/* ヘッダー */}
      <header className="bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🎮</div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                BitCraft 攻略Wiki
              </h1>
              <p className="text-slate-300 mt-1">素材計算ツール - 効率的なクラフトをサポート</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* アイテム選択エリア */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-6">
                <div className="text-2xl">📦</div>
                <h2 className="text-2xl font-semibold text-blue-300">アイテム一覧</h2>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                {gameItems.map(item => (
                  <div key={item.id} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600 hover:border-slate-500 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{getCategoryIcon(item.category)}</span>
                          <h3 className="text-lg font-semibold text-white">{item.name}</h3>
                          <span className={`px-2 py-1 text-white text-xs rounded-full ${getCategoryColor(item.category)}`}>
                            {item.category}
                          </span>
                        </div>
                        <p className="text-slate-300 text-sm mb-3">{item.description}</p>
                        
                        <div className="text-sm text-slate-400">
                          <span className="font-medium text-slate-300">必要素材:</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {item.materials.map((material, idx) => (
                              <span key={idx} className="bg-slate-600/50 px-2 py-1 rounded text-xs border border-slate-500">
                                {material.name} ×{material.quantity}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center gap-2 ml-4">
                        <label className="text-xs text-slate-400">作成数</label>
                        <input
                          type="number"
                          min="0"
                          max="999"
                          value={selectedItems[item.id] || 0}
                          onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-center text-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none"
                        />
                        <span className="text-slate-400 text-xs">個</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 計算結果エリア */}
          <div className="space-y-6">
            {/* 必要素材計算結果 */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700 sticky top-32">
              <div className="flex items-center gap-3 mb-6">
                <div className="text-2xl">📊</div>
                <h2 className="text-xl font-semibold text-green-300">必要素材</h2>
              </div>
              
              {Object.keys(materialTotal).length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <div className="text-4xl mb-3">📝</div>
                  <p className="text-sm">アイテムを選択してください</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {Object.entries(materialTotal)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([material, quantity]) => (
                    <div key={material} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                      <span className="text-white font-medium">{material}</span>
                      <span className="text-green-400 font-bold text-lg">{quantity}個</span>
                    </div>
                  ))}
                  
                  <div className="mt-4 pt-3 border-t border-slate-600">
                    <p className="text-xs text-slate-400 text-center">
                      素材種類: {Object.keys(materialTotal).length}種類
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* 選択中のアイテム一覧 */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-xl">🎯</div>
                <h3 className="text-lg font-semibold text-purple-300">選択中のアイテム</h3>
              </div>
              
              {Object.entries(selectedItems).filter(([_, quantity]) => quantity > 0).length === 0 ? (
                <p className="text-slate-400 text-center py-4 text-sm">選択中のアイテムはありません</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(selectedItems)
                    .filter(([_, quantity]) => quantity > 0)
                    .map(([itemId, quantity]) => {
                      const item = gameItems.find(i => i.id === parseInt(itemId))
                      return item ? (
                        <div key={itemId} className="flex items-center justify-between p-2 bg-slate-700/30 rounded border border-slate-600/50">
                          <div className="flex items-center gap-2">
                            <span>{getCategoryIcon(item.category)}</span>
                            <span className="text-white text-sm">{item.name}</span>
                          </div>
                          <span className="text-blue-400 font-semibold">{quantity}個</span>
                        </div>
                      ) : null
                    })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* フッター */}
        <footer className="mt-16 text-center text-slate-400 border-t border-slate-700 pt-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl">🎮</span>
            <span className="font-semibold">BitCraft 攻略Wiki</span>
          </div>
          <p className="text-sm">素材計算ツール - 効率的なアイテム作成をサポート</p>
          <p className="text-xs mt-2 text-slate-500">必要な素材を事前に計算して、効率的にクラフトしましょう！</p>
        </footer>
      </div>
    </main>
  )
}

export default IndexPage

export const Head: HeadFC = () => (
  <>
    <title>BitCraft 攻略Wiki - 素材計算ツール</title>
    <meta name="description" content="BitCraftの素材計算ツール。必要なアイテムを選択して、必要素材数を自動計算します。効率的なクラフトをサポート！" />
    <meta name="keywords" content="BitCraft,攻略,素材計算,クラフト,ゲーム,ツール" />
  </>
)
