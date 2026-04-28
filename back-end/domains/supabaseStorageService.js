import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const { SUPABASE_URL, SUPABASE_KEY, SUPABASE_BUCKET } = process.env;

if (!SUPABASE_URL || !SUPABASE_KEY || !SUPABASE_BUCKET) {
    throw new Error("Missing Supabase environment variables: SUPABASE_URL, SUPABASE_KEY, or SUPABASE_BUCKET");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Upload a file to Supabase Storage
 * @param {string} filename - The name of the file to store
 * @param {string} filePath - The local path to the file
 * @param {string} mimeType - The MIME type of the file
 * @returns {Promise<string>} Public URL of the uploaded file
 */
export const uploadToSupabase = async (filename, filePath, mimeType) => {
    try {
        const fileBuffer = fs.readFileSync(filePath);

        const { data, error } = await supabase.storage
            .from(SUPABASE_BUCKET)
            .upload(filename, fileBuffer, {
                contentType: mimeType,
                upsert: true,
            });

        if (error) {
            throw new Error(`Supabase upload error: ${error.message}`);
        }

        // Generate public URL
        const { data: publicUrlData } = supabase.storage
            .from(SUPABASE_BUCKET)
            .getPublicUrl(filename);

        return publicUrlData.publicUrl;
    } catch (error) {
        console.error("Error uploading file to Supabase:", error);
        throw error;
    } finally {
        fs.promises.unlink(filePath).catch(() => {});
    }
};

/**
 * Delete a file from Supabase Storage
 * @param {string} filename - The name of the file to delete
 * @returns {Promise<void>}
 */
export const deleteFromSupabase = async (filename) => {
    try {
        const { error } = await supabase.storage
            .from(SUPABASE_BUCKET)
            .remove([filename]);

        if (error) {
            throw new Error(`Supabase delete error: ${error.message}`);
        }
    } catch (error) {
        console.error("Error deleting file from Supabase:", error);
        throw error;
    }
};

/**
 * Get the public URL of a file
 * @param {string} filename - The name of the file
 * @returns {string} Public URL
 */
export const getSupabasePublicUrl = (filename) => {
    const { data } = supabase.storage
        .from(SUPABASE_BUCKET)
        .getPublicUrl(filename);

    return data.publicUrl;
};
