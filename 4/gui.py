import tkinter as tk
import tkinter.messagebox as messagebox
import base64


def switch_frame(frame):
    frame.tkraise()


def convert_to_hex():
    input_text = input_entry.get()
    if input_text:
        try:
            hex_value = ''.join(hex(ord(c))[2:] for c in input_text)
            output_label.config(text=hex_value)
        except ValueError:
            messagebox.showerror("错误", "无法转换输入，请输入有效字符。")


def convert_to_string():
    hex_text = input_entry.get()
    if hex_text:
        try:
            string_value = ''.join(chr(int(hex_text[i:i + 2], 16)) for i in range(0, len(hex_text), 2))
            output_label.config(text=string_value)
        except ValueError:
            messagebox.showerror("错误", "无法转换输入，请输入有效十六进制字符。")


def convert_to_base64():
    input_text = input_entry.get()
    if input_text:
        try:
            base64_value = base64.b64encode(input_text.encode()).decode()
            output_label.config(text=base64_value)
        except Exception as e:
            messagebox.showerror("错误", "转换失败: {}".format(str(e)))


def convert_from_base64():
    base64_text = input_entry.get()
    if base64_text:
        try:
            string_value = base64.b64decode(base64_text).decode()
            output_label.config(text=string_value)
        except Exception as e:
            messagebox.showerror("错误", "转换失败: {}".format(str(e)))


def convert_to_binary():
    input_text = input_entry.get()
    if input_text:
        try:
            binary_value = ' '.join(format(ord(c), '08b') for c in input_text)
            output_label.config(text=binary_value)
        except Exception as e:
            messagebox.showerror("错误", "转换失败: {}".format(str(e)))


def convert_from_binary():
    binary_text = input_entry.get()
    if binary_text:
        try:
            string_value = ''.join(chr(int(binary_text[i:i + 8], 2)) for i in range(0, len(binary_text), 8))
            output_label.config(text=string_value)
        except Exception as e:
            messagebox.showerror("错误", "转换失败: {}".format(str(e)))


def reverse_string():
    input_text = input_entry.get()
    if input_text:
        reversed_text = input_text[::-1]
        output_label.config(text=reversed_text)


def caesar_encrypt():
    input_text = input_entry.get()
    if input_text:
        encrypted_results = []
        for shift in range(26):
            encrypted_text = ''.join(
                chr(((ord(c) - ord('A') + shift) % 26) + ord('A')) if 'A' <= c <= 'Z' else c for c in
                input_text.upper())
            encrypted_results.append("Shift {}: {}".format(shift, encrypted_text))

        with open("caesar_encryption_results.txt", "w") as file:
            for result in encrypted_results:
                file.write(result + "\n")

        messagebox.showinfo("完成", "凯撒加密完成，结果已保存到文件目录下。")


def caesar_decrypt():
    input_text = input_entry.get()
    if input_text:
        decrypted_results = []
        for shift in range(26):
            decrypted_text = ''.join(
                chr(((ord(c) - ord('A') - shift) % 26) + ord('A')) if 'A' <= c <= 'Z' else c for c in
                input_text.upper())
            decrypted_results.append("Shift {}: {}".format(shift, decrypted_text))

        with open("caesar_decryption_results.txt", "w") as file:
            for result in decrypted_results:
                file.write(result + "\n")

        messagebox.showinfo("完成", "凯撒解密完成，结果已保存到文件目录下。")


def copy_to_clipboard():
    output_value = output_label.cget("text")
    root.clipboard_clear()
    root.clipboard_append(output_value)
    messagebox.showinfo("复制成功", "已复制到剪贴板。")


# 创建主窗口
root = tk.Tk()
root.title("字符与编码转换")

# 创建 Frame1
frame1 = tk.Frame(root)
frame1.pack(fill="both", expand=True)

# 创建输入框
input_entry = tk.Entry(frame1, width=30)
input_entry.pack(pady=10)

# 创建转换按钮
convert_to_hex_button = tk.Button(frame1, text="字符转16进制", command=convert_to_hex)
convert_to_hex_button.pack()

convert_to_string_button = tk.Button(frame1, text="16进制转字符", command=convert_to_string)
convert_to_string_button.pack()

convert_to_base64_button = tk.Button(frame1, text="字符串转Base64", command=convert_to_base64)
convert_to_base64_button.pack()

convert_from_base64_button = tk.Button(frame1, text="Base64转字符串", command=convert_from_base64)
convert_from_base64_button.pack()

convert_to_binary_button = tk.Button(frame1, text="字符串转二进制", command=convert_to_binary)
convert_to_binary_button.pack()

convert_from_binary_button = tk.Button(frame1, text="二进制转字符串", command=convert_from_binary)
convert_from_binary_button.pack()

reverse_string_button = tk.Button(frame1, text="颠倒字符", command=reverse_string)
reverse_string_button.pack()

caesar_encrypt_button = tk.Button(frame1, text="凯撒加密", command=caesar_encrypt)
caesar_encrypt_button.pack()

caesar_decrypt_button = tk.Button(frame1, text="凯撒解密", command=caesar_decrypt)
caesar_decrypt_button.pack()

# 创建输出标签
output_label = tk.Label(frame1, text="")
output_label.pack(pady=10)

# 创建复制按钮
copy_button = tk.Button(frame1, text="复制", command=copy_to_clipboard)
copy_button.pack()



# 运行主事件循环
frame1.tkraise()
root.mainloop()
