import json

# 假设这是从数据库获取的数据
data = {
    "name": "John Doe",
    "age": 30,
    "job": "Designer"
}

# 打印数据为 JSON 格式
print(json.dumps(data))
