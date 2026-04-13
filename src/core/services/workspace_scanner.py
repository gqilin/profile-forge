from __future__ import annotations

import shutil
from pathlib import Path

from src.core.models.entities import ConfigSet, ToolConfig


class WorkspaceScanner:
    RESOURCE_DIRS = ("commands", "mcp", "rules", "skills")

    def __init__(self, root_path: Path):
        self.root_path = Path(root_path)

    def scan(self) -> dict:
        ai_configs_path = self.root_path / "ai-configs"
        tools: list[dict] = []

        if ai_configs_path.exists():
            for tool_dir in sorted([item for item in ai_configs_path.iterdir() if item.is_dir()], key=lambda item: item.name):
                config_sets: list[ConfigSet] = []
                for config_dir in sorted([item for item in tool_dir.iterdir() if item.is_dir()], key=lambda item: item.name):
                    resources = sorted(
                        resource_dir.name
                        for resource_dir in config_dir.iterdir()
                        if resource_dir.is_dir() and resource_dir.name in self.RESOURCE_DIRS
                    )
                    config_sets.append(
                        ConfigSet(
                            id=config_dir.name,
                            tool=tool_dir.name,
                            path=str(config_dir),
                            resources=resources,
                        )
                    )

                tool_payload = ToolConfig(name=tool_dir.name, config_sets=config_sets).to_dict()
                tool_payload["resourceGroups"] = self._build_resource_groups(tool_payload)
                tools.append(tool_payload)

        return {"rootPath": str(self.root_path), "tools": tools}

    def create_tool_structure(self, tool_name: str) -> Path:
        tool_dir = self.root_path / "ai-configs" / tool_name
        tool_dir.mkdir(parents=True, exist_ok=True)
        return tool_dir

    def create_config_set_structure(self, tool_name: str, config_set_id: str) -> Path:
        config_set_dir = self.create_tool_structure(tool_name) / config_set_id
        config_set_dir.mkdir(parents=True, exist_ok=True)
        for resource_dir in self.RESOURCE_DIRS:
            (config_set_dir / resource_dir).mkdir(parents=True, exist_ok=True)
        return config_set_dir

    def rename_tool(self, old_name: str, new_name: str) -> Path:
        old_dir = self.root_path / "ai-configs" / old_name
        new_dir = self.root_path / "ai-configs" / new_name
        if old_dir.exists():
            old_dir.rename(new_dir)
        else:
            new_dir.mkdir(parents=True, exist_ok=True)
        return new_dir

    def delete_tool(self, tool_name: str) -> None:
        tool_dir = self.root_path / "ai-configs" / tool_name
        if tool_dir.exists():
            shutil.rmtree(tool_dir)

    def _build_resource_groups(self, tool_payload: dict) -> list[dict]:
        groups: list[dict] = []
        for resource_type in self.RESOURCE_DIRS:
            items = []
            for config_set in tool_payload["configSets"]:
                if resource_type in config_set["resources"]:
                    items.append(
                        {
                            "configSetId": config_set["id"],
                            "path": str(Path(config_set["path"]) / resource_type),
                            "isActive": False,
                        }
                    )
            if items:
                groups.append({"type": resource_type, "items": items})
        return groups
