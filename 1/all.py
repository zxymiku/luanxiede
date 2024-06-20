import tkinter as tk
import pyautogui
from pynput.mouse import Listener
import threading

def select_window():
    global target_title
    target_title = listbox.get(tk.ACTIVE)
    print("已选择的窗口标题：", target_title)

def on_click(x, y, button, pressed):
    global target_title
    if button == button.left:
        if pressed:
            if hasattr(select_window, 'target_title') and pyautogui.getActiveWindowTitle() == target_title:
                print("鼠标位置：", x, y)
        else:
            print("鼠标左键释放")

def check_left_click():
    with Listener(on_click=on_click) as listener:
        listener.join()

def close_program():
    root.destroy()

# 获取所有窗口标题
window_titles = pyautogui.getAllTitles()

# 创建GUI窗口
root = tk.Tk()
root.title("选择窗口标题")

# 在窗口中显示所有窗口标题供选择
listbox = tk.Listbox(root)
for title in window_titles:
    listbox.insert(tk.END, title)
listbox.pack(padx=10, pady=10)

def confirm_selection():
    select_window()

# 确定按钮
select_button = tk.Button(root, text="确定", command=confirm_selection)
select_button.pack(pady=5)

# 关闭按钮
close_button = tk.Button(root, text="关闭程序", command=close_program)
close_button.pack(pady=5)

# 启动检测左键线程
left_click_thread = threading.Thread(target=check_left_click)
left_click_thread.daemon = True
left_click_thread.start()

root.mainloop()
