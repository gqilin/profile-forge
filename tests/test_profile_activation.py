import json
from pathlib import Path

from src.core.models.entities import Bundle, ManagedTarget, Profile, Resource
from src.core.services.activation import ActivationService
from src.core.services.repository import AppRepository, bootstrap_sample_data
from src.core.storage.json_store import JsonStore
from src.ui.app import build_dashboard_view


def test_activate_profile_generates_plan_and_writes_state(tmp_path: Path):
    store = JsonStore(tmp_path)
    service = ActivationService(store)

    resource = Resource(
        id="factory-skills",
        name="Factory Skills",
        platform="factory",
        type="skills",
        source_path="resources/factory/skills",
        managed_path="C:/Users/Admin/.factory/skills",
    )
    bundle = Bundle(
        id="factory-design",
        name="Factory Design",
        platform="factory",
        resource_refs=["factory-skills"],
        tags=["design"],
        description="design bundle",
    )
    profile = Profile(
        id="design",
        name="Design",
        description="Design workflow",
        bindings={"factory": ["factory-design"]},
        env_bindings={"FIGMA_MODE": "design"},
        command_bindings={"sync": "factory sync"},
        mcp_bindings={"figma": {"transport": "http"}},
    )
    target = ManagedTarget(
        id="factory-skills-target",
        platform="factory",
        target_type="skills",
        path="C:/Users/Admin/.factory/skills",
        scope="global",
    )

    store.write_collection("resources", [resource.to_dict()])
    store.write_collection("bundles", [bundle.to_dict()])
    store.write_collection("profiles", [profile.to_dict()])
    store.write_collection("managed-targets", [target.to_dict()])

    result = service.activate_profile("design")

    assert result["status"] == "success"
    assert result["plan"]["profileId"] == "design"
    assert [step["type"] for step in result["plan"]["steps"]] == [
        "verify_target",
        "copy_files",
        "register_mcp",
        "apply_commands",
        "write_env",
        "write_active_state",
    ]

    active_state = json.loads((tmp_path / "active-profile.json").read_text(encoding="utf-8"))
    assert active_state["currentProfileId"] == "design"
    assert active_state["status"] == "active"


def test_dashboard_view_matches_profile_first_design():
    view = build_dashboard_view()

    assert view["theme"] == "system"
    assert view["hero"]["activeProfile"] == "Design"
    assert view["panels"][0]["title"] == "Activation Preview"
    assert "Factory" in view["panels"][1]["items"]


def test_repository_bootstraps_full_workspace_data(tmp_path: Path):
    store = JsonStore(tmp_path)
    bootstrap_sample_data(store)
    repository = AppRepository(store)

    snapshot = repository.get_workspace_snapshot()

    assert snapshot["dashboard"]["hero"]["activeProfile"] == "Design"
    assert snapshot["profiles"][0]["id"] == "design"
    assert snapshot["resources"][0]["platform"] == "factory"
    assert snapshot["backups"][0]["status"] == "available"
