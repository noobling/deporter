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

async function getViews(page: string) {
  return await analyticsDb
    .collection("views")
    .find({
      // starts with page
      page: {
        $regex: new RegExp(`^${page}`),
      },
    })
    .toArray();
}

export default {
  addView,
  getViews,
};
