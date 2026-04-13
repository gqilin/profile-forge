from __future__ import annotations

from src.core.models.entities import Bundle, ManagedTarget, Profile, Resource
from src.core.storage.json_store import JsonStore
from src.ui.app import build_dashboard_view
from src.ui.pages.backups import build_backups_page
from src.ui.pages.profiles import build_profiles_page
from src.ui.pages.resources import build_resources_page


def bootstrap_sample_data(store: JsonStore) -> None:
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
    store.write_collection(
        "backups",
        [
            {
                "id": "snapshot-001",
                "profileId": "design",
                "status": "available",
                "createdAt": "2026-04-13T16:30:00+00:00",
            }
        ],
    )


class AppRepository:
    def __init__(self, store: JsonStore):
        self.store = store

    def get_workspace_snapshot(self) -> dict:
        profiles = self.store.read_collection("profiles")
        resources = self.store.read_collection("resources")
        bundles = self.store.read_collection("bundles")
        backups = self.store.read_collection("backups")

        return {
            "dashboard": build_dashboard_view(),
            "profiles": profiles,
            "resources": resources,
            "bundles": bundles,
            "backups": backups,
            "pages": {
                "profiles": build_profiles_page(profiles, bundles),
                "resources": build_resources_page(resources),
                "backups": build_backups_page(backups),
            },
        }
