"use client";

import { useSearchParams } from "next/navigation";

export default function VnpayReturnPage() {
  const searchParams = useSearchParams();

  const code = searchParams.get("vnp_ResponseCode");
  const txnRef = searchParams.get("vnp_TxnRef");

  return (
    <div className="max-w-3xl mx-auto mt-40 text-center">
      {code === "00" ? (
        <>
          <h1 className="text-4xl font-bold text-green-600 mb-4">
            ✅ Thanh toán thành công
          </h1>
          <p className="text-gray-600">
            Mã giao dịch: {txnRef}
          </p>
        </>
      ) : (
        <>
          <h1 className="text-4xl font-bold text-red-600 mb-4">
            ❌ Thanh toán thất bại
          </h1>
          <p className="text-gray-600">
            Mã lỗi: {code}
          </p>
        </>
      )}
    </div>
  );
}