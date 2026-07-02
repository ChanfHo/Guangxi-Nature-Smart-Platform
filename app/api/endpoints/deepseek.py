
from fastapi import APIRouter, Depends
from tortoise.expressions import Q
from app.schemas.deepseek import QuestionRequest, AIResponse, TouristSpotOut
from app.models.base import TouristSpot
from app.api.extends.deepseek import call_deepseek
from app.core.Utils import is_gx_travel_related
from app.core.Auth import check_permissions
import re
import json

router = APIRouter(prefix='', tags=["AI"])

# 简单关键词提取函数
async def extract_keywords_from_question(question: str) -> list:
    return question.split()

@router.post("", response_model=AIResponse, dependencies=[Depends(check_permissions)])
async def ask_question(data: QuestionRequest):

    print("========== 收到前端请求 ==========")
    print(f"用户输入的问题: {data.question}")

    # 提取关键词
    keywords = await extract_keywords_from_question(data.question)
    print(f"提取的关键词: {keywords}")

    if is_gx_travel_related(data.question) :
        print("识别为广西旅游相关问题")
        # # # 拼接景点信息，格式化为“名字：描述”
        # # 根据关键词构造数据库查询条件
        # query_filter = Q()
        # for keyword in keywords:
        #     query_filter |= Q(region__icontains=keyword) | Q(description__icontains=keyword)

        # # 查找相关景点
        # spots = await TouristSpot.filter(query_filter).all()

        # spots_info = [f"{s.name}: {s.description}" for s in spots]

        # # 构造新的问题文本，将景点信息添加进去
        # new_question = f"{data.question}。以下是一些推荐的景点信息：{'; '.join(spots_info)}"

        # # 调用 DeepSeek API 获取回答
        # answer = await call_deepseek(new_question)
        
        # return AIResponse(
        #     answer=answer,
        #     route=[
        #         TouristSpotOut(
        #             name=s.name,
        #             description=s.description,
        #             latitude=s.latitude,
        #             longitude=s.longitude,
        #         ) for s in spots
        #     ] if spots else None
        # )

        #####AI搜索直接GeoJSON
        #构建一个复合 Prompt，要求 AI 同时输出回答 + 坐标列表
        new_question = (
            "请先用自然语言分段换行地回答用户的问题。"
            "然后在回答末尾单独列出涉及到的景点及其坐标、所在地级市和简短介绍，注意景点名称和介绍不许出现括号，格式如下：\n"
            "##坐标列表开始##\n景点名 - 坐标（纬度, 经度）- 所在城市（城市名）- 简介（30字左右）\n...\n##坐标列表结束##\n"
            f"问题：{data.question}"
        )
        print(f"构建的新问题 Prompt:\n{new_question}")

        response = await call_deepseek(new_question)
        print("AI 原始回答：")
        print(response)

        # 分离出 AI 回答（自然语言部分） 和 坐标部分
        if "##坐标列表开始##" in response:
            print("发现坐标标记，开始提取坐标列表")

            answer_part, coord_part = response.split("##坐标列表开始##", 1)
            coord_part = coord_part.split("##坐标列表结束##")[0]

            #正则提取
            pattern = re.compile(
                                 r"([\u4e00-\u9fa5A-Za-z0-9·\s]+)\s*[-–—]\s*坐标\s*（?(\d+\.\d+)[,，、 ]\s*(\d+\.\d+)）?\s*[-–—]\s*([\u4e00-\u9fa5A-Za-z0-9·\s]+)\s*[-–—]\s*(.{5,50})"
                                )
            matches = pattern.findall(coord_part)

            print("提取到的信息：")
            for match in matches:
                print(match)

            if matches:
                geojson = {
                    "type": "FeatureCollection",
                    "features": []
                }
                for name, lat, lon, city, info in matches:
                    geojson["features"].append({
                        "type": "Feature",
                        "properties": {
                            "name": name.strip(),
                            "city": city.strip(),
                            "info": info.strip()
                        },
                        "geometry": {
                            "type": "Point",
                            "coordinates": [float(lon), float(lat)]
                        }
                    })
                geojson_str = json.dumps(geojson, ensure_ascii=False)

                print("返回的 Route：")
                print(geojson_str)

                return AIResponse(answer=answer_part.strip(), route=geojson_str)
            else:
                print("未找到任何符合格式的坐标")
        else:
            print("未发现坐标标记，直接返回文本回答")
            final_response = AIResponse(answer=response.strip())
            print("返回的 AIResponse：")
            print(final_response)

            return AIResponse(answer=response.strip())

    else:
        # 不涉及旅游的普通问题，直接调用 deepseek

        print("非广西旅游问题，直接调用 AI")
        answer = await call_deepseek(data.question)
    
        final_response = AIResponse(answer=answer)
        print("✅ 返回的 AIResponse：")
        print(final_response)

        return AIResponse(answer=answer)
