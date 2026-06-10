import cv2

import easyocr

from vietocr.tool.predictor import Predictor
from vietocr.tool.config import Cfg

from PIL import Image

def get_box_center(box):
    x = sum(p[0] for p in box) / 4
    y = sum(p[1] for p in box) / 4
    return x, y


def group_boxes_into_lines(results, y_threshold=15):
    boxes = []

    for item in results:
        box = item[0]

        xs = [p[0] for p in box]
        ys = [p[1] for p in box]

        boxes.append({
            "item": item,
            "box": box,
            "x_min": min(xs),
            "x_max": max(xs),
            "y_min": min(ys),
            "y_max": max(ys),
            "cy": sum(ys) / 4
        })

    boxes.sort(key=lambda x: x["cy"])

    lines = []

    for b in boxes:
        placed = False

        for line in lines:
            line_y = sum(x["cy"] for x in line) / len(line)

            if abs(b["cy"] - line_y) < y_threshold:
                line.append(b)
                placed = True
                break

        if not placed:
            lines.append([b])

    # sort left -> right
    for line in lines:
        line.sort(key=lambda x: x["x_min"])

    return lines

# EasyOCR detect
reader = easyocr.Reader(
    ['vi'],
    gpu=False
)

# VietOCR
config = Cfg.load_config_from_name(
    'vgg_transformer'
)

config['device'] = 'cpu'

vietocr = Predictor(config)

img = cv2.imread(
    # "output/4_gray.png"
    "scanPaperProcess/test.png"
)

results = reader.readtext(
    img,
    detail=1,
    paragraph=False
)

lines = group_boxes_into_lines(
    results,
    y_threshold=25
)

for line in lines:

    x_min = min(b["x_min"] for b in line)
    y_min = min(b["y_min"] for b in line)
    x_max = max(b["x_max"] for b in line)
    y_max = max(b["y_max"] for b in line)

    pad = 10

    x_min = int(max(0, x_min - pad))
    y_min = int(max(0, y_min - pad))
    x_max = int(min(img.shape[1], x_max + pad))
    y_max = int(min(img.shape[0], y_max + pad))

    if x_max - x_min < 10 or y_max - y_min < 10:
        continue

    crop = img[y_min:y_max, x_min:x_max]

    crop = cv2.resize(crop, None, fx=2, fy=2)

    crop_pil = Image.fromarray(cv2.cvtColor(crop, cv2.COLOR_BGR2RGB))

    text = vietocr.predict(crop_pil)
    print(text)