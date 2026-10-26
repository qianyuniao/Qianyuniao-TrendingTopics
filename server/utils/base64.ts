/**
 * Base64 编码
 * 仅少数源（如 coolapk 的签名计算）需要，故单独成文件
 */
import { Buffer } from "node:buffer"

export function encodeBase64(str: string) {
  return Buffer.from(str).toString("base64")
}
