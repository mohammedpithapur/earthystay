import pytest


pytestmark = pytest.mark.asyncio


async def test_admin_upload_image_returns_public_url(client, admin_headers, monkeypatch):
    def fake_upload(image_bytes: bytes, mime_type: str, folder: str = "properties") -> str:
        assert image_bytes == b"fake-image-bytes"
        assert mime_type == "image/png"
        assert folder == "properties"
        return "https://cdn.example.com/properties/test.png"

    monkeypatch.setattr("app.routers.admin.upload_property_image_from_bytes", fake_upload)

    response = await client.post(
        "/admin/upload-image",
        headers=admin_headers,
        files={"file": ("property.png", b"fake-image-bytes", "image/png")},
    )

    assert response.status_code == 200, response.text
    assert response.json() == {"url": "https://cdn.example.com/properties/test.png"}


async def test_admin_upload_image_rejects_unsupported_type(client, admin_headers):
    response = await client.post(
        "/admin/upload-image",
        headers=admin_headers,
        files={"file": ("property.gif", b"gif-bytes", "image/gif")},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Unsupported image type. Allowed: jpeg, png, webp"