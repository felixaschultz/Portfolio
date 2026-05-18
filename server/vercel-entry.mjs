import { createRequestHandler } from "react-router";
import * as build from "../build/server/index.js";

const handleRequest = createRequestHandler(build);

export default function handler(request) {
  return handleRequest(request);
}
