---
id: 001
title: AI Art Gallery 项目宪法初始化
stage: constitution
date: 2026-01-18
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: user
command: /sp.constitution
labels: ["constitution","tech-stack","governance"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - 无（宪法更新不需要测试）
---

## Prompt

运行环境：Node.js ≥ 18，包管理器仅限 pnpm（需提交 pnpm-lock.yaml）。
技术栈锁定：React 18.2 + TypeScript 5（strict 模式）+ Three.js r160 + @react-three/fiber 8 + Zustand 4；禁止升级或引入额外框架。
样式与 UI：Tailwind CSS 3.4 + Ant Design 6.0；不引入其他组件库或预处理器。
构建工具：Vite 5，输出目录 dist，base 路径 "/"，静态资源放 public。
目录结构：src/ 下只能有 components、pages、stores、hooks、utils、libs、assets、styles；不得新增额外文件夹。
代码规范：ESLint + Prettier 自动格式化，执行 pnpm run lint:fix 必须 0 错误。
3D 红线：单 glb/gltf ≤ 5 MB、draw call ≤ 100、帧率锁 60 FPS、Draco 压缩必开；超大模型走 CDN 并带加载提示。
限制范围：纯前端演示，无 SSR、无后端、无 CSP、无审计；仅运行在浏览器本地环境

## Response snapshot

已成功创建 AI Art Gallery 项目宪法文档（v1.0.0），包含以下核心内容：

**七大核心原则（全部标记为"不可协商"）：**
1. 技术栈锁定 - 详细规定了所有依赖的精确版本
2. 包管理与依赖规范 - 强制使用 pnpm
3. 代码规范与质量标准 - TypeScript strict 模式、ESLint、Prettier
4. 3D 性能红线 - 模型大小、draw call、帧率限制
5. 项目结构与目录约束 - src/ 目录结构强制规范
6. 构建与部署规范 - Vite 5、纯前端演示
7. 依赖引入与扩展原则 - 控制依赖膨胀的评估标准

**附加章节：**
- 项目范围定义（在范围内/不在范围内）
- 开发流程规范（分支管理、提交规范、代码审查）
- 质量保证（测试策略、性能监控、错误处理）
- 治理原则（修订流程、版本控制、合规性审查、ADR）

所有文档内容已使用中文编写，符合用户要求。

## Outcome

- ✅ Impact: 成功建立项目治理框架，为所有后续开发提供明确的技术约束和指导原则
- 🧪 Tests: 无（宪法更新不需要测试）
- 📁 Files: 创建/更新 .specify/memory/constitution.md（v1.0.0）
- 🔁 Next prompts: 建议后续进行项目初始化和基础结构搭建
- 🧠 Reflection: 宪法涵盖了所有用户提出的技术约束，组织清晰、可执行性强。所有原则都明确标记为"不可协商"，为团队提供强力的技术决策依据

## Evaluation notes (flywheel)

- Failure modes observed: 无
- Graders run and results (PASS/FAIL): N/A
- Prompt variant: N/A
- Next experiment: 宪法已建立完整的技术约束体系，建议在首次功能开发时验证这些原则的实际执行效果
