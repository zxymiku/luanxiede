import pyautogui
import pytesseract
from googletrans import Translator

pytesseract.pytesseract.tesseract_cmd = 'D:\\Program Files\\Tesseract-OCR\\tesseract.exe'


def capture_and_scan(x, y, width, height):
    # 捕获指定区域的屏幕截图
    screenshot = pyautogui.screenshot(region=(x, y, width, height))

    # 识别截图中的文本
    text = pytesseract.image_to_string(screenshot)

    return text

def main():
    # 设置扫描区域的绝对位置（左上角坐标和宽度、高度）
    x = 100
    y = 100
    width = 300
    height = 200

    # 捕获并扫描指定区域内的内容
    scanned_text = capture_and_scan(x, y, width, height)
    target_language = 'en' if scanned_text== 'zh' else 'zh-CN'


    # 翻译文本
    translated_text = translate_text(scanned_text, target_language)

    # 打印翻译结果
    print("Translated Text:")
    print(translated_text)

from googletrans import Translator

def translate_text(text, target_language='en'):
    translator = Translator()
    translated_text = translator.translate(text, dest=target_language)
    return translated_text.text



if __name__ == "__main__":
    main()
