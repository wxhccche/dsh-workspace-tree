# Workspace Tree（工作区树）

一个 DSH Web UI 插件，把侧栏中的会话组织成可嵌套的自定义目录。

DSH 自带的侧栏把每个工作区与其会话平铺在一起。Workspace Tree 替换这块浏览区，沿用完全一致的视觉规范（行高、缩进、hover 底色、16 px 图标按钮），并在每个工作区下方增加一棵目录树：新建目录与子目录、把会话拖进目录、把目录移到其他工作区，以及把会话删除到可恢复的回收目录。

[English](./README.md)

## 功能

- **按工作区分组的嵌套目录。** 层数不限，可折叠，支持就地重命名输入框。
- **拖拽归类。** 会话可拖入目录、拖到其他工作区或工作区根目录；目录可以改换父级，跨工作区拖动目录时会话随之移动。目录不会接受自己的子孙作为目标。
- **就地操作会话。** 双击标题或按 `F2` 重命名，另有复制会话 ID、Fork、归档、删除，以及通过子菜单移动到某个目录或工作区。
- **活动状态可见。** 智能体正在运行时标题左侧显示蓝色转圈，一轮结束且尚未打开时显示绿色勾。
- **行级键盘可达。** 每一行都可聚焦，响应 `Enter` / `Space`；目录行还响应 `ArrowLeft` / `ArrowRight` 折叠与展开。
- **可恢复的删除。** DSH 没有删除 API，因此 Host 半边把会话目录移入 `<DSH_HOME>/session-trash`，而不是直接抹掉。
- **按工作区启用。** 未启用插件的工作区退化为平铺、按最近更新排序的会话列表，没有目录，也不能拖拽。
- **插件详情页。** 可勾选启用插件的工作区、查看并清空回收目录；卸载前还可以给会话标题加上工作区名前缀，保证移除插件后仍能看出分组。
- **自动还原。** 卸载前记录的前缀会在插件下次加载时精确去除。

## 环境要求

- 带 Web UI 的 DSH（`dsh.client.platform` 为 `web`）。
- 侧栏需要提供 `sidebar.workspaces` 槽位，DSH 的浏览器插件已提供。
- 开发与语法检查需要 Node.js 22 或更高版本。

## 安装

### 从 npm 安装

```sh
dsh plugin install @wxhccc/dsh-workspace-tree
```

### 从 GitHub 安装

```sh
dsh plugin install github:wxhccche/dsh-workspace-tree
```

### 从本地目录安装

```sh
git clone git@github.com:wxhccche/dsh-workspace-tree.git
dsh plugin install /absolute/path/to/dsh-workspace-tree
```

包名为 `@wxhccc/dsh-workspace-tree`，因此客户端模块 id、bundle patch 与插件设置页的键都指向同一个标识。三种安装源可以互换；npm 方式不需要 Git 访问。安装时无需构建：`client.js` 已随包提供。

### 修改后的重新加载

浏览器端产物在 profile 启动时加载。修改 `client.js` 后需要移除并重新安装 bundle，然后刷新页面：

```text
plugin_manager remove_bundle  target: @wxhccc/dsh-workspace-tree
plugin_manager install_bundle target: <插件目录的绝对路径>
```

## 使用

### 工作区行

行内以半粗体显示工作区名称，并配工作区树图标，与下方的目录行区分开；开头的箭头表示折叠状态，且固定占位、不再与图标互换。`...` 菜单包含「添加目录」与「重命名工作区」；行末的 `+` 在该工作区新建会话。

### 目录行

`...` 菜单包含「添加子目录」「重命名」「删除」「移动到」。删除目录会连同整棵子树一起移除，其中的会话回到工作区根目录而不会消失。行末的 `+` 直接在该目录内新建一个空白会话。

### 会话行

单击打开，双击标题重命名，拖拽重新归类。`...` 菜单包含「重命名」「复制会话 ID」「Fork」「归档」「删除」「移动到」。空白会话只有在它是当前打开的那一个时才显示菜单。

标题左侧的图标表示活动状态：智能体正在运行时是蓝色转圈，一轮结束且结果尚未打开时是绿色勾。打开该会话后绿勾消失，与内置会话列表的规则一致。

### 拖拽规则

| 拖动对象 | 放置位置 | 结果 |
|---|---|---|
| 会话 | 目录行 | 加入该目录 |
| 会话 | 工作区行或空白处 | 移到该工作区根目录 |
| 目录 | 目录行 | 成为目标目录的子目录 |
| 目录 | 工作区行或空白处 | 移到该工作区根目录 |

### 插件详情页

打开 **Settings → Plugins → Workspace Tree**，页面包含三个区块：

- **应用插件的工作区** —— 每个工作区一个勾选框。取消勾选后该工作区变为平铺列表。
- **已删除会话** —— 显示 `<DSH_HOME>/session-trash` 中的会话数量与占用空间，并提供清空按钮。
- **卸载前的会话名** —— 给启用插件的工作区内的所有会话标题加上 `[<工作区目录名>] ` 前缀，使移除插件后仍能看出分组。

## 配置

插件没有 `Config` schema，所有状态都保存在浏览器中，与应用自身的界面状态放在一起。

| `localStorage` 键 | 内容 |
|---|---|
| `dsh.workspace-tree.store.v2` | `{ v: 2, byWorkspace: { [wsKey]: { folders: [{ id, name, parentId }] } }, placements: { [sessionId]: { workspaceId, folderId } } }` |
| `dsh.workspace-tree.settings.v1` | `{ disabled: string[] }` —— 只记录被取消勾选的工作区 |
| `dsh.workspace-tree.prefixed.v1` | `{ [sessionId]: "[目录名] " }` —— 卸载前添加的前缀 |
| `dsh.workspace-tree.folders.v1` | 旧版 v1 结构，读取一次后迁移进 `placements` |

`placements` 同时表达「位于某个目录」与「已移动到其他工作区」。会话的真实工作区仍由 DSH 依据其工作目录推导；删除该记录即回到会话自己的工作区根目录。

## HTTP 接口

Host 半边（`index.js`）在 DSH Web 服务器上注册 4 条精确路由。全部返回 JSON，并要求同源请求；带 `sec-fetch-site: cross-site` 的请求会以 `403 cross-site-request` 拒绝。

| 方法 | 路径 | 说明 |
|---|---|---|
| `POST` | `/workspace-tree/sessions/delete` | 把会话目录移入 `<DSH_HOME>/session-trash/<id>-<timestamp>` 并清理其投影缓存；删除前会二次确认，运行中或正打开的会话会被拒绝。 |
| `POST` | `/workspace-tree/sessions/model` | 为新会话补选模型，优先 `catalog.default`，否则取第一个可用项。 |
| `GET` | `/workspace-tree/trash` | 返回回收目录的 `{ ok, count, bytes }`。 |
| `POST` | `/workspace-tree/trash/clear` | 删除回收目录下的所有目录，返回 `{ ok, removed }`。 |

请求体上限为 4 KiB，会话标识必须匹配 `/^session-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`。

错误响应带有稳定的错误码：`method-not-allowed`、`bad-body`、`bad-session-id`、`missing-dsh-home`、`missing-session-controller`、`scan-failed`、`move-failed`、`catalog-failed`、`no-model`、`select-failed`、`clear-failed`、`cross-site-request`。从未写入磁盘的会话返回 `{ ok: true, missing: true }` 而不是错误——它没有目录需要移动。

## 实现方式

Workspace Tree 为 `sidebar.workspaces` 槽位注册了一个替代实现。single 槽位按 priority 升序渲染第一个未被退位的条目，因此插件以 `priority: -1` 注册，压过内置浏览区的 `0`。渲染数据来自槽位的 selector hook：`props.useWorkspaces((state) => state)` 与 `props.useSessions((state) => state)`。

配置块通过 keyed 槽位 `plugins.bundle.config` 贡献，分别以包名与 patch id 各注册一次。

完整的契约说明见 [docs/architecture.md](./docs/architecture.md)：使用了哪些 DSH 服务、会话目录与投影缓存路径如何推导、以及如何验证一次改动。

这些契约的 DSH 一侧由 DSH 自己的文档定义：安装包内附带 `docs/subsystems/`（`client-modules.md` 讲 bundle 加载器，`session.md` 与 `persistence.md` 讲落盘布局，`web-server.md` 讲路由），公开站点 [deepseek-harness.github.io](https://deepseek-harness.github.io/deepseek-harness/) 是同一批页面的镜像。查这些页面与 `cordis_inspect_*` 比读编译产物可靠。

## 限制

- 替换内置浏览区后，其搜索框、归档视图、固定（pin）以及内置的工作区嵌套树也随之消失；插件提供会话列表、目录分组与上述会话操作。
- 目录分组与跨工作区移动是保存在 `localStorage` 中的渲染状态，不会写回会话文件，不跨浏览器同步，也不会修改会话的工作目录。
- 删除会话只在本页面临时隐藏，刷新后与磁盘一致；回收目录不会自动清理。
- 会话正在使用时不允许删除，需先关闭再重试。
- 会话行显示运行中与已完成两种状态，但不复刻内置的 hover 卡片、子智能体计数与「等待审批」状态。

## 开发

```sh
npm install      # 只装一个开发依赖 esbuild
npm run build    # 把 src/client 打包成 client.js
npm run check    # 语法检查 + Host 回归测试 + 文案键审计
npm test         # 只跑 Host 回归测试
```

| 路径 | 用途 |
|---|---|
| `index.js` | Host 入口：路由表、注册与 `apply`。 |
| `client.js` | 生成的浏览器 bundle。已提交，安装时无需构建，请勿手工修改。 |
| `src/client/` | 客户端源码：入口、文案字典、样式、存储、组件与 `Region` 的 selector。 |
| `lib/` | Host 侧工具（`http`、`paths`）与路由处理函数。 |
| `build.mjs` | esbuild 包装脚本，把 bundle 包进 `window.__ModuleLoader__.load` 工厂。 |
| `test/host.test.mjs` | 基于临时 `DSH_HOME` 的路由级测试。 |
| `test/client.test.mjs` | 用桩模块在 DSH 之外渲染构建产物，锁定插槽注册、文案键与会话可见性规则。 |
| `scripts/audit-i18n.mjs` | 发现未使用或缺失的文案键时报错。 |

客户端 bundle 通过 `window.__ModuleLoader__.load({ id, factory(require) })` 自我注册，并用 `React.createElement` 构建 DOM。DSH 的模块加载器只解析完整 bundle，因此源码用 esbuild 打包成单文件，而不是在运行时拆分。Host 半边是普通的 ESM 模块，导出 `inject` 与 `apply`，在 `ctx.effect(...)` 内调用 `ctx.webServer.register(...)` 注册路由，随插件一同销毁。

### 发布

```sh
npm version <patch|minor|major>   # 更新 package.json 并打标签
npm publish                       # 发布 @wxhccc/dsh-workspace-tree
```

`prepublishOnly` 会在打包前重新构建 `client.js` 并执行 `npm run check`，因此产物过期或测试失败都会阻止发布。`publishConfig.access` 设为 `public`，因为作用域包的默认可见性是 restricted。打标签前记得补上对应的 `CHANGELOG.md` 条目。

格式遵循仓库中的 `.prettierrc`：不加分号、单引号、无尾逗号。

## 许可证

[MIT](./LICENSE) © 2026 wxhccche
