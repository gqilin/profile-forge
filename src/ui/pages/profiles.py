from __future__ import annotations


def build_profiles_page(profiles: list[dict], bundles: list[dict]) -> dict:
    bundle_names = {bundle["id"]: bundle["name"] for bundle in bundles}
    items = []
    for profile in profiles:
        bound_bundle_ids = []
        for refs in profile["bindings"].values():
            bound_bundle_ids.extend(refs)
        items.append(
            {
                "id": profile["id"],
                "name": profile["name"],
                "description": profile["description"],
                "bundles": [bundle_names[bundle_id] for bundle_id in bound_bundle_ids if bundle_id in bundle_names],
                "activationMode": profile["activationPolicy"]["mode"],
            }
        )
    return {"title": "Profiles", "items": items}
