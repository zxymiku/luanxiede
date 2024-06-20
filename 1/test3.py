import pyautogui
from pynput.mouse import Listener, mouse
from pynput.keyboard import Listener as KeyListener, Key

from pynput.mouse import Button
import threading
import sys

# 记录鼠标点击次数
click_count = 0

# 当鼠标左键被点击时调用的函数
def on_click(x, y, button, pressed):
    global click_count

    if button == Button.left and pressed:
        click_count += 1
        print("左键被点击！")
        # 获取当前鼠标位置
        current_x, current_y = pyautogui.position()
        # 模拟鼠标左键点击10次
        for _ in range(10):
            pyautogui.click(current_x, current_y)

# 当按下F10时停止所有监听行为并关闭程序
def on_press(key):
    if key == Key.f10:
        print("按下F10，停止监听并关闭程序。")
        sys.exit()
        return False

# 启动键盘事件监听器
def start_key_listener():
    with KeyListener(on_press=on_press) as key_listener:
        key_listener.join()

# 启动鼠标事件监听器
with Listener(on_click=on_click) as listener:
    # 使用线程来启动键盘监听器
    key_thread = threading.Thread(target=start_key_listener)
    key_thread.start()

    # 启动鼠标监听器
    listener.join()

mouse_listener.stop()
