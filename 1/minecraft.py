import tkinter as tk
import pygetwindow as gw
import time
from pynput import keyboard, mouse
from pynput.mouse import Button
import pyautogui

#获取窗口标题
all_window_titles = [w.title for w in gw.getAllWindows()]

def on_select(event):
    # 选择事件触发时，获取当前选中的窗口标题并赋值给target_title
    global target_title
    index = listbox.curselection()[0]
    target_title = all_window_titles[index]

# 创建主窗口
root = tk.Tk()
root.title("窗口选择器")

# 创建列表框显示所有窗口标题
listbox = tk.Listbox(root, width=50, height=10)
for title in all_window_titles:
    listbox.insert(tk.END, title)

listbox.bind('<<ListboxSelect>>', on_select)  # 绑定选择事件
listbox.pack()

# 添加确认按钮，点击后关闭显示窗口
def close_and_confirm():
    root.destroy()  # 关闭窗口

confirm_button = tk.Button(root, text="确认选择", command=close_and_confirm)
confirm_button.pack()

# 运行主循环
root.mainloop()

# 获取与标题匹配的第一个窗口对象
windows = gw.getWindowsWithTitle(target_title)
if windows:
    # 获取第一个匹配窗口的位置和大小信息
    target_window = windows[0]
    window_rect = target_window.left, target_window.top, target_window.width, target_window.height

    # 计算窗口中心的坐标
    target_x = window_rect[0] + (window_rect[2] / 2)
    target_y = window_rect[1] + (window_rect[3] / 2)


else:
    print(f"未找到标题为 '{target_title}' 的窗口")

# 存储最后一次真实点击的位置和当前是否在模拟点击的状态
last_click_position = None
is_simulating_click = False
def on_click(x, y, button, pressed):
    global last_click_position, is_simulating_click
    if not is_simulating_click and button == Button.left and pressed:
        last_click_position = (x, y)
        simulate_double_click()
def simulate_double_click():
    global is_simulating_click
    if last_click_position is not None:
        is_simulating_click = True
        pyautogui.click(target_x, target_y, button='left', clicks=10)
        print(f"在({target_x}, {target_y})模拟了鼠标左键双击")
        time.sleep(0.1)  # 确保模拟点击与下一次检测之间有足够的时间间隔
        is_simulating_click = False
def on_press(key):
    if key == keyboard.Key.f10:
        # 停止监听器并退出程序
        return False
# 启动鼠标监听器
mouse_listener = mouse.Listener(on_click=on_click)
mouse_listener.start()
# 启动键盘监听器
with keyboard.Listener(on_press=on_press) as k_listener:
    k_listener.join()
# 在程序退出前，停止鼠标监听器（以防万一）
mouse_listener.stop()