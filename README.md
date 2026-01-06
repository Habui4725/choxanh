Học viện hàng không Việt Nam - Khoa Công nghệ Thông tin

🥬 Chợ Xanh Thông Minh

Hệ thống web bán thực phẩm tích hợp AI 

 Giới thiệu đề tài
Trong xu hướng chuyển đổi số hiện nay, các hệ thống siêu thị trực tuyến đang dần trở thành công cụ quen thuộc để người dùng tìm kiếm và mua nguyên liệu nấu ăn.Tuy nhiên, một hạn chế lớn là người dùng không biết nên nấu món gì hoặc không biết cần mua thêm nguyên liệu gì để hoàn thành món ăn.
Đề tài “Chợ Xanh Thông Minh” được xây dựng nhằm mô phỏng mô hình hoạt động của một website bán hàng như Bách Hóa Xanh, nhưng được bổ sung trí tuệ nhân tạo (AI) và hệ thống dữ liệu linh hoạt để hỗ trợ người dùng từ bước chọn món đến chuẩn bị nguyên liệu.
Hệ thống cho phép người dùng tìm kiếm nguyên liệu, gợi ý các nguyên liệu phù hợp theo yêu cầu khách hàng tìm kiếm, và tạo danh sách nguyên liệu cần mua, mang đến trải nghiệm “siêu thị trực tuyến + trợ lý nấu ăn AI” trên cùng một nền tảng.

Công nghệ sử dụng

Thành phần

Công nghệ

Frontend

Next.js

Backend

Python FastAPI

Database

MongoDB

AI

RAG – gợi ý nguyên liệu

Cấu trúc dự án

CHOXANH/
├── choxanh-frontend/   # Giao diện người dùng (Next.js)
└── choxanh-backend/    # API & xử lý dữ liệu (FastAPI)

6. Cách chạy dự án

Frontend (Next.js)

cd choxanh-frontend
npm install
npm run dev

Backend (FastAPI)

cd choxanh-backend
python -m venv venv
source venv/bin/activate  # hoặc venv\Scripts\activate trên Windows
pip install -r requirements.txt
uvicorn main:app --reload

Giảng viên hướng dẫn: TS. Trần Hoàng Lộc
