import tkinter as tk
from tkinter import Menu
import tkinter.ttk as ttk
import base64
import random
import os
def base64_to_decimal(base64_string):
    binary_data = base64.b64decode(base64_string)
    decimal_number = int.from_bytes(binary_data, byteorder='big')
    return decimal_number
example_base64 = "Q1lY5amK5a2Q"
decimal_number = base64_to_decimal(example_base64)
def write_password_to_file(password):
    file_path = os.path.join(os.getcwd(), "password.txt")  # 获取当前工作目录下文件路径
    with open(file_path, "w") as file:
        file.write(password)
def generate_random_numbers_with_sum(target_sum, count):
    if target_sum < count:
        raise ValueError("Target sum must be greater than or equal to the count of random numbers.")
    random_numbers = []
    first_number = random.randint(1, target_sum - count + 1)
    random_numbers.append(first_number)
    remaining_sum = target_sum - first_number
    for _ in range(count - 1):
        if remaining_sum <= 1:
            break
        next_number = random.randint(1, remaining_sum - 1)
        random_numbers.append(next_number)
        remaining_sum -= next_number
    return random_numbers
random_numbers = generate_random_numbers_with_sum(100, 50)
def on_button_click():
    input_value = entry.get().strip()
    if input_value == "100":
        output_text = "密码为:" + str(decimal_number)
        output_label.config(text=output_text)
        write_password_to_file(str(decimal_number))
    else:
        output_label.config(text="输入的数字无效")
def copy_password_to_clipboard():
    root.clipboard_clear()
    root.clipboard_append(output_label.cget("text"))
root = tk.Tk()
root.title("输入密钥以获取解压密码")
entry = tk.Entry(root, width=20)
entry.pack(pady=10)
button = tk.Button(root, text="确定", command=on_button_click)
button.pack()
output_label = ttk.Label(root, text="输入密码")
output_label.pack(pady=10)
output_label.bind("<Button-3>", lambda event: show_context_menu(event))
context_menu = Menu(root, tearoff=0)
context_menu.add_command(label="复制", command=copy_password_to_clipboard)
def show_context_menu(event):
    context_menu.post(event.x_root, event.y_root)
root.mainloop()
