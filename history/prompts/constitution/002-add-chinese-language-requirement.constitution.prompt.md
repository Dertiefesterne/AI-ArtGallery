---
id: 002
title: 添加中文语言规范到项目治理文档
stage: constitution
date: 2026-01-18
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: user
command: 对话交互
labels: ["constitution","language","governance"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md（添加文档与沟通规范）
  - CLAUDE.md（完全翻译为中文并添加语言规范）
tests:
  - 无（宪法更新不需要测试）
---

## Prompt

"以后所有的文档及输入都要使用中文"，这条规则需要写在哪个文件里可以在这个项目中永久生效。

## Response snapshot

已成功将中文语言规范添加到两个关键文件：

**1. `.specify/memory/constitution.md`**
- 在"III. 代码规范与质量标准"部分添加了"文档与沟通规范"小节
- 明确规定所有项目文档必须使用中文编写
- 列出适用范围：所有 .md 文档、代码注释、Git 提交信息、PR 描述等
- 说明代码标识符仍使用英文（遵循行业标准）

**2. `CLAUDE.md`（Agent 运行时指导）**
- 将整个文件从英文翻译为中文
- 在文件开头添加"📌 语言规范（不可协商）"部分
- 明确区分使用中文和使用英文的内容场景
- 规范 agent 的所有输出和文档生成行为

这两个文件的更新确保：
- Constitution 确立了项目级别的中文文档规范
- CLAUDE.md 指导 agent 在所有操作中遵循中文输出规则
- 双重保障确保规则永久生效且得到执行

## Outcome

- ✅ Impact: 成功建立项目级别的中文语言规范，覆盖所有文档和沟通场景
- 🧪 Tests: 无（宪法和治理文档更新不需要测试）
- 📁 Files: 更新了 .specify/memory/constitution.md 和 CLAUDE.md
- 🔁 Next prompts: 所有后续的 spec、plan、tasks、ADR 等文档都将使用中文
- 🧠 Reflection: 通过在宪法和 agent 运行时指导两个层面同时添加规范，确保规则得到全面执行。这是项目治理的最佳实践

## Evaluation notes (flywheel)

- Failure modes observed: 无
- Graders run and results (PASS/FAIL): N/A
- Prompt variant: N/A
- Next experiment: N/A（语言规范已确立，无需进一步实验）
