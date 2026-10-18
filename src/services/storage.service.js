import ImageKit, { toFile } from "@imagekit/nodejs";
import config from "../config/config.js";

const client = new ImageKit({
  privateKey: config.IMAGEKIT_PRIVATE_KEY,
});

export async function uploadfiles(buffer) {
//   console.log(buffer);
 const response = await client.files.upload({
    file: await toFile(buffer),
    fileName: Date.now() + "fileName",
    folder:"Snitch"
  });
  return response;
}
