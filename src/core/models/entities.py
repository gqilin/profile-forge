from __future__ import annotations

from dataclasses import dataclass, field
from datetime import UTC, datetime


def utc_now() -> str:
    return datetime.now(UTC).isoformat()


@dataclass(slots=True)
class ConfigSet:
    id: str
    tool: str
    path: str
    resources: list[str]
    description: str = ""

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "tool": self.tool,
            "path": self.path,
            "resources": self.resources,
            "description": self.description,
        }


@dataclass(slots=True)
class ToolConfig:
    name: str
    config_sets: list[ConfigSet]

    def to_dict(self) -> dict:
        return {
            "name": self.name,
            "configSets": [config_set.to_dict() for config_set in self.config_sets],
        }


@dataclass(slots=True)
class Workspace:
    root_path: str
    tools: list[ToolConfig]

    def to_dict(self) -> dict:
        return {
            "rootPath": self.root_path,
            "tools": [tool.to_dict() for tool in self.tools],
        }


@dataclass(slots=True)
class ActivationRecord:
    workspace: str
    active: dict[str, str]
    updated_at: str = field(default_factory=utc_now)

    def to_dict(self) -> dict:
        return {
            "workspace": self.workspace,
            "active": self.active,
            "updatedAt": self.updated_at,
        }


@dataclass(slots=True)
class BackupRecord:
    id: str
    tool: str
    config_set: str
    status: str
    backup_path: str
    created_at: str = field(default_factory=utc_now)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "tool": self.tool,
            "configSet": self.config_set,
            "status": self.status,
            "backupPath": self.backup_path,
            "createdAt": self.created_at,
        }
