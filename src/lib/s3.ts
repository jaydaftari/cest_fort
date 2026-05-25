import { S3Client, DeleteObjectsCommand } from '@aws-sdk/client-s3'
import { createLogger } from '@/lib/logger'

const logger = createLogger('Lib:S3')

export async function deleteFilesFromS3(keys: string[]): Promise<void> {
  const validKeys = keys.filter(Boolean)
  if (!validKeys.length) return
  if (!process.env.S3_BUCKET || !process.env.S3_ACCESS_KEY_ID || !process.env.S3_SECRET_ACCESS_KEY)
    return // local disk storage — nothing to do

  const client = new S3Client({
    region: process.env.S3_REGION ?? 'auto',
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  })

  try {
    const result = await client.send(
      new DeleteObjectsCommand({
        Bucket: process.env.S3_BUCKET,
        Delete: { Objects: validKeys.map((Key) => ({ Key })) },
      })
    )
    logger.info('S3 delete result', {
      deleted: result.Deleted?.map((d) => d.Key),
      errors: result.Errors,
    })
  } catch (err) {
    logger.warn('Failed to delete files from S3', { keys: validKeys, error: String(err) })
  }
}
