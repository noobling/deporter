import { Model } from "./model";

interface IMedia {
  uploaded_by: string;
  type: string;
}

export class Media extends Model<IMedia> {
  constructor() {
    super("media");
  }
}
