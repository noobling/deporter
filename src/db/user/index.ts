import db from "..";

interface User {
  name: string;
}

const collection = db.collection("user");
function create(user: User) {
  return collection.insertOne(user);
}

export default {
  create,
};
