import { analyticsDb } from "./db";

function addView(
  page: string,
  data: {
    userAgent: string;
    ipAddress: string;
  }
) {
  return analyticsDb.collection("views").insertOne({
    timestamp: new Date(),
    page,
    data,
  });
}

export default {
  addView,
};
