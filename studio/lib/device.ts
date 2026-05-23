/** iOS Safari does not support reliable folder picks; avoid webkitdirectory there. */
export function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/i.test(navigator.userAgent);
}

export function supportsFolderUpload(): boolean {
  if (typeof document === "undefined" || isIos()) return false;
  const input = document.createElement("input");
  return "webkitdirectory" in input;
}
