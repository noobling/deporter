import { addEventMessage } from "../services/eventService";

const adminUser = {
  _id: "6621390b865b07107b36b7cc",
  created_at: "",
  name: "Chief Deporter",
  sub: "",
  updated_at: "",
  photo: "",
  email: "",
  friends: [],
};

export async function adminSendMessage({
  message,
  eventId,
}: {
  message: string;
  eventId: string;
}) {
  await addEventMessage(
    {
      content: message,
      media: [],
    },
    {
      id: eventId,
      authedUser: adminUser,
      queryParams: "",
    }
  );
}
