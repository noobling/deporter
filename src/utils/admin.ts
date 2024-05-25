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
  route_to,
}: {
  message: string;
  eventId: string;
  route_to?: string;
}) {
  await addEventMessage(
    {
      content: message,
      media: [],
      route_to,
    },
    {
      id: eventId,
      authedUser: adminUser,
      queryParams: "",
    }
  );
}
