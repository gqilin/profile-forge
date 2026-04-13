from __future__ import annotations


def build_backups_page(backups: list[dict]) -> dict:
    return {
        "title": "Backups",
        "items": [
            {
                "id": backup["id"],
                "profileId": backup["profileId"],
                "status": backup["status"],
                "createdAt": backup["createdAt"],
            }
            for backup in backups
        ],
    }
