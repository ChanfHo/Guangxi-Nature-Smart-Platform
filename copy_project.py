import os
import shutil
import re

src_dir = r"C:\Users\12160\Desktop\个人项目作品\ComputerDesign"
dest_dir = r"C:\Users\12160\Desktop\个人项目作品\ComputerDesign_OpenSource"

# Files and directories to ignore
IGNORE_DIRS = {'.idea', '.vscode', '__pycache__', 'venv', '.git', 'node_modules'}
IGNORE_FILES = {'新建文本文档.txt', 'extract_docs.py', 'docs_output.txt'}

def copy_project():
    if os.path.exists(dest_dir):
        shutil.rmtree(dest_dir)
    os.makedirs(dest_dir)

    for root, dirs, files in os.walk(src_dir):
        # Modify dirs in-place to ignore certain directories
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        
        # Determine the relative path
        rel_path = os.path.relpath(root, src_dir)
        dest_path = os.path.join(dest_dir, rel_path)
        
        if not os.path.exists(dest_path):
            os.makedirs(dest_path)
            
        for file in files:
            if file in IGNORE_FILES:
                continue
            
            src_file = os.path.join(root, file)
            dest_file = os.path.join(dest_path, file)
            
            # Read and replace sensitive info if it's a python file
            if file.endswith('.py'):
                try:
                    with open(src_file, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Redact DB passwords and host
                    content = re.sub(r"'your_db_password_here'", "'your_db_password_here'", content)
                    content = re.sub(r"'140\.143\.194\.176'", "'127.0.0.1'", content)
                    content = re.sub(r"'your_deepseek_api_key_here'", "'your_deepseek_api_key_here'", content)
                    content = re.sub(r'"your_jwt_secret_key_here"', '"your_jwt_secret_key_here"', content)
                    
                    with open(dest_file, 'w', encoding='utf-8') as f:
                        f.write(content)
                except Exception as e:
                    print(f"Error processing {src_file}: {e}")
                    shutil.copy2(src_file, dest_file)
            else:
                shutil.copy2(src_file, dest_file)

if __name__ == "__main__":
    copy_project()
    print("Project copied and redacted successfully.")
