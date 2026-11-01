# Kasuslabor 开发与维护指南

本文面向未来的开发者和 AI 编程助手，目标是让维护者快速理解项目结构、状态模型和内容约束。

## 1. 技术概览

- React 19 + TypeScript + Vite。
- 样式集中在一个原生 CSS 文件中，没有 CSS 框架。
- 图标来自 `lucide-react`。
- 纯前端、离线优先；没有后端、账号、数据库、分析脚本或运行时外部接口。
- 页面不使用路由库。`App.tsx` 中的 `activeView` 决定当前唯一显示的主视图。
- 浏览器宽度 `860px` 是桌面固定目录与手机抽屉目录的主要断点。

常用命令：

```powershell
npm install
npm run dev
npm run build
npm run preview
```

提交前至少执行 `npm run build`。它同时运行 TypeScript 构建检查和 Vite 生产构建。

## 2. 目录结构

```text
.
├─ docs/
│  └─ DEVELOPMENT.md       # 本文
├─ src/
│  ├─ App.tsx              # 应用外壳、目录、首页、自由练习台、全局状态
│  ├─ Course.tsx           # 基础框架与四格单元
│  ├─ Governors.tsx        # 动词和介词支配
│  ├─ Forms.tsx            # 冠词、形容词、代词和名词变化
│  ├─ Sentences.tsx        # 语序、被动、关系从句和综合诊断
│  ├─ Reference.tsx        # 速查、搜索、词形矩阵和收藏
│  ├─ PhaseActions.tsx     # 阶段末尾的返回标签区/进入下一阶段按钮
│  ├─ main.tsx             # React 入口
│  └─ styles.css           # 全站样式与响应式规则
├─ index.html
├─ package.json
├─ tsconfig*.json
└─ vite.config.ts
```

`node_modules/`、`dist/` 和 `*.tsbuildinfo` 都是可重新生成的文件，已由 `.gitignore` 排除。

## 3. 页面与导航模型

`AppView` 包含：

- `overview`：课程首页与完整学习地图；
- `phase2`–`phase5`：四个互斥的课程阶段；
- `practice`：不属于课程阶段的自由练习台；
- `reference`：速查与复习。

页面主体一次只渲染一个视图，避免把所有阶段堆成超长页面。目录中的课程单元通过 `selectUnit()` 同时更新：

1. 当前单元；
2. 对应阶段的活动标签；
3. 当前主视图；
4. 本机学习进度。

首页、自由练习台和速查页不应让任何课程单元处于选中状态。自由练习台与速查页只高亮各自的快捷入口。

## 4. 学习进度和本地数据

本项目使用三个 `localStorage` 键：

| 键 | 内容 | 清除方式 |
|---|---|---|
| `kasuslabor-language` | `both`、`zh` 或 `de` | 更改语言或清除网站数据 |
| `kasuslabor-progress` | 已打开课程单元 ID 的数组 | 目录中的“重置”按钮 |
| `kasuslabor-favorites` | 速查卡片 ID 的数组 | 取消收藏或清除网站数据 |

课程目前有 17 个单元。单元 ID 由 `unitGroups` 汇总为 `courseUnitIds`，进度总数不应手写。打开一个单元即视为“已学习”；重复打开不会重复计数。重置进度不能影响语言和收藏。

如果新增课程单元：

1. 在对应阶段组件中扩展单元联合类型、元数据和内容渲染；
2. 在 `App.tsx` 的 `unitGroups` 中加入目录项；
3. 在 `selectUnit()` 中把新 ID 映射到正确阶段；
4. 检查阶段末尾按钮的“最后一个单元”条件；
5. 验证进度总数、目录选中状态和本地存储恢复。

## 5. 双语内容约定

全局模式是 `both | zh | de`。短标签使用 `uiText(mode, zh, de)`；段落使用各文件中的 `Bilingual` 组件。德语例句属于学习对象，即使选择“仅中文”也应保留。

写作原则：

- 先展示句子关系，再命名规则，最后核对词形。
- 中文负责建立直觉，德语保持短句和正式术语；两种语言表达同一知识点，但不要求逐字翻译。
- 不把 Akkusativ 简化成“直接宾语的格”，也不把 Dativ 简化成“接收者的格”。
- 双向介词判断目标/方向与所在位置，不能写成“有移动就用 Akkusativ”。
- 不用语序直接判断格；必须结合动词、介词、句法关系和形式信号。
- 所有颜色提示同时配有文字、缩写或图标，不能只靠颜色表达语法含义。

语法事实优先核对 [IDS grammis](https://grammis.ids-mannheim.de/)，教学难度可参考 [Goethe-Institut](https://www.goethe.de/) 的分级材料。不要复制来源中的整段文字、表格或练习题；网站讲解和例句应重新组织。

## 6. 组件与样式约定

- 四格的固定语义色为：Nominativ 蓝、Akkusativ 珊瑚红、Dativ 绿、Genitiv 紫。
- 课程阶段的内容容器分别使用 `course-paper`、`governors-paper`、`forms-paper`、`sentences-paper`。
- 每个阶段的标签区和 `PhaseActions` 选择器必须保持对应，确保“回到本阶段单元标签”能正确滚动。
- 最后一个标签显示“进入下一阶段”，其他标签只显示返回标签区按钮。
- 新交互必须使用原生按钮、标签语义和清晰的键盘焦点；不要用不可聚焦的 `div` 模拟按钮。
- 复杂教学图形优先使用 HTML/CSS 或代码生成的 SVG，以便响应式排版和无障碍阅读。

## 7. 第三方资源

当前只使用 Lucide 图标，没有复制外部语法图表或插画。引入新素材前必须确认许可证、记录来源，并优先考虑它是否真正改善学习体验。许可信息统一维护在根目录的 `THIRD_PARTY_NOTICES.md`。
