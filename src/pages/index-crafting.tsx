import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"
import "../styles/global.css"
import 'twin.macro'
import CraftingList from "../components/CraftingList"

const IndexPage: React.FC<PageProps> = () => {
  return (
    <main>
      <CraftingList />
    </main>
  )
}

export default IndexPage

export const Head: HeadFC = () => (
  <>
    <title>Bitcraft Wiki - Crafting Guide</title>
    <meta name="description" content="Bitcraft crafting items and recipes database" />
  </>
)
