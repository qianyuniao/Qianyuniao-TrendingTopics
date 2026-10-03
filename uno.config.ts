import process from "node:process"
import { defineConfig, presetIcons, presetWind3, transformerDirectives, transformerVariantGroup } from "unocss"
import { hex2rgba } from "@unocss/rule-utils"
import { sources } from "./shared/sources"
import { columnColors } from "./shared/metadata"
import { HOTBOARD_CATEGORY_COLORS } from "./shared/hotboard"

// @unocss/preset-icons 会通过 process.env.VSCODE_CWD 判断是否处于 VSCode 环境，
// 若存在则跳过「本地 @iconify-json 图标加载器」、只保留联网加载器，导致离线时所有
// i-* 图标（如各看板的刷新按钮）都不生成、元素零尺寸而“隐形”。
// 在 VS Code / CodeBuddy 等 IDE 终端里该变量默认存在，这里清除它以强制走本地图标集合。
if (typeof process !== "undefined") {
  delete process.env.VSCODE_CWD
  delete process.env.ESLINT
}

/** 把主题调色板中某个色阶转成带透明度的 rgba() 字符串（取不到则返回 undefined） */
function colorRGBA(theme: any, name: string, shade: number, alpha: number): string | undefined {
  const hex = theme?.colors?.[name]?.[shade]
  if (!hex) return undefined
  return `rgba(${hex2rgba(hex)?.join(", ")}, ${alpha})`
}

/** 所有用到的主题色名（供 safelist 使用，保证动态拼接的类名也能生成样式） */
const colorNames = [...new Set([
  "orange",
  ...Object.values(sources).map(s => s.color),
  ...Object.values(columnColors),
  ...Object.values(HOTBOARD_CATEGORY_COLORS),
])]

const safelistUtilities = colorNames.flatMap(k => [
  `bg-${k}`,
  `color-${k}`,
  `border-${k}`,
  `sprinkle-${k}`,
  `gp-${k}`,
  `shadow-${k}`,
  `bg-${k}-500`,
  `color-${k}-500`,
  `bg-${k}-500/10`,
  `bg-${k}-500/15`,
  `bg-${k}-500/20`,
  `bg-${k}-500/25`,
  `bg-${k}-500/30`,
  `border-${k}-500/40`,
  `dark:bg-${k}`,
  `dark:color-${k}`,
])

export default defineConfig({
  mergeSelectors: false,
  transformers: [transformerDirectives(), transformerVariantGroup()],
  presets: [
    presetWind3(),
    presetIcons({ scale: 1.2 }),
  ],
  rules: [
    // 顶部柔光点缀
    [/^sprinkle-(.+)$/, ([_, name], { theme }) => {
      const soft = colorRGBA(theme, name, 400, 0.3)
      if (!soft) return
      return {
        "background-image": `radial-gradient(ellipse 80% 80% at 50% -30%, ${soft}, rgba(255, 255, 255, 0));`,
      }
    }],
    // 分类色面板：线性渐变叠加顶部柔光点缀
    [/^gp-(.+)$/, ([_, name], { theme }) => {
      const top = colorRGBA(theme, name, 400, 0.30)
      const mid = colorRGBA(theme, name, 500, 0.40)
      const bottom = colorRGBA(theme, name, 700, 0.22)
      if (!top || !mid || !bottom) return
      return {
        "background-image":
          `radial-gradient(ellipse 80% 80% at 50% -30%, ${top}, rgba(255, 255, 255, 0)),`
          + `linear-gradient(135deg, ${mid} 0%, ${bottom} 100%)`,
      }
    }],
    ["font-brand", {
      "font-family": `"Baloo 2", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;`,
    }],
  ],
  shortcuts: {
    "color-base": "color-neutral-800 dark:color-neutral-300",
    "bg-base": "bg-zinc-200 dark:bg-dark-600",
    "btn": "op50 hover:op85 cursor-pointer transition-all",
  },
  safelist: safelistUtilities,
  extendTheme: (theme) => {
    // 主题强调色：暗紫蓝背景上使用青色，对比度高于红色
    // @ts-expect-error >_<
    theme.colors.primary = theme.colors.cyan
    return theme
  },
})
