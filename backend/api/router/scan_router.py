from fastapi import APIRouter
from fastapi.responses import JSONResponse, FileResponse
from redis.asyncio import Redis
import json
from fastapi import UploadFile, File
import asyncio
import json
import uuid
import os
import aiofiles
from contextlib import asynccontextmanager
from config import CACHE_DIR, CACHE2_DIR

pending_requests = {}

@asynccontextmanager
async def lifespan(router: APIRouter):
    tasks = [
        asyncio.create_task(redis_result_listener())
    ]
    try:
        yield
    finally:
        for task in tasks:
            task.cancel()

scan_router = APIRouter(prefix="/scan", lifespan=lifespan, tags=["scan"])

@scan_router.post("/upload")
async def scan_upload(
    file: UploadFile = File(...)
):

    request_id = str(uuid.uuid4())

    ext = os.path.splitext(
        file.filename
    )[1]

    cache_file = os.path.join(
        CACHE_DIR,
        f"{request_id}{ext}"
    )

    async with aiofiles.open(
        cache_file,
        "wb"
    ) as f:

        content = await file.read()

        await f.write(content)

    redis = Redis(
        host="localhost",
        port=6379,
        decode_responses=True
    )

    payload = {
        "id": request_id,
        "location": cache_file
    }

    future = asyncio.Future()

    pending_requests[request_id] = future

    await redis.lpush(
        "crop_tasks",
        json.dumps(payload)
    )

    try:

        result = await asyncio.wait_for(
            future,
            timeout=120
        )
        pending_requests.pop(
            request_id,
            None
        )

        if not result["success"]:
            return JSONResponse(
                status_code=400,
                content=result
            )
        return JSONResponse(
            status_code=200,
            content={
                "image_id": request_id,
                "success": True,
            }
        )

    except asyncio.TimeoutError:

        pending_requests.pop(
            request_id,
            None
        )

        return JSONResponse(
            status_code=504,
            content={
                "success": False,
                "message": "Crop timeout"
            }
        )

@scan_router.get("/{image_id}")
async def get_cropped_image(
    image_id: str
):

    cache_file = os.path.join(
        CACHE2_DIR,
        f"{image_id}.png"
    )

    if not os.path.exists(cache_file):
        return JSONResponse(
            status_code=404,
            content={
                "success": False,
                "message": "Image not found"
            }
        )

    return FileResponse(
        cache_file,
        media_type="image/png",
        filename=f"{image_id}.png"
    )

@scan_router.delete("/delete/{image_id}")
async def delete_cropped_image(
    image_id: str
):

    cache_file = os.path.join(
        CACHE2_DIR,
        f"{image_id}.png"
    )

    if os.path.exists(cache_file):
        os.remove(cache_file)

    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "message": "Image deleted if it existed"
        }
    )

async def redis_result_listener():

    redis = Redis(
        host="localhost",
        port=6379,
        decode_responses=True
    )

    try:

        pubsub = redis.pubsub()

        await pubsub.subscribe(
            "crop_results"
        )

        async for message in pubsub.listen():

            if message["type"] != "message":
                continue

            data = json.loads(
                message["data"]
            )

            request_id = data["id"]

            future = pending_requests.pop(
                request_id,
                None
            )

            if future and not future.done():
                future.set_result(data)
    finally:
        await pubsub.unsubscribe("crop_results")
        await pubsub.close()
        await redis.close()