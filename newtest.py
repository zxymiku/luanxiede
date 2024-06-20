import tkinter as tk
import win32gui
import win32con
import pyautogui
from pynput import keyboard, mouse
from pynput.mouse import Button, Listener
import time

class WindowSelector:
    def __init__(self, root):
        self.root = root
        self.root.title("窗口选择器")  # 设置窗口标题

        self.selected_title = None  # 初始化选中的窗口标题变量

        self.title_label = tk.Label(root, text="选择一个窗口：")
        self.title_label.pack()  # 创建并展示标题标签

        self.window_listbox = tk.Listbox(root, selectmode=tk.SINGLE)
        self.populate_window_list()
        self.window_listbox.pack()  # 创建并展示窗口标题列表框

        self.ok_button = tk.Button(root, text="确定", command=self.select_window)
        self.ok_button.pack()  # 创建并展示确定按钮

        self.close_button = tk.Button(root, text="关闭", command=self.close_window)
        self.close_button.pack()  # 创建并展示关闭按钮

        self.listener = None  # 初始化鼠标监听器变量

    def populate_window_list(self):
        # 回调函数，用于枚举窗口并添加到窗口列表中
        def callback(hwnd, window_list):
            if win32gui.IsWindowVisible(hwnd):
                window_list.append((hwnd, win32gui.GetWindowText(hwnd)))

        window_list = []
        # 枚举系统中所有的窗口，并调用回调函数处理
        win32gui.EnumWindows(callback, window_list)
        # 将窗口标题添加到窗口列表框中
        for hwnd, title in window_list:
            self.window_listbox.insert(tk.END, title)

    def select_window(self):
        selected_index = self.window_listbox.curselection()
        if selected_index:
            # 获取用户选择的窗口标题并存储在selected_title变量中
            selected_title = self.window_listbox.get(selected_index)
            self.selected_title = selected_title
            # 启动鼠标监听
            self.start_mouse_listener()

    def close_window(self):
        if self.listener is not None:
            self.listener.stop()
        # 关闭窗口选择器程序
        self.root.destroy()

    def simulate_clicks(self):
        window_title = self.selected_title
        hwnd = win32gui.FindWindow(None, window_title)
        if hwnd != 0:
            rect = win32gui.GetWindowRect(hwnd)
            x = rect[0] + (rect[2] - rect[0]) // 2
            y = rect[1] + (rect[3] - rect[1]) // 2
            pyautogui.click(x, y, clicks=10, interval=0.1)  # 模拟点击
            time.sleep(0.1)  # 确保模拟点击与下一次检测之间有足够的时间间隔
        else:
            print("无法找到选定的窗口。")

    def start_mouse_listener(self):
        # 创建鼠标监听器
        self.listener = Listener
        def on_click(x, y, button, pressed):
            if pressed:
                window_title = self.selected_title
                if self.is_mouse_in_window(x, y, window_title):
                    last_click_position = None
                    is_simulating_click = False
                    self.listener = Listener(on_click=on_click)
                    self.listener.start()


def get_selected_window_title():
    root = tk.Tk()  # 创建根窗口
    selector = WindowSelector(root)  # 创建窗口选择器对象
    root.mainloop()  # 运行主事件循环，等待用户操作


# 使用示例
get_selected_window_title()
