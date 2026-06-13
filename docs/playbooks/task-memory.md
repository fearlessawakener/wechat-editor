# Task Memory Playbook

这个 playbook 定义如何记录 task memory

task memory 用于保留每次 agent work 的上下文、结果和后续信息

## When to Use

只有以下 task 完成后，才创建或更新 task memory：

1. 实质性代码实现
2. bug fix
3. 重构或功能变更
4. 多步骤任务中产生了后续需要延续的重要 context
5. task 产生了重要 decision

## File Location

task memory 存放在：

```text
docs/tasks/
```

文件名格式：

```text
YYYY-MM-DD-task-slug.md
```

Examples:

```text
docs/tasks/2026-06-04-add-billing-webhook.md
docs/tasks/2026-06-05-refactor-payment-service.md
```

## Writing Style

中文表达需求、规则和说明

英文保留 technical terms、paths、commands、code concepts

## Required Sections

```md
# Task: <task title>

## Goal

说明本次 task 要解决什么问题

## Context

记录本次 task 读取过的关键 context

包括 relevant docs、files、existing patterns、constraints

## Files Changed

列出 changed files

## Validation

记录已执行的项目规定验证方式

## Not Validated

记录未验证的内容和原因

## Decisions

记录本次 task 中产生的 decision

如果 decision 是 durable project knowledge，需要写回相关 docs

## Follow-ups

记录后续建议、风险或未完成事项
```
