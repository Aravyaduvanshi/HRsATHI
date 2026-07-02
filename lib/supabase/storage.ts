 import { createServerSupabaseServiceClient } from "./server";

export const RESUME_BUCKET = "resumes";

/**
 * Upload Resume
 */
export async function uploadResume(
  path: string,
  file: File
) {
  const supabase = await createServerSupabaseServiceClient();

  const { data, error } = await supabase.storage
    .from(RESUME_BUCKET)
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
    });

  if (error) throw error;

  return data.path;
}

/**
 * Delete Resume
 */
export async function deleteResume(path: string) {
  const supabase = await createServerSupabaseServiceClient();

  const { error } = await supabase.storage
    .from(RESUME_BUCKET)
    .remove([path]);

  if (error) throw error;
}

/**
 * Signed URL
 */
export async function getSignedResumeUrl(path: string) {
  const supabase = await createServerSupabaseServiceClient();

  const { data, error } = await supabase.storage
    .from(RESUME_BUCKET)
    .createSignedUrl(path, 60 * 60);

  if (error) throw error;

  return data.signedUrl;
}