from __future__ import annotations


def build_profiles_page(tools: list[dict], active_state: dict[str, str]) -> dict:
    items = []
    for tool in tools:
        for config_set in tool["configSets"]:
            items.append(
                {
                    "id": f"{tool['name']}-{config_set['id']}",
                    "name": config_set["id"],
                    "tool": tool["name"],
                    "description": config_set.get("description", ""),
                    "resources": config_set["resources"],
                    "isActive": active_state.get(tool["name"]) == config_set["id"],
                }
            )
    return {"title": "Config Sets", "items": items}
