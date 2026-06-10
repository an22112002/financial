import os
import cv2
import numpy as np

from ultralytics import FastSAM


# =========================
# CONFIG
# =========================

IMAGE_PATH = "scanPaperProcess/test8.jpg"
MODEL_PATH = "FastSAM-s.pt"

OUTPUT_DIR = "output"

os.makedirs(OUTPUT_DIR, exist_ok=True)


# =========================
# LOAD IMAGE
# =========================

image = cv2.imread(IMAGE_PATH)

if image is None:
    raise Exception(f"Cannot read image: {IMAGE_PATH}")

orig = image.copy()

H, W = image.shape[:2]


# =========================
# LOAD MODEL
# =========================

model = FastSAM(MODEL_PATH)

# =========================
# PREDICT
# =========================

results = model(
    IMAGE_PATH,
    retina_masks=True,
    imgsz=1024,
    conf=0.4,
    iou=0.9
)

result = results[0]

if result.masks is None:
    raise Exception("No masks detected")

masks = result.masks.data.cpu().numpy()


# =========================
# FIND BEST MASK
# =========================

best_mask = None
best_score = -1

image_area = H * W

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

    # score ưu tiên:
    # - area lớn
    # - shape giống rectangle

    score = area * fill_ratio

    # print(
    #     "mask",
    #     debug_index,
    #     "area=",
    #     area,
    #     "fill=",
    #     fill_ratio,
    #     "score=",
    #     score
    # )

    if score > best_score:
        best_score = score
        best_mask = mask


if best_mask is None:
    raise Exception("Cannot find document mask")


cv2.imwrite(
    os.path.join(OUTPUT_DIR, "1_mask.png"),
    best_mask
)


# =========================
# FIND CONTOUR
# =========================

contours, _ = cv2.findContours(
    best_mask,
    cv2.RETR_EXTERNAL,
    cv2.CHAIN_APPROX_SIMPLE
)

cnt = max(contours, key=cv2.contourArea)

# =========================
# APPROX 4 CORNERS
# =========================

peri = cv2.arcLength(cnt, True)

approx = cv2.approxPolyDP(
    cnt,
    0.02 * peri,
    True
)

# nếu không ra 4 điểm thì fallback
if len(approx) == 4:

    box = approx.reshape(4, 2)

else:

    rect = cv2.minAreaRect(cnt)

    box = cv2.boxPoints(rect)

    box = np.int32(box)


# debug draw
debug = orig.copy()

cv2.drawContours(
    debug,
    [box],
    0,
    (0, 255, 0),
    5
)

for p in box:
    cv2.circle(
        debug,
        tuple(p),
        10,
        (0, 0, 255),
        -1
    )

cv2.imwrite(
    os.path.join(OUTPUT_DIR, "2_box.png"),
    debug
)


# =========================
# ORDER POINTS
# =========================

def order_points(pts):

    rect = np.zeros((4, 2), dtype="float32")

    s = pts.sum(axis=1)

    rect[0] = pts[np.argmin(s)]  # top-left
    rect[2] = pts[np.argmax(s)]  # bottom-right

    diff = np.diff(pts, axis=1)

    rect[1] = pts[np.argmin(diff)]  # top-right
    rect[3] = pts[np.argmax(diff)]  # bottom-left

    return rect


rect_pts = order_points(box.astype("float32"))

(tl, tr, br, bl) = rect_pts


# =========================
# COMPUTE SIZE
# =========================

widthA = np.linalg.norm(br - bl)
widthB = np.linalg.norm(tr - tl)

heightA = np.linalg.norm(tr - br)
heightB = np.linalg.norm(tl - bl)

scale = 2.5 
maxWidth = int( max(widthA, widthB) * scale ) 
maxHeight = int( max(heightA, heightB) * scale )


# =========================
# DESTINATION
# =========================

dst = np.array([
    [0, 0],
    [maxWidth - 1, 0],
    [maxWidth - 1, maxHeight - 1],
    [0, maxHeight - 1]
], dtype="float32")


# =========================
# PERSPECTIVE TRANSFORM
# =========================

M = cv2.getPerspectiveTransform(rect_pts, dst)

warp = cv2.warpPerspective(
    orig,
    M,
    (maxWidth, maxHeight),
    flags=cv2.INTER_LINEAR
)


cv2.imwrite(
    os.path.join(OUTPUT_DIR, "3_warp.png"),
    warp
)

# =========================
# ENHANCE FOR OCR
# =========================

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
    tileGridSize=(8,8)
)

gray = clahe.apply(gray)

blur = cv2.GaussianBlur(
    gray,
    (0,0),
    3
)

gray = cv2.addWeighted(
    gray,
    2.0,
    blur,
    -1.0,
    0
)

cv2.imwrite(
    os.path.join(OUTPUT_DIR, "4_gray.png"),
    gray
)
