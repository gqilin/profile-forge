import json
from pathlib import Path

from src.core.models.entities import Workspace, ToolConfig, ConfigSet
from src.core.services.activation import ActivationService
from src.core.services.repository import AppRepository, bootstrap_sample_data
from src.core.storage.json_store import JsonStore
from src.ui.app import build_dashboard_view
from src.core.services.workspace_scanner import WorkspaceScanner


def test_workspace_entities_serialize_to_new_contract(tmp_path: Path):
    workspace = Workspace(
        root_path=str(tmp_path),
        tools=[
            ToolConfig(
                name="factory",
                config_sets=[
                    ConfigSet(
                        id="design",
                        tool="factory",
                        path=str(tmp_path / "ai-configs" / "factory" / "design"),
                        resources=["skills", "mcp"],
                    )
                ],
            )
        ],
    )

    payload = workspace.to_dict()

    assert payload["rootPath"] == str(tmp_path)
    assert payload["tools"][0]["name"] == "factory"
    assert payload["tools"][0]["configSets"][0]["resources"] == ["skills", "mcp"]


def test_workspace_scanner_discovers_tools_and_config_sets(tmp_path: Path):
    base = tmp_path / "ai-configs" / "factory" / "design"
    (base / "skills").mkdir(parents=True)
    (base / "mcp").mkdir()

    scanner = WorkspaceScanner(tmp_path)
    snapshot = scanner.scan()

    assert snapshot["rootPath"] == str(tmp_path)
    assert snapshot["tools"][0]["name"] == "factory"
    assert snapshot["tools"][0]["configSets"][0]["id"] == "design"
    assert snapshot["tools"][0]["resourceGroups"][0]["type"] == "mcp"
    assert snapshot["tools"][0]["resourceGroups"][1]["items"][0]["configSetId"] == "design"


def test_workspace_scanner_manage_tool_directories(tmp_path: Path):
    scanner = WorkspaceScanner(tmp_path)
    scanner.create_tool_structure("factory")
    scanner.rename_tool("factory", "factory-pro")
    scanner.create_tool_structure("cursor")
    scanner.delete_tool("cursor")

    assert (tmp_path / "ai-configs" / "factory-pro").exists()
    assert not (tmp_path / "ai-configs" / "cursor").exists()


def test_workspace_scanner_create_standard_group_structure(tmp_path: Path):
    scanner = WorkspaceScanner(tmp_path)
    created = scanner.create_config_set_structure("codex", "default")

    assert (created / "skills").exists()
    assert (created / "mcp").exists()
    assert (created / "rules").exists()
    assert (created / "commands").exists()


def test_activate_config_set_generates_backup_and_active_state(tmp_path: Path):
    source = tmp_path / "ai-configs" / "factory" / "design"
    (source / "skills").mkdir(parents=True)
    (source / "skills" / "skill.md").write_text("demo", encoding="utf-8")
    target = tmp_path / "targets" / "factory" / "skills"

    service = ActivationService(JsonStore(tmp_path))
    service.configure_tool_targets({"factory": {"skills": str(target)}})

    result = service.activate_config_set(str(tmp_path), "factory", "design")

    assert result["status"] == "success"
    assert result["activeState"]["factory"] == "design"
    assert result["plan"]["steps"][0]["type"] == "backup_target"
    assert (target / "skill.md").exists()


def test_dashboard_view_matches_workspace_first_design(tmp_path: Path):
    workspace = {
        "rootPath": str(tmp_path),
        "tools": [
            {
                "name": "factory",
                "configSets": [
                    {
                        "id": "design",
                        "tool": "factory",
                        "path": str(tmp_path / "ai-configs" / "factory" / "design"),
                        "resources": ["skills", "mcp"],
                    }
                ],
                "resourceGroups": [
                    {"type": "mcp", "items": [{"configSetId": "design", "path": "x", "isActive": True}]},
                    {"type": "skills", "items": [{"configSetId": "design", "path": "y", "isActive": True}]},
                ],
            }
        ],
    }
    view = build_dashboard_view(workspace, {"factory": "design"}, [])

    assert view["theme"] == "system"
    assert view["hero"]["activeWorkspace"] == str(tmp_path)
    assert view["panels"][0]["title"] == "Tool Activation"
    assert "factory: design" in view["panels"][1]["items"]


def test_repository_returns_empty_state_without_bootstrap(tmp_path: Path):
    repository = AppRepository(JsonStore(tmp_path))
    snapshot = repository.get_workspace_snapshot(tmp_path)

    assert snapshot["tools"] == []
    assert snapshot["currentTool"]["name"] == ""
    assert snapshot["settings"]["workspacePath"] == str(tmp_path)


def test_repository_bootstraps_full_workspace_data(tmp_path: Path):
    store = JsonStore(tmp_path)
    bootstrap_sample_data(store, workspace_root=tmp_path)
    repository = AppRepository(store)

    snapshot = repository.get_workspace_snapshot(tmp_path)

    assert snapshot["workspace"]["rootPath"] == str(tmp_path)
    assert snapshot["tools"][0]["name"] == "codex"
    assert snapshot["activeState"]["factory"] == "design"
    assert snapshot["currentTool"]["resourceGroups"]
    assert snapshot["currentTool"]["actions"]["createStructureLabel"] == "创建配置文件夹结构"
    assert snapshot["settings"]["floatingButtonLabel"] == "设置"
    assert snapshot["settings"]["themeOptions"]
