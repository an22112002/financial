from redis.asyncio import Redis
import json, asyncio

from config import REDIS_HOST, REDIS_PASSWORD, REDIS_PORT

redis_client = Redis(host=REDIS_HOST, password=REDIS_PASSWORD, port=REDIS_PORT, db=0, decode_responses=True)

async def run():
    print("Worker MB_bank is running...")
    try:
        while True:
            # Lắng nghe tin nhắn từ Redis queue "get_bank_info_account"
            message = await redis_client.blpop("get_bank_info_account", timeout=0)
            print(f"Received message: {message}")
            if message:
                _, data = message
                data = json.loads(data)
                print(f"Processing task: {data}")
                # Xử lý dữ liệu và trả về kết quả
                date_respones = {
                    "account_number": "123456789",
                    "bank_name": "Example Bank",
                    "account_holder": "John Doe",
                    "balance": 1000.0
                }
                result = {
                    "id": data["id"],
                    "result": date_respones
                }
                # Gửi kết quả về Redis queue "bank_info_account_response"
                await redis_client.publish("bank_info_account_response", json.dumps(result))
    except asyncio.CancelledError:
        print("Cancelled")

    finally:

        await redis_client.close()

if __name__ == "__main__":
    try:
        asyncio.run(run())

    except KeyboardInterrupt:
        print("Stopped")