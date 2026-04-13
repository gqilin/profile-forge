from __future__ import annotations

from pathlib import Path

from src.core.models.entities import ConfigSet, ToolConfig, Workspace


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
