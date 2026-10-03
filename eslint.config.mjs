import { ourongxing, react } from "@ourongxing/eslint-config"
import reactPluginPkg from "@eslint-react/eslint-plugin"

// `@ourongxing/eslint-config@3.2.3-beta.6` 的 react 预设引用了若干
// `@eslint-react` >=2.x 中已被移除/重命名的规则（例如 react/ensure-forward-ref-using-ref、
// react-dom/no-children-in-void-dom-elements），导致 lint 初始化直接抛错。
// 这里在不改动依赖版本的前提下，对 react 预设里引用到的、但在对应插件中缺失的规则
// 补一条 no-op 别名，使预设可正常加载。ESLint 9 禁止重复定义同名插件，因此直接复用
// 预设注册的同名插件对象（就地修补其 rules），其余规则保持原样生效。
const allPlugins = reactPluginPkg.configs.all.plugins

// 预设里使用的插件命名空间 → @eslint-react 内部的插件键
const pluginKeyByNamespace = {
  "react": "@eslint-react",
  "react-dom": "@eslint-react/dom",
  "react-hooks-extra": "@eslint-react/hooks-extra",
  "react-naming-convention": "@eslint-react/naming-convention",
}

function ensureNoopRule(plugin, ruleName) {
  if (!plugin || !plugin.rules || ruleName in plugin.rules) return
  plugin.rules[ruleName] = {
    meta: {
      type: "problem",
      docs: { description: `Disabled: missing in @eslint-react >=2.x (${ruleName})` },
      schema: [],
    },
    create: () => ({}),
  }
}

const reactConfigs = await react({ files: ["src/**"], tsconfigPath: "tsconfig.app.json" })
for (const config of reactConfigs) {
  if (!config?.rules) continue
  for (const ruleKey of Object.keys(config.rules)) {
    const slash = ruleKey.indexOf("/")
    if (slash < 0) continue
    const ns = ruleKey.slice(0, slash)
    const pluginKey = pluginKeyByNamespace[ns]
    if (pluginKey) ensureNoopRule(allPlugins[pluginKey], ruleKey.slice(slash + 1))
  }
}

export default ourongxing({
  type: "app",
  // 貌似不能 ./ 开头，
  ignores: ["src/routeTree.gen.ts", "imports.app.d.ts", "public/", ".vscode", "hotboard/", "**/*.json"],
}).append(...reactConfigs)
