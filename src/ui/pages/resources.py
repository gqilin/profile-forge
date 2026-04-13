from __future__ import annotations


def build_resources_page(tools: list[dict]) -> dict:
    items = []
    for tool in tools:
        for config_set in tool["configSets"]:
            items.append(
                {
                    "id": f"{tool['name']}-{config_set['id']}",
                    "tool": tool["name"],
                    "configSet": config_set["id"],
                    "path": config_set["path"],
                    "resources": config_set["resources"],
                }
            )
    return {"title": "Resource Coverage", "items": items}
