import type { WorkspaceSnapshot } from './types/workspace'

export const workspaceData: WorkspaceSnapshot = {
  dashboard: {
    theme: 'system',
    shell: {
      title: 'profileForge',
      subtitle: '面向 Factory、Codex、Cursor 的 Profile 优先编排中心',
      navigation: ['总览', '配置档案', '资源包', '资源', '备份', '设置'],
    },
    hero: {
      activeProfile: '设计模式',
      status: '可立即激活',
      summary: '围绕受管目标、预演检查、自动备份与回滚机制，实现快速而安全的配置切换。',
    },
    metrics: [
      { label: '受管目标', value: '12', tone: 'neutral' },
      { label: '资源包', value: '8', tone: 'neutral' },
      { label: '警告', value: '1', tone: 'warning' },
    ],
    panels: [
      {
        title: '激活预览',
        items: [
          '校验受管目标',
          '复制平台资源',
          '注册 MCP 绑定',
          '应用命令与环境变量',
        ],
      },
      {
        title: '平台覆盖',
        items: ['Factory', 'Codex', 'Cursor'],
      },
      {
        title: '安全控制',
        items: ['仅允许写入受管目标', '应用前先执行预演', '自动创建备份', '支持失败回滚'],
      },
    ],
  },
  pages: {
    profiles: {
      title: '配置档案',
      items: [
        {
          id: 'design',
          name: '设计模式',
          description: '用于界面设计与设计协作的工作流',
          bundles: ['Factory 设计资源包'],
          activationMode: 'copy',
        },
      ],
    },
    resources: {
      title: '资源',
      items: [
        {
          id: 'factory-skills',
          name: 'Factory 技能集',
          platform: 'factory',
          type: 'skills',
          managedPath: 'C:/Users/Admin/.factory/skills',
        },
      ],
    },
    backups: {
      title: '备份',
      items: [
        {
          id: 'snapshot-001',
          profileId: 'design',
          status: '可恢复',
          createdAt: '2026-04-13T16:30:00+00:00',
        },
      ],
    },
  },
}
