module.exports = {
  pathPrefix: process.env.NODE_ENV === 'production' ? '/bitcraft-wiki' : '',
  
  siteMetadata: {
    title: 'Bitcraft Wiki',
    description: 'Bitcraft crafting recipe database and TODO planner',
    siteUrl: 'https://yuehara.github.io/bitcraft-wiki', // GitHubユーザー名に合わせて変更してください
  },
  
  /* Your site config here */
  plugins: [
    'gatsby-plugin-postcss',
    'gatsby-plugin-emotion',
    {
      resolve: `gatsby-plugin-sass`,
      options: {
        postCssPlugins: [
          require("tailwindcss"),
          require("./tailwind.config.js")
        ],
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `data`,
        path: `${__dirname}/src/data/`, // crafting_data.jsonのあるディレクトリ
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `static-data`,
        path: `${__dirname}/static/data/`, // static/data/のJSONファイルも含める
      },
    },
    `gatsby-transformer-json`,
  
  ],
}
