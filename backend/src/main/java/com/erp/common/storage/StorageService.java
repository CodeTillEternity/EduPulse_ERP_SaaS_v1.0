package com.erp.common.storage;

import java.io.InputStream;

/**
 * Generic abstraction for multi-tenant cloud object storage providers.
 * Completely decouples enterprise asset management from the container local filesystem.
 */
public interface StorageService {

    /**
     * Uploads an object payload to cloud storage.
     *
     * @param key           destination object key / path
     * @param inputStream   stream of file bytes
     * @param contentType   MIME type (e.g. image/png, application/pdf)
     * @param contentLength total size in bytes
     * @return public CDN or cloud storage URL
     */
    String uploadFile(String key, InputStream inputStream, String contentType, long contentLength);

    /**
     * Downloads an object payload from cloud storage.
     *
     * @param key object key / path
     * @return byte array of file contents
     */
    byte[] downloadFile(String key);

    /**
     * Deletes an object from cloud storage.
     *
     * @param key object key / path
     */
    void deleteFile(String key);

    /**
     * Resolves the public CDN or S3 URL for a given object key.
     *
     * @param key object key / path
     * @return absolute URL
     */
    String getFileUrl(String key);
}
