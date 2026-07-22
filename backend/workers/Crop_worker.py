from redis.asyncio import Redis
import json
import numpy as np
import cv2
import asyncio
import os

from ultralytics import FastSAM

from config import CACHE2_DIR, REDIS_HOST, REDIS_PASSWORD, REDIS_PORT


class CropWorker:
    NAME = "crop_worker"
    MODEL_PATH = "FastSAM-s.pt"

    def __init__(self):
        self.running = True
        self.load_model()

    async def stop(self):
        self.running = False

    async def run(self):
        try:
            redis = Redis(host=REDIS_HOST, password=REDIS_PASSWORD, port=REDIS_PORT, db=0, decode_responses=True)
            while self.running:
                result = await redis.blpop("crop_tasks", timeout=1)
                if result is None:
                    continue
                _, raw = result
                data = json.loads(raw)
                # Crop processing
                request_id = data["id"]
                input_file = data["location"]
                output_file = os.path.join(CACHE2_DIR, f"{request_id}.jpg")
                try:
                    image = cv2.imread(input_file)
                    if image is None:
                        raise Exception(f"Cannot read image: {input_file}")
                    self.H, self.W = image.shape[:2]

                    output_file = await self.crop_document(
                        request_id,
                        input_file
                    )

                    response = {
                        "id": request_id,
                        "success": True,
                        "output": output_file
                    }

                except Exception as ex:
                    response = {
                        "id": request_id,
                        "success": False,
                        "error": str(ex)
                    }

                await redis.publish(
                    "crop_results",
                    json.dumps(response)
                )
        finally:
            await redis.close()

    def load_model(self):
        self.model = FastSAM(self.MODEL_PATH)

    def find_best_mask(self, masks):
        best_mask = None
        best_score = -1

        image_area = self.H * self.W

        debug_index = 0

        for m in masks:

            mask = (m * 255).astype(np.uint8)

            area = cv2.countNonZero(mask)

            debug_index += 1

            # bỏ mask quá nhỏ
            if area < image_area * 0.01:
                continue

            contours, _ = cv2.findContours(
                mask,
                cv2.RETR_EXTERNAL,
                cv2.CHAIN_APPROX_SIMPLE
            )

            if len(contours) == 0:
                continue

            cnt = max(contours, key=cv2.contourArea)

            rect = cv2.minAreaRect(cnt)

            w = rect[1][0]
            h = rect[1][1]

            if w <= 1 or h <= 1:
                continue

            rect_area = w * h

            if rect_area <= 0:
                continue

            fill_ratio = area / rect_area

            score = area * fill_ratio

            if score > best_score:
                best_score = score
                best_mask = mask

        if best_mask is None:
            raise Exception("Cannot find document mask")
        
        return best_mask

    # def find_contour_corners(self, mask):
    #     contours, _ = cv2.findContours(
    #         mask,
    #         cv2.RETR_EXTERNAL,
    #         cv2.CHAIN_APPROX_SIMPLE
    #     )

    #     if len(contours) == 0:
    #         raise Exception("Cannot find contours")

    #     cnt = max(contours, key=cv2.contourArea)

    #     epsilon = 0.02 * cv2.arcLength(cnt, True)
    #     approx = cv2.approxPolyDP(cnt, epsilon, True)

    #     if len(approx) != 4:
    #         print("Contour points:", len(approx))
    #         raise Exception("Document contour is not quadrilateral")

    #     corners = approx.reshape(4, 2)

    #     return corners
    
    def find_contour_corners(self, mask):

        contours, _ = cv2.findContours(
            mask,
            cv2.RETR_EXTERNAL,
            cv2.CHAIN_APPROX_SIMPLE
        )

        if len(contours) == 0:
            raise Exception("Cannot find contours")

        # contour lớn nhất
        cnt = max(contours, key=cv2.contourArea)

        # làm đầy các chỗ lõm do giấy gấp
        hull = cv2.convexHull(cnt)

        # thử approxPolyDP trước
        peri = cv2.arcLength(hull, True)

        for factor in [0.01, 0.02, 0.03, 0.05, 0.08]:
            approx = cv2.approxPolyDP(
                hull,
                factor * peri,
                True
            )

            if len(approx) == 4:
                return approx.reshape(4, 2)

        # fallback: luôn lấy được 4 góc
        rect = cv2.minAreaRect(hull)

        corners = cv2.boxPoints(rect)

        return corners.astype(np.float32)

    def order_points(self, pts):

        rect = np.zeros((4, 2), dtype="float32")

        s = pts.sum(axis=1)

        rect[0] = pts[np.argmin(s)]
        rect[2] = pts[np.argmax(s)]

        diff = np.diff(pts, axis=1)

        rect[1] = pts[np.argmin(diff)]
        rect[3] = pts[np.argmax(diff)]

        return rect
    
    def warp_document(self, image, corners):

        rect = self.order_points(
            corners.astype("float32")
        )

        (tl, tr, br, bl) = rect

        widthA = np.linalg.norm(br - bl)
        widthB = np.linalg.norm(tr - tl)

        heightA = np.linalg.norm(tr - br)
        heightB = np.linalg.norm(tl - bl)

        scale = 2.5

        maxWidth = int(
            max(widthA, widthB) * scale
        )

        maxHeight = int(
            max(heightA, heightB) * scale
        )

        dst = np.array([
            [0, 0],
            [maxWidth - 1, 0],
            [maxWidth - 1, maxHeight - 1],
            [0, maxHeight - 1]
        ], dtype="float32")

        M = cv2.getPerspectiveTransform(
            rect,
            dst
        )

        return cv2.warpPerspective(
            image,
            M,
            (maxWidth, maxHeight),
            flags=cv2.INTER_LINEAR
        )
    
    def enhance_for_ocr(self, warp):

        gray = cv2.cvtColor(
            warp,
            cv2.COLOR_BGR2GRAY
        )

        gray = cv2.fastNlMeansDenoising(
            gray,
            None,
            2,
            7,
            21
        )

        clahe = cv2.createCLAHE(
            clipLimit=1.2,
            tileGridSize=(8, 8)
        )

        gray = clahe.apply(gray)

        blur = cv2.GaussianBlur(
            gray,
            (0, 0),
            3
        )

        gray = cv2.addWeighted(
            gray,
            2.0,
            blur,
            -1.0,
            0
        )

        return gray

    async def crop_document(self, request_id, image_path):

        image = cv2.imread(image_path)

        if image is None:
            raise Exception(
                f"Cannot read image: {image_path}"
            )

        results = await asyncio.to_thread(
            self.model,
            image_path,
            retina_masks=True,
            imgsz=1024,
            conf=0.4,
            iou=0.9
        )

        result = results[0]

        if result.masks is None:
            raise Exception(
                "No masks detected"
            )

        masks = result.masks.data.cpu().numpy()

        best_mask = self.find_best_mask(
            masks
        )

        corners = self.find_contour_corners(
            best_mask
        )

        warp = self.warp_document(
            image,
            corners
        )

        gray = self.enhance_for_ocr(
            warp
        )

        filename = (
            f"{request_id}.png"
        )

        output_path = os.path.join(
            CACHE2_DIR,
            filename
        )

        cv2.imwrite(
            output_path,
            gray
        )

        if not os.path.exists(output_path):
            raise Exception("Output file not created")

        return output_path