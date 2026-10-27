# 打包为 Windows 桌面应用（Tauri）

本项目是 **Nitro 全栈应用**（React 前端 + Node 后端代理 arxiv/知乎/微博等外部 API）。
为打包成桌面 `.exe`，采用 **Tauri** 方案：把 Nitro 后端作为 **sidecar**（随应用启动的本地 Node 服务），
前端 Webview 加载本地 `http://localhost:3000`。前端 API 使用相对路径 `/api`，无需任何改动即可指向本地后端。

> 说明：本环境到 GitHub 二进制 CDN 带宽受限，无法在此完成最终 Rust 编译。以下流程在你本机（网络正常）执行即可产出 `.exe`。

## 架构

```
Tauri 外壳 (Rust)
  └─ 启动 sidecar: node.exe server/index.mjs   (资源目录内)
        └─ 监听 http://127.0.0.1:3000
  └─ Webview 窗口加载 http://localhost:3000
        ├─ /            → Nitro 托管的前端静态资源
        └─ /api/*       → Nitro 后端代理的外部热点数据
```

## 环境要求

| 工具 | 版本/说明 |
|------|-----------|
| Node.js | **v24**（必须与 `better-sqlite3` 原生模块 ABI 匹配；打包用的 `node.exe` 取自当前 Node） |
| pnpm | 项目包管理器 |
| Rust | 1.77+，通过 [rustup](https://rustup.rs) 安装 |
| C 链接器 | 二选一：<br>• **MinGW-w64**（轻量）：`rustup target add x86_64-pc-windows-gnu`，并确保 `gcc` 在 PATH（本项目已配置 `src-tauri/.cargo/config.toml` 指定 `linker = "gcc"`）<br>• **MSVC 生成工具**（Tauri 官方推荐）：安装 VS Build Tools 的“C++ 桌面开发”工作负载 |
| Tauri CLI | 已加入 `devDependencies`，通过 `npm run tauri` 调用 |

> 首次 `tauri build` 会从 crates.io 拉取 Rust 依赖，需要可访问网络。

## 构建步骤

```bash
# 1. 安装依赖（含 @tauri-apps/cli）
pnpm install

# 2. （若用 MinGW）添加 GNU 目标
rustup target add x86_64-pc-windows-gnu

# 3. 一键构建：先 vite+nitro 构建，再 tauri 打包
npm run build:desktop
# 等价于：npm run build && tauri build
```

产出物位于：

```
src-tauri/target/release/bundle/nsis/千鸟热点看板_0.0.40_x64-setup.exe
```

## 开发模式（不打包，热更新）

```bash
npm run tauri dev
```

开发模式下主进程**不会**拉起 sidecar，直接由 `npm run dev` 的 Vite+Nitro 在 `:3000` 提供服务，
窗口加载 `http://localhost:3000`（见 `src-tauri/src/main.rs` 中 `#[cfg(not(debug_assertions))]` 分支）。

## 配置文件说明

| 文件 | 作用 |
|------|------|
| `src-tauri/tauri.conf.json` | Tauri 配置：标识、窗口、打包目标 `nsis`、资源映射（`server`/`public`/`node.exe`） |
| `src-tauri/src/main.rs` | 主进程：启动 Nitro sidecar、等待端口就绪、创建窗口；退出时自动杀掉子进程 |
| `src-tauri/Cargo.toml` | Rust 依赖与 release 优化配置 |
| `src-tauri/.cargo/config.toml` | GNU 目标的链接器配置（MinGW 用） |
| `scripts/prepare-tauri.mjs` | 打包前把当前 `node.exe` 复制到 `src-tauri/binaries/`（被 `beforeBuildCommand` 调用） |
| `scripts/gen-icon.mjs` | 生成占位图标（`icons/icon.png`、`icons/icon.ico`） |

## 资源打包细节

`tauri.conf.json` 的 `bundle.resources` 将以下目录/文件打进安装包：

- `../dist/output/server` → `server`（含 `index.mjs` 与打包后的 `node_modules`，含 `better-sqlite3` 原生模块）
- `../dist/output/public` → `public`（前端静态资源）
- `binaries/node.exe` → `node.exe`（由 `prepare-tauri.mjs` 生成，已在 `.gitignore` 中忽略）

运行时主进程以**资源目录为工作目录**拉起 `node.exe server/index.mjs`，Nitro 即在 `127.0.0.1:3000` 同时托管前端与 API。

## 替换正式图标

正式发布前，用真实 Logo 生成全套图标：

```bash
npx tauri icon path/to/logo.png
```

该命令会覆盖 `src-tauri/icons/` 下所有图标。

## 常见问题

- **`better-sqlite3` 报错 / 原生模块加载失败**：打包所用的 `node.exe` 版本必须与构建时 `better-sqlite3` 编译的 Node ABI 一致。
  确保构建机 Node 为 v24，并重新执行 `npm run build` 与 `prepare:tauri.mjs`。
- **链接器找不到（MinGW）**：确认 `gcc` 在 PATH，且 `rustup target add x86_64-pc-windows-gnu` 已执行。
- **`npm run build` 在清空 `dist` 时报错**：多见于特定 IDE 的安全删除拦截（如 CodeBuddy 的 `node-safe-delete-shim`），
  与项目无关；在本机普通终端执行即可正常通过。
