export type Metric = {
  label: string
  value: string
  tone: string
}

export type Panel = {
  title: string
  items: string[]
}

export type ResourceGroupItem = {
  configSetId: string
  path: string
  isActive: boolean
}

export type ResourceGroup = {
  type: string
  items: ResourceGroupItem[]
}

export type ConfigSetItem = {
  id: string
  name: string
  tool: string
  description: string
  resources: string[]
  isActive: boolean
}

export type ResourceItem = {
  id: string
  tool: string
  configSet: string
  path: string
  resources: string[]
}

export type BackupItem = {
  id: string
  tool: string
  configSet: string
  status: string
  createdAt: string
}

export type ToolConfig = {
  name: string
  configSets: {
    id: string
    tool: string
    path: string
    resources: string[]
    description?: string
  }[]
  resourceGroups: ResourceGroup[]
  actions?: {
    createStructureLabel: string
    activateLabel: string
  }
}

export type WorkspaceSnapshot = {
  workspace: {
    rootPath: string
    tools: ToolConfig[]
  }
  tools: ToolConfig[]
  currentTool: ToolConfig
  activeState: Record<string, string>
  backups: BackupItem[]
  dashboard: {
    theme: string
    shell: {
      title: string
      subtitle: string
      navigation: string[]
    }
    hero: {
      activeWorkspace: string
      status: string
      summary: string
    }
    metrics: Metric[]
    panels: Panel[]
  }
  pages: {
    profiles: {
      title: string
      items: ConfigSetItem[]
    }
    resources: {
      title: string
      items: ResourceItem[]
    }
    backups: {
      title: string
      items: BackupItem[]
    }
  }
}
