import { Attio } from "attio-js";

const attioClient = new Attio({
  apiKey: process.env["NEXT_PUBLIC_ATTIO_API_KEY"] ?? "",
});

export { attioClient };
