import base64
import binascii
import re
from urllib.parse import urlparse
from uuid import uuid4

from supabase import Client, create_client

from app.config import settings

_DATA_URL_PATTERN = re.compile(r"^data:(image/(?:jpeg|png|webp));base64,(.+)$", re.DOTALL)
_ALLOWED_IMAGE_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
}


class UploadValidationError(ValueError):
    pass


class UploadStorageError(RuntimeError):
    pass


def _get_supabase_client() -> Client:
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_KEY:
        raise UploadStorageError("Supabase storage is not configured")
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


def _decode_data_url(data_url: str) -> tuple[str, bytes]:
    match = _DATA_URL_PATTERN.match(data_url)
    if not match:
        raise UploadValidationError("Only base64 data URLs for jpeg/png/webp are supported")

    mime_type, encoded_payload = match.groups()
    if mime_type not in _ALLOWED_IMAGE_TYPES:
        raise UploadValidationError("Unsupported image type. Allowed: jpeg, png, webp")

    try:
        image_bytes = base64.b64decode(encoded_payload, validate=True)
    except (binascii.Error, ValueError) as exc:
        raise UploadValidationError("Invalid base64 image payload") from exc

    if not image_bytes:
        raise UploadValidationError("Image payload is empty")

    _validate_image_payload(mime_type, image_bytes)

    return mime_type, image_bytes


def _validate_image_payload(mime_type: str, image_bytes: bytes) -> None:
    if mime_type not in _ALLOWED_IMAGE_TYPES:
        raise UploadValidationError("Unsupported image type. Allowed: jpeg, png, webp")

    if not image_bytes:
        raise UploadValidationError("Image payload is empty")

    if len(image_bytes) > settings.IMAGE_MAX_BYTES:
        max_mb = settings.IMAGE_MAX_BYTES // (1024 * 1024)
        raise UploadValidationError(f"Image exceeds the maximum allowed size of {max_mb}MB")


def _extract_public_url(storage_result: object) -> str | None:
    if isinstance(storage_result, str):
        return storage_result

    if isinstance(storage_result, dict):
        return (
            storage_result.get("publicUrl")
            or storage_result.get("public_url")
            or storage_result.get("signedURL")
            or storage_result.get("signed_url")
        )

    data = getattr(storage_result, "data", None)
    if isinstance(data, dict):
        return data.get("publicUrl") or data.get("public_url")

    return None


def _extract_object_path_from_public_url(image_url: str) -> str:
    parsed_url = urlparse(image_url)
    path_prefix = f"/storage/v1/object/public/{settings.SUPABASE_STORAGE_BUCKET}/"

    if not parsed_url.path.startswith(path_prefix):
        raise UploadStorageError("Image URL is not a Supabase public storage URL")

    object_path = parsed_url.path[len(path_prefix):]
    if not object_path:
        raise UploadStorageError("Image URL does not contain a storage object path")

    return object_path


def upload_property_image_from_data_url(data_url: str, folder: str = "properties") -> str:
    mime_type, image_bytes = _decode_data_url(data_url)
    extension = _ALLOWED_IMAGE_TYPES[mime_type]
    object_path = f"{folder}/{uuid4()}.{extension}"

    client = _get_supabase_client()
    storage = client.storage.from_(settings.SUPABASE_STORAGE_BUCKET)

    try:
        storage.upload(
            path=object_path,
            file=image_bytes,
            file_options={"content-type": mime_type, "upsert": "false"},
        )
    except TypeError:
        # Fallback for older supabase-py signatures.
        storage.upload(object_path, image_bytes, {"content-type": mime_type, "upsert": "false"})
    except Exception as exc:
        raise UploadStorageError("Failed to upload image to Supabase Storage") from exc

    try:
        public_result = storage.get_public_url(object_path)
    except Exception as exc:
        raise UploadStorageError("Failed to generate public URL for uploaded image") from exc

    public_url = _extract_public_url(public_result)
    if not public_url:
        raise UploadStorageError("Supabase Storage did not return a public URL")

    return public_url


def upload_property_image_from_bytes(image_bytes: bytes, mime_type: str, folder: str = "properties") -> str:
    _validate_image_payload(mime_type, image_bytes)
    extension = _ALLOWED_IMAGE_TYPES[mime_type]
    object_path = f"{folder}/{uuid4()}.{extension}"

    client = _get_supabase_client()
    storage = client.storage.from_(settings.SUPABASE_STORAGE_BUCKET)

    try:
        storage.upload(
            path=object_path,
            file=image_bytes,
            file_options={"content-type": mime_type, "upsert": "false"},
        )
    except TypeError:
        # Fallback for older supabase-py signatures.
        storage.upload(object_path, image_bytes, {"content-type": mime_type, "upsert": "false"})
    except Exception as exc:
        raise UploadStorageError("Failed to upload image to Supabase Storage") from exc

    try:
        public_result = storage.get_public_url(object_path)
    except Exception as exc:
        raise UploadStorageError("Failed to generate public URL for uploaded image") from exc

    public_url = _extract_public_url(public_result)
    if not public_url:
        raise UploadStorageError("Supabase Storage did not return a public URL")

    return public_url


def delete_property_image_from_url(image_url: str) -> None:
    object_path = _extract_object_path_from_public_url(image_url)

    client = _get_supabase_client()
    storage = client.storage.from_(settings.SUPABASE_STORAGE_BUCKET)

    try:
        storage.remove([object_path])
    except Exception as exc:
        raise UploadStorageError("Failed to delete image from Supabase Storage") from exc
