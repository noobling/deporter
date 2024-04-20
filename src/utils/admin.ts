import { addEventMessage } from "../services/eventService"


const adminUser = {
    _id: "6621390b865b07107b36b7cc",
    created_at: '',
    name: 'Chief Deporter',
    sub: '',
    updated_at: '',
    photo: ''
}


export async function adminSendMessage({
    message
}: {
    message: string
}) {
    await addEventMessage(
        {
            content: message, media: []
        }, {
        id: "6621390b865b07107b36b7cc",
        authedUser: adminUser,
        queryParams: '',
    }
    )
}