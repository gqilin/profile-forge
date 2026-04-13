from __future__ import annotations


def build_resources_page(resources: list[dict]) -> dict:
    return {
        "title": "Resources",
        "items": [
            {
                "id": resource["id"],
                "name": resource["name"],
                "platform": resource["platform"],
                "type": resource["type"],
                "managedPath": resource["managedPath"],
            }
            for resource in resources
        ],
    }
