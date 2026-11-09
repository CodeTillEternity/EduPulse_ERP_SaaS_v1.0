package com.erp.common.storage;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.services.s3.model.S3ObjectInputStream;
import org.apache.http.client.methods.HttpRequestBase;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class S3StorageServiceTest {

    private AmazonS3 amazonS3;
    private S3StorageService s3StorageService;

    @BeforeEach
    void setUp() {
        amazonS3 = mock(AmazonS3.class);
        s3StorageService = new S3StorageService(amazonS3, "test-bucket", "ap-south-1");
    }

    @Test
    @DisplayName("Should upload file to AWS S3 and return public CDN URL")
    void testUploadFileToS3() {
        String key = "tenants/test/students/1/photo.jpg";
        byte[] content = "test image binary content".getBytes(StandardCharsets.UTF_8);
        InputStream is = new ByteArrayInputStream(content);

        String url = s3StorageService.uploadFile(key, is, "image/jpeg", content.length);

        assertNotNull(url);
        assertEquals("https://test-bucket.s3.ap-south-1.amazonaws.com/tenants/test/students/1/photo.jpg", url);

        ArgumentCaptor<PutObjectRequest> requestCaptor = ArgumentCaptor.forClass(PutObjectRequest.class);
        verify(amazonS3, times(1)).putObject(requestCaptor.capture());

        PutObjectRequest captured = requestCaptor.getValue();
        assertEquals("test-bucket", captured.getBucketName());
        assertEquals(key, captured.getKey());
        assertEquals("image/jpeg", captured.getMetadata().getContentType());
        assertEquals(content.length, captured.getMetadata().getContentLength());
    }

    @Test
    @DisplayName("Should download file from AWS S3")
    void testDownloadFileFromS3() {
        String key = "tenants/test/documents/doc1.pdf";
        byte[] expected = "PDF Document Data".getBytes(StandardCharsets.UTF_8);

        S3Object s3Object = mock(S3Object.class);
        S3ObjectInputStream s3InputStream = new S3ObjectInputStream(
                new ByteArrayInputStream(expected),
                mock(HttpRequestBase.class)
        );
        when(s3Object.getObjectContent()).thenReturn(s3InputStream);
        when(amazonS3.getObject("test-bucket", key)).thenReturn(s3Object);

        byte[] actual = s3StorageService.downloadFile(key);

        assertArrayEquals(expected, actual);
        verify(amazonS3, times(1)).getObject("test-bucket", key);
    }

    @Test
    @DisplayName("Should delete file from AWS S3")
    void testDeleteFileFromS3() {
        String key = "tenants/test/students/1/old_photo.jpg";

        s3StorageService.deleteFile(key);

        verify(amazonS3, times(1)).deleteObject("test-bucket", key);
    }

    @Test
    @DisplayName("Should support simulated fallback mode when AWS S3 client is null")
    void testSimulatedFallbackMode() {
        S3StorageService fallbackService = new S3StorageService(null, "fallback-bucket", "us-east-1");

        byte[] bytes = "simulated bytes".getBytes(StandardCharsets.UTF_8);
        String url = fallbackService.uploadFile("test/file.png", new ByteArrayInputStream(bytes), "image/png", bytes.length);

        assertEquals("https://fallback-bucket.s3.us-east-1.amazonaws.com/test/file.png", url);

        byte[] downloaded = fallbackService.downloadFile("test/file.png");
        assertArrayEquals(bytes, downloaded);

        fallbackService.deleteFile("test/file.png");
        assertThrows(RuntimeException.class, () -> fallbackService.downloadFile("test/file.png"));
    }
}
