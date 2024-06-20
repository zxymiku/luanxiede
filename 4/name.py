import os

def adjust_file_name(file_name):
    # 分离文件名中的数字和非数字部分
    num_part, non_num_part = '', ''
    for char in file_name:
        if char.isdigit():
            num_part += char
        else:
            non_num_part = file_name[file_name.index(char):]
            break

    # 计算数字部分的长度
    num_len = len(num_part)

    # 根据数字长度添加前置零
    if num_len == 1:
        adjusted_num_part = '00' + num_part
    elif num_len == 2:
        adjusted_num_part = '0' + num_part
    else:
        adjusted_num_part = num_part

    # 返回调整后的完整文件名
    return adjusted_num_part + non_num_part

def process_files_in_directory(dir_path):
    if not os.path.isdir(dir_path):
        raise ValueError(f"Invalid directory path: {dir_path}")

    for entry in os.listdir(dir_path):
        if os.path.isfile(os.path.join(dir_path, entry)):
            original_name = entry
            adjusted_name = adjust_file_name(entry)

            if original_name != adjusted_name:
                old_path = os.path.join(dir_path, original_name)
                new_path = os.path.join(dir_path, adjusted_name)

                # 如果调整后的文件名与原文件名不同，则重命名文件
                os.rename(old_path, new_path)
# 示例用法
directory_to_process = input("Enter the directory path: "))  # 替换为实际要处理的文件夹路径
process_files_in_directory(directory_to_process)
