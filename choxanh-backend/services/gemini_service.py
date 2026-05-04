import os
import json
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Model bạn đang dùng
MODEL_NAME = "gemini-2.5-flash"


# PHÂN TÍCH INTENT

def analyze_user_intent(user_input: str):
    prompt = f"""
Phân tích câu sau và trả về JSON:

"{user_input}"

JSON mẫu:
{{
  "intent": "find | cheapest | suggest | ingredients",
  "dish": "",
  "ingredients": []
}}
"""

    try:
        res = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )

        text = (res.text or "").strip()

        start = text.find("{")
        end = text.rfind("}") + 1

        return json.loads(text[start:end])

    except Exception as e:
        print("Intent error:", e)
        return {
            "intent": "find",
            "dish": user_input,
            "ingredients": []
        }


# TRẢ LỜI CHÍNH (DÙNG GEMINI)

def ask_gemini(prompt: str) -> str:
    """
    Hàm này dùng để tạo câu trả lời chính trong API /chat.
    """
    try:
        res = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )
        return (res.text or "").strip()

    except Exception as e:
        print("Gemini answer error:", e)
        return "Xin lỗi, tôi không thể tạo câu trả lời lúc này."

# HÀM CŨ, KHÔNG DÙNG NỮA, CHỈ GIỮ LẠI ĐỂ TRÁNH LỖI IMPORT
def generate_answer_full(dish, ingredients, total):
    """
    Hàm cũ — vẫn giữ lại để tránh lỗi import,
    nhưng API /chat KHÔNG dùng nữa.
    """
    names = [i.get("ingredient", "") for i in ingredients]

    prompt = f"""
Món: {dish}
Nguyên liệu: {", ".join(names)}
Tổng tiền: {total} VNĐ

Viết mô tả món, cách nấu, mẹo nấu ngon.
"""

    try:
        res = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )
        return (res.text or "").strip()

    except Exception as e:
        print("Answer error:", e)
        return ""


# GỢI Ý MÓN 
def suggest_similar(recipes, current_name):
    return [
        r.get("name") for r in recipes
        if r.get("name") and r.get("name") != current_name
    ][:3]


# MÓN RẺ HƠN
def find_cheaper_options(recipes, current_total, map_func):
    result = []

    for r in recipes:
        total = 0

        for ing in r.get("ingredients", []):
            p = map_func(ing)
            if p:
                price = p.get("price", 0)
                if isinstance(price, (int, float)):
                    total += price

        if total < current_total:
            result.append(r.get("name"))

    return result[:3]
