from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from redis.asyncio import Redis
import json, uuid, asyncio
from contextlib import asynccontextmanager

redis = Redis(host='localhost', port=6379, db=0, decode_responses=True)
websockets = {}

@asynccontextmanager
async def lifespan(router: APIRouter):
    tasks = [
        asyncio.create_task(redis_listener_response_bank_info_account())
    ]
    try:
        yield
    finally:
        for task in tasks:
            task.cancel()

bank_router = APIRouter(prefix="/banks", lifespan=lifespan, tags=["banks"])

@bank_router.get("/banks_support")
async def getBanksSupport():
    context = {
        "banks": [
            {"account_number": "001", "name": "Bank A"},
            {"account_number": "002", "name": "Bank B"},
            {"account_number": "003", "name": "Bank C"}
        ]
    }
    return JSONResponse(content=context, status_code=200)

# test WebSocket
# @bank_router.websocket("/ws/banks/{client_id}")
# async def websocket_endpoint(websocket: WebSocket, client_id: str):
#     await websocket.accept()
#     websocket_id = str(uuid.uuid4())
#     websockets[websocket_id] = websocket
#     await websocket.send_json({"message": f"Allow connection", "id": websocket_id})
#     try:
#         while True:
#             data = await websocket.receive_json()
#             if data.get("request") == "get_bank_info_account":
                
#                 # Gửi phản hồi tạm thời cho client
#                 await websocket.send_json({"client_id":f"{client_id}","result":{"account_number":"123456789","bank_name":"Example Bank","account_holder":"John Doe","balance":1000.0}})
#     except WebSocketDisconnect:
#         print(f"Disconnected: {client_id}")
#         websockets.pop(websocket_id, None)

@bank_router.websocket("/ws/banks/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    websocket_id = str(uuid.uuid4())
    websockets[websocket_id] = websocket
    await websocket.send_json({"message": f"Allow connection", "id": websocket_id})
    try:
        while True:
            data = await websocket.receive_json()
            if data.get("request") == "get_bank_info_account":
                task = {
                    "id": websocket_id,
                    "data": data
                }
                # Gửi yêu cầu đến Redis queue "get_bank_info_account"
                await redis.rpush("get_bank_info_account", json.dumps(task))
                # Gửi phản hồi tạm thời cho client
                await websocket.send_json({"message": "Request received, waiting for response..."})
    except WebSocketDisconnect:
        print(f"Disconnected: {client_id}")
        websockets.pop(websocket_id, None)
        

async def redis_listener_response_bank_info_account():
    # Lắng nghe tin nhắn từ Redis channel "bank_info_account_response"
    pubsub = redis.pubsub()
    await pubsub.subscribe("bank_info_account_response")

    while True:

        message = await pubsub.get_message(
            ignore_subscribe_messages=True
        )

        if message:
            # Xử lý tin nhắn và gửi kết quả về client qua WebSocket
            data = json.loads(message["data"])

            websocket_id = data["id"]

            websocket = websockets.get(websocket_id)

            if websocket:

                await websocket.send_json(
                    data
                )

        await asyncio.sleep(0.01)

