package com.erp.common.storage;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.auth.DefaultAWSCredentialsProviderChain;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import com.amazonaws.services.s3.model.S3Object;
import com.amazonaws.util.IOUtils;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * AWS S3 cloud storage implementation.
 * Eliminates ephemeral Docker filesystem dependencies by streaming uploads directly to Amazon S3.
 */
@Service
@Primary
public class S3StorageService implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(S3StorageService.class);

    @Value("${AWS_ACCESS_KEY:${aws.access-key:}}")
    private String accessKey;

    @Value("${AWS_SECRET_KEY:${aws.secret-key:}}")
    private String secretKey;

    @Value("${AWS_REGION:${aws.region:us-east-1}}")
    private String region;

    @Value("${AWS_BUCKET_NAME:${aws.s3.bucket-name:edupulse-saas-storage}}")
    private String bucketName;

    private AmazonS3 s3Client;

    // Fallback in-memory cache for local development/offline testing when AWS credentials are not configured
    private final Map<String, byte[]> localFallbackCache = new ConcurrentHashMap<>();

    public S3StorageService() {
    }

    public S3StorageService(AmazonS3 s3Client, String bucketName, String region) {
        this.s3Client = s3Client;
        this.bucketName = bucketName;
        this.region = region;
    }

    @PostConstruct
    public void init() {
        if (s3Client != null) {
            return;
        }

        try {
            if (accessKey != null && !accessKey.isBlank() && secretKey != null && !secretKey.isBlank()) {
                BasicAWSCredentials credentials = new BasicAWSCredentials(accessKey.trim(), secretKey.trim());
                this.s3Client = AmazonS3ClientBuilder.standard()
                        .withRegion(resolveRegion(region))
                        .withCredentials(new AWSStaticCredentialsProvider(credentials))
                        .build();
                log.info("Initialized AWS S3 client with explicit credentials for region [{}] and bucket [{}]", region, bucketName);
            } else {
                // Attempt default credentials chain (IAM role, env vars)
                try {
                    this.s3Client = AmazonS3ClientBuilder.standard()
                            .withRegion(resolveRegion(region))
                            .withCredentials(DefaultAWSCredentialsProviderChain.getInstance())
                            .build();
                    log.info("Initialized AWS S3 client using default AWS credentials chain for bucket [{}]", bucketName);
                } catch (Exception ex) {
                    log.warn("AWS credentials not configured. S3StorageService operating in simulated mock mode for local development: {}", ex.getMessage());
                }
            }
        } catch (Exception e) {
            log.warn("Failed to initialize AWS S3 client: {}. Falling back to simulated storage.", e.getMessage());
        }
    }

    private Regions resolveRegion(String regionName) {
        if (regionName == null || regionName.isBlank()) {
            return Regions.US_EAST_1;
        }
        try {
            return Regions.fromName(regionName.trim().toLowerCase());
        } catch (Exception e) {
            return Regions.US_EAST_1;
        }
    }

    @Override
    public String uploadFile(String key, InputStream inputStream, String contentType, long contentLength) {
        String sanitizedKey = sanitizeKey(key);

        if (s3Client != null) {
            try {
                ObjectMetadata metadata = new ObjectMetadata();
                metadata.setContentType(contentType != null ? contentType : "application/octet-stream");
                metadata.setContentLength(contentLength);

                PutObjectRequest putRequest = new PutObjectRequest(bucketName, sanitizedKey, inputStream, metadata)
                        .withCannedAcl(CannedAccessControlList.PublicRead);

                s3Client.putObject(putRequest);
                log.info("Successfully uploaded object to AWS S3: [{}/{}]", bucketName, sanitizedKey);
            } catch (Exception ex) {
                log.error("Failed to upload object to AWS S3 bucket [{}]: {}", bucketName, ex.getMessage(), ex);
                throw new RuntimeException("S3 upload failed for key: " + sanitizedKey, ex);
            }
        } else {
            // Simulated fallback
            try {
                byte[] bytes = inputStream.readAllBytes();
                localFallbackCache.put(sanitizedKey, bytes);
                log.info("Simulated S3 upload stored in memory cache: [{}]", sanitizedKey);
            } catch (Exception e) {
                throw new RuntimeException("Simulated upload failed: " + e.getMessage(), e);
            }
        }

        return getFileUrl(sanitizedKey);
    }

    @Override
    public byte[] downloadFile(String key) {
        String sanitizedKey = sanitizeKey(key);

        if (s3Client != null) {
            try (S3Object s3Object = s3Client.getObject(bucketName, sanitizedKey);
                 InputStream in = s3Object.getObjectContent()) {
                return IOUtils.toByteArray(in);
            } catch (Exception ex) {
                log.error("Failed to download object from AWS S3 [{}]: {}", sanitizedKey, ex.getMessage());
                throw new RuntimeException("S3 download failed for key: " + sanitizedKey, ex);
            }
        }

        byte[] cached = localFallbackCache.get(sanitizedKey);
        if (cached != null) {
            return cached;
        }
        throw new RuntimeException("File not found in simulated S3 storage: " + sanitizedKey);
    }

    @Override
    public void deleteFile(String key) {
        String sanitizedKey = sanitizeKey(key);
        if (s3Client != null) {
            try {
                s3Client.deleteObject(bucketName, sanitizedKey);
                log.info("Successfully deleted object from AWS S3: [{}]", sanitizedKey);
            } catch (Exception ex) {
                log.error("Failed to delete object from AWS S3 [{}]: {}", sanitizedKey, ex.getMessage());
            }
        }
        localFallbackCache.remove(sanitizedKey);
    }

    @Override
    public String getFileUrl(String key) {
        String sanitizedKey = sanitizeKey(key);
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, sanitizedKey);
    }

    private String sanitizeKey(String key) {
        if (key == null || key.isBlank()) {
            return "assets/unnamed-" + System.currentTimeMillis();
        }
        return key.replaceAll("^/+", "").replaceAll("\\\\+", "/");
    }

    public AmazonS3 getS3Client() {
        return s3Client;
    }

    public void setS3Client(AmazonS3 s3Client) {
        this.s3Client = s3Client;
    }

    public String getBucketName() {
        return bucketName;
    }

    public String getRegion() {
        return region;
    }
}
