const express = require("express");
const router = express.Router();
const axios = require("axios");
const dotenv = require("dotenv");
const { getAccessToken } = require("../../utils/auth");

dotenv.config();

// 날짜 형식을 YYYYMMDD 형식으로 변환하는 함수
function formatDate(dateStr) {
  const year = dateStr.substring(0, 4);
  const month = dateStr.substring(5, 7);
  const day = dateStr.substring(8, 10);
  return `${year}${month}${day}`;
}

router.get("/", function (req, res) {
  res.send("GET request to /stock");
});

router.get("/request", async (req, res) => {
  // 쿼리 처리
  // 시장분류코드, 종목번호 (6자리)
  // ETN의 경우, Q로 시작 (EX. Q500001),
  // 시작, 종료, 기간분류코드(D:일봉, W:주봉, M:월봉, Y:년봉)
  // 0:수정주가 1:원주가
  const { marketCode, stockCode, startDate, endDate, period, prc } = req.query;

  // 날짜 형식을 YYYYMMDD 형식으로 변환
  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);

  console.log(`--- ${formattedEndDate}`);

  try {
    const apiResp = await getStock({
      marketCode,
      stockCode,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      period,
      prc,
    });
    console.log("성공!");

    res.status(200).json(apiResp);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching data");
  }
});

async function getStock({
  marketCode,
  stockCode,
  startDate,
  endDate,
  period,
  prc,
}) {
  const url = `https://openapi.koreainvestment.com:9443/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice`;
  const appKey = process.env.APP_KEY;

  const token = await getAccessToken();

  console.log(`hankookToken: ${token}`);

  // "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0b2tlbiIsImF1ZCI6Ijc1YmI5ZWQ5LTI2MWItNGE4ZS04OGQ2LTIzNWRjMGY2ZDE4MCIsInByZHRfY2QiOiIiLCJpc3MiOiJ1bm9ndyIsImV4cCI6MTcxNzc0OTQ1NSwiaWF0IjoxNzE3NjYzMDU1LCJqdGkiOiJQU0ROdkZ2QVFpc1pHaHZPWjBwUnNuMTVQUnFmUVlxQkhZbGsifQ.HjOMVTjiyQA_C3_jPZEpwiR4LesnWIoaTnuWcZE5HYCGtxpxd5tKb_A5fdbkBSwh5bZqaL1rki9gcV4CaYuEJg";
  const appSecret = process.env.APP_SECRET;
  const header = {
    headers: {
      "content-type": "application/json; charset=utf-8",
      authorization: `Bearer ${token}`,
      appkey: appKey,
      appsecret: appSecret,
      tr_id: "FHKST03010100",
    },
    params: {
      FID_COND_MRKT_DIV_CODE: marketCode,
      FID_INPUT_ISCD: stockCode,
      FID_INPUT_DATE_1: startDate,
      FID_INPUT_DATE_2: endDate,
      FID_PERIOD_DIV_CODE: period,
      FID_ORG_ADJ_PRC: prc,
    },
    // params: {
    //   FID_COND_MRKT_DIV_CODE: "J",
    //   FID_INPUT_ISCD: "005930",
    //   FID_INPUT_DATE_1: "20240505",
    //   FID_INPUT_DATE_2: "20240605",
    //   FID_PERIOD_DIV_CODE: "D",
    //   FID_ORG_ADJ_PRC: 0,
    // },
  };

  try {
    const resp = await axios.get(url, header);
    console.log(resp.data);
    return resp.data;
  } catch (error) {
    console.error(error);
  }
}

module.exports = router;
