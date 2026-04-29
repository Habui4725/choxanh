from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from datetime import datetime
from dotenv import load_dotenv
from db import db
import os
import hmac
import hashlib
import urllib.parse

load_dotenv()

router = APIRouter()


def sort_params(params: dict):
    return dict(sorted(params.items()))


def create_vnpay_secure_hash(params: dict, secret_key: str):
    sorted_params = sort_params(params)

    hash_data = urllib.parse.urlencode(
        sorted_params,
        quote_via=urllib.parse.quote
    )

    secure_hash = hmac.new(
        secret_key.encode("utf-8"),
        hash_data.encode("utf-8"),
        hashlib.sha512
    ).hexdigest()

    return secure_hash, hash_data


@router.post("/create_payment_url")
async def create_payment_url(data: dict, request: Request):
    user_id = data.get("user_id")

    if not user_id:
        return {"error": "Thiếu user_id"}

    cart = db["cart"].find_one({"user_id": user_id})

    if not cart:
        cart = db["carts"].find_one({"user_id": user_id})

    if not cart or "items" not in cart or len(cart["items"]) == 0:
        return {
            "error": "Giỏ hàng trống hoặc không tìm thấy giỏ hàng",
            "user_id": user_id
        }

    total_amount = sum(
        int(item.get("price", 0)) * int(item.get("quantity", 0))
        for item in cart["items"]
    )

    if total_amount <= 0:
        return {"error": "Tổng tiền không hợp lệ"}

    txn_ref = datetime.now().strftime("%Y%m%d%H%M%S")

    order = {
        "user_id": user_id,
        "customer": {
            "full_name": data.get("full_name", ""),
            "phone": data.get("phone", ""),
            "address": data.get("address", "")
        },
        "items": cart["items"],
        "payment_method": "VNPAY",
        "payment_status": "unpaid",
        "total_price": total_amount,
        "total_amount": total_amount,
        "status": "pending",
        "vnp_txn_ref": txn_ref,
        "created_at": datetime.now().isoformat()
    }

    result = db["orders"].insert_one(order)
    order_id = str(result.inserted_id)

    tmn_code = os.getenv("VNP_TMN_CODE")
    secret_key = os.getenv("VNP_HASH_SECRET")
    pay_url = os.getenv("VNP_PAY_URL")
    return_url = os.getenv("VNP_RETURN_URL")

    if not tmn_code or not secret_key or not pay_url or not return_url:
        return {
            "error": "Thiếu cấu hình VNPAY trong file .env",
            "VNP_TMN_CODE": bool(tmn_code),
            "VNP_HASH_SECRET": bool(secret_key),
            "VNP_PAY_URL": bool(pay_url),
            "VNP_RETURN_URL": bool(return_url)
        }

    vnp_params = {
        "vnp_Version": "2.1.0",
        "vnp_Command": "pay",
        "vnp_TmnCode": tmn_code,
        "vnp_Amount": total_amount * 100,
        "vnp_CurrCode": "VND",
        "vnp_TxnRef": txn_ref,
        "vnp_OrderInfo": f"Thanh_toan_don_hang_{txn_ref}",
        "vnp_OrderType": "other",
        "vnp_Locale": data.get("language", "vn"),
        "vnp_ReturnUrl": return_url,
        "vnp_IpAddr": "127.0.0.1",
        "vnp_CreateDate": datetime.now().strftime("%Y%m%d%H%M%S")
    }

    bank_code = data.get("bankCode")
    if bank_code:
        vnp_params["vnp_BankCode"] = bank_code

    secure_hash, query_string = create_vnpay_secure_hash(vnp_params, secret_key)

    payment_url = (
        pay_url
        + "?"
        + query_string
        + "&vnp_SecureHash="
        + secure_hash
    )

    return {
        "paymentUrl": payment_url,
        "order_id": order_id,
        "vnp_txn_ref": txn_ref,
        "total_amount": total_amount,
        "total_price": total_amount
    }


@router.get("/vnpay_return")
async def vnpay_return(request: Request):
    params = dict(request.query_params)

    secure_hash = params.pop("vnp_SecureHash", None)
    params.pop("vnp_SecureHashType", None)

    secret_key = os.getenv("VNP_HASH_SECRET")

    if not secret_key:
        return RedirectResponse(
            "http://localhost:3000/vnpay_return?vnp_ResponseCode=97"
        )

    check_hash, _ = create_vnpay_secure_hash(params, secret_key)

    txn_ref = params.get("vnp_TxnRef")
    response_code = params.get("vnp_ResponseCode")

    if secure_hash == check_hash and response_code == "00":
        order = db["orders"].find_one({"vnp_txn_ref": txn_ref})

        if order:
            db["orders"].update_one(
                {"vnp_txn_ref": txn_ref},
                {
                    "$set": {
                        "status": "paid",
                        "payment_status": "paid",
                        "paid_at": datetime.now().isoformat()
                    }
                }
            )

            db["cart"].delete_one({"user_id": order["user_id"]})
            db["carts"].delete_one({"user_id": order["user_id"]})

    frontend_url = (
        f"http://localhost:3000/vnpay_return"
        f"?vnp_ResponseCode={response_code}"
        f"&vnp_TxnRef={txn_ref}"
    )

    return RedirectResponse(frontend_url)