import hashlib
import random
import uuid
from passlib.handlers.pbkdf2 import pbkdf2_sha256


#生成随机字符串UUID
def random_str():
    only = hashlib.md5(str(uuid.uuid1()).encode(encoding='UTF-8')).hexdigest()
    return str(only)


# 加密密码
def en_password(psw: str):
    password = pbkdf2_sha256.hash(psw)
    return password


## 检查密码
def check_password(password: str, old: str):
    check = pbkdf2_sha256.verify(password, old)
    if check:
        return True
    else:
        return False


#生成随机验证码
def code_number(ln: int):
    code = ""
    for i in range(ln):
        ch = chr(random.randrange(ord('0'), ord('9') + 1))
        code += ch

    return code

def is_gx_travel_related(question: str) -> bool:
    keywords = [ "桂林旅游", "北海旅游", "南宁旅游", 
                "旅游", "景区", "旅游路线","景点",
                "风景名胜","旅游规划","自然风光"]
    return any(word in question for word in keywords)

