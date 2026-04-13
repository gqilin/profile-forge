export type Metric = {
  label: string
  value: string
  tone: string
}

export type Panel = {
  title: string
  items: string[]
}

export type ProfileItem = {
  id: string
  name: string
  description: string
  bundles: string[]
  activationMode: string
}

export type ResourceItem = {
  id: string
  name: string
  platform: string
  type: string
  managedPath: string
}

export type BackupItem = {
  id: string
  profileId: string
  status: string
  createdAt: string
}

export type WorkspaceSnapshot = {
  dashboard: {
    theme: string
    shell: {
      title: string
      subtitle: string
      navigation: string[]
    }
    hero: {
      activeProfile: string
      status: string
      summary: string
    }
    metrics: Metric[]
    panels: Panel[]
  }
  pages: {
    profiles: {
      title: string
      items: ProfileItem[]
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
