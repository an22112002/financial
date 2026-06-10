from vietocr.tool.predictor import Predictor
from vietocr.tool.config import Cfg
from PIL import Image
import cv2

config = Cfg.load_config_from_name('vgg_transformer')

config['device'] = 'cpu'

detector = Predictor(config)

img = cv2.imread("output/4_gray.png")

img = Image.fromarray(img)

text = detector.predict(img)

print(text)