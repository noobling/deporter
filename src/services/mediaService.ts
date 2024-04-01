import media from "../db/media";
import { AuthContext, CreateMediaRequest, MediaResponse } from "../types";
import { getDownloadUrl, getSignedUrl } from "../utils/aws";
import { getTimestamps } from "../utils/date";

export async function createMedia(
  payload: CreateMediaRequest,
  context: AuthContext
): Promise<MediaResponse> {
  const result = await media.create({
    created_by: context.authedUser._id,
    ...payload,
    ...getTimestamps(),
  });

  const url = await getSignedUrl(result!!._id.toString());
  return {
    ...result,
    uploadUrl: url,
  } as unknown as MediaResponse;
}

export async function getMedia(payload: any, context: AuthContext) {
  const result = await media.get(context.id);
  const downloadUrl = getDownloadUrl(context.id);
  return {
    ...result,
    downloadUrl,
  } as unknown as MediaResponse;
}
