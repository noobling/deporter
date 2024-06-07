import media from "../db/media";
import { Context, CreateMediaRequest, MediaResponse } from "../types";
import { getDownloadUrl, getSignedUrl } from "../utils/aws";
import { getTimestamps } from "../utils/date";

export async function createMedia(
  payload: CreateMediaRequest,
  context: Context
): Promise<MediaResponse> {
  const extension = payload.extension
    ? `${payload.extension}`
    : payload.name?.split(".")?.pop() ?? "png";

  const result = await media.create({
    created_by: context.authedUser._id,
    ...payload,
    extension,
    ...getTimestamps(),
  });

  const url = await getSignedUrl(result!!._id.toString());

  return {
    ...result,
    uploadUrl: url,
  } as unknown as MediaResponse;
}

export async function getMedia(payload: any, context: Context) {
  const result = await media.get(context.id);
  const downloadUrl = getDownloadUrl(result.s3Key ?? context.id);

  return {
    ...result,
    downloadUrl,
  } as unknown as MediaResponse;
}
