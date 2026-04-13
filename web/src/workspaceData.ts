import type { WorkspaceSnapshot } from './types/workspace'

export const workspaceData: WorkspaceSnapshot = {
  workspace: {
    rootPath: 'H:/workspace/demo',
    tools: [],
  },
  tools: [
    {
      name: 'codex',
      configSets: [
        {
          id: 'default',
          tool: 'codex',
          path: 'H:/workspace/demo/ai-configs/codex/default',
          resources: ['rules'],
        },
      ],
      resourceGroups: [
        {
          type: 'rules',
          items: [
            {
              configSetId: 'default',
              path: 'H:/workspace/demo/ai-configs/codex/default/rules',
              isActive: true,
            },
          ],
        },
      ],
      actions: {
        createStructureLabel: '创建配置文件夹结构',
        activateLabel: '切换到当前组',
      },
    },
    {
      name: 'cursor',
      configSets: [
        {
          id: 'frontend',
          tool: 'cursor',
          path: 'H:/workspace/demo/ai-configs/cursor/frontend',
          resources: ['commands'],
        },
      ],
      resourceGroups: [
        {
          type: 'commands',
          items: [
            {
              configSetId: 'frontend',
              path: 'H:/workspace/demo/ai-configs/cursor/frontend/commands',
              isActive: false,
            },
          ],
        },
      ],
      actions: {
        createStructureLabel: '创建配置文件夹结构',
        activateLabel: '切换到当前组',
      },
    },
    {
      name: 'factory',
      configSets: [
        {
          id: 'design',
          tool: 'factory',
          path: 'H:/workspace/demo/ai-configs/factory/design',
          resources: ['mcp', 'skills'],
        },
      ],
      resourceGroups: [
        {
          type: 'mcp',
          items: [
            {
              configSetId: 'design',
              path: 'H:/workspace/demo/ai-configs/factory/design/mcp',
              isActive: true,
            },
          ],
        },
        {
          type: 'skills',
          items: [
            {
              configSetId: 'design',
              path: 'H:/workspace/demo/ai-configs/factory/design/skills',
              isActive: true,
            },
          ],
        },
      ],
      actions: {
        createStructureLabel: '创建配置文件夹结构',
        activateLabel: '切换到当前组',
      },
    },
  ],
  currentTool: {
    name: 'codex',
    configSets: [
      {
        id: 'default',
        tool: 'codex',
        path: 'H:/workspace/demo/ai-configs/codex/default',
        resources: ['rules'],
      },
    ],
    resourceGroups: [
      {
        type: 'rules',
        items: [
          {
            configSetId: 'default',
            path: 'H:/workspace/demo/ai-configs/codex/default/rules',
            isActive: true,
          },
        ],
      },
    ],
    actions: {
      createStructureLabel: '创建配置文件夹结构',
      activateLabel: '切换到当前组',
    },
  },
  activeState: {
    codex: 'default',
    factory: 'design',
  },
  backups: [
    {
      id: 'factory-design-snapshot-001',
      tool: 'factory',
      configSet: 'design',
      status: 'available',
      createdAt: '2026-04-13T16:30:00+00:00',
    },
  ],
  dashboard: {
    theme: 'system',
    shell: {
      title: 'AI Config Workspace Manager',
      subtitle: '按工具分组、按资源组导航的本地 AI 工作区激活器',
      navigation: ['总览', '工具', '资源组', '备份'],
    },
    hero: {
      activeWorkspace: 'H:/workspace/demo',
      status: '可立即激活',
      summary: '顶部切换开发工具，左侧切换资源组，右侧查看并激活当前工具下的配置。',
    },
    metrics: [
      { label: '工具数', value: '3', tone: 'neutral' },
      { label: '资源组', value: '4', tone: 'neutral' },
      { label: '备份数', value: '1', tone: 'neutral' },
    ],
    panels: [
      {
        title: '激活流程',
        items: ['切换开发工具', '创建目录结构', '选择资源组', '执行真实激活'],
      },
      {
        title: '当前激活',
        items: ['codex: default', 'factory: design'],
      },
      {
        title: '支持工具',
        items: ['codex', 'cursor', 'factory'],
      },
    ],
  },
  pages: {
    profiles: {
      title: '配置集',
      items: [
        {
          id: 'codex-default',
          name: 'default',
          tool: 'codex',
          description: '',
          resources: ['rules'],
          isActive: true,
        },
      ],
    },
    resources: {
      title: '资源覆盖',
      items: [
        {
          id: 'codex-default',
          tool: 'codex',
          configSet: 'default',
          path: 'H:/workspace/demo/ai-configs/codex/default',
          resources: ['rules'],
        },
      ],
    },
    backups: {
      title: '备份',
      items: [
        {
          id: 'factory-design-snapshot-001',
          tool: 'factory',
          configSet: 'design',
          status: 'available',
          createdAt: '2026-04-13T16:30:00+00:00',
        },
      ],
    },
  },
}

workspaceData.workspace.tools = workspaceData.tools
