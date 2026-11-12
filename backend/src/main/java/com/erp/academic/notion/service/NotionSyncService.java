package com.erp.academic.notion.service;

import com.erp.academic.notion.dto.NotionBlockDto;
import com.erp.academic.notion.dto.NotionPageDto;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class NotionSyncService {

    private static final Logger log = LoggerFactory.getLogger(NotionSyncService.class);
    private static final String NOTION_API_BASE = "https://api.notion.com/v1";

    @Value("${edupulse.integrations.notion.api-secret:${NOTION_API_SECRET:${notion.api-key:}}}")
    private String notionApiSecret;

    @Value("${edupulse.integrations.notion.version:2022-06-28}")
    private String notionVersion;

    private final RestTemplate restTemplate = new RestTemplate();
    private final Map<String, NotionPageDto> syncedPages = new ConcurrentHashMap<>();

    private String resolveSecret() {
        if (notionApiSecret != null && !notionApiSecret.isBlank() && !notionApiSecret.startsWith("placeholder")) {
            return notionApiSecret;
        }
        String envSecret = System.getenv("NOTION_API_SECRET");
        if (envSecret != null && !envSecret.isBlank()) return envSecret;
        return System.getProperty("NOTION_API_SECRET", "");
    }

    /**
     * Lists all synchronized Notion curriculum pages.
     */
    public List<NotionPageDto> getAvailablePages() {
        return new ArrayList<>(syncedPages.values());
    }

    /**
     * Retrieves a page from local cache by page ID.
     */
    public Optional<NotionPageDto> getPageById(String pageId) {
        String cleanId = cleanPageId(pageId);
        return Optional.ofNullable(syncedPages.get(cleanId));
    }

    /**
     * Synchronizes live blocks directly from the official Notion API using a real Notion Page ID.
     * Uses Authorization: Bearer <notionApiSecret> and Notion-Version: 2022-06-28.
     * If the Notion page is empty or has no blocks, the returned blocks list is empty.
     */
    public NotionPageDto syncPageFromNotion(String pageId) {
        String cleanId = cleanPageId(pageId);
        String pageTitle = "Document " + cleanId;
        String pageIcon = "📄";
        List<NotionBlockDto> blocks = new ArrayList<>();

        String activeSecret = resolveSecret();
        if (activeSecret != null && !activeSecret.isBlank()) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setBearerAuth(activeSecret); // Authorization: Bearer <activeSecret>
                headers.set("Notion-Version", notionVersion); // Notion-Version: 2022-06-28
                headers.setContentType(MediaType.APPLICATION_JSON);
                HttpEntity<Void> entity = new HttpEntity<>(headers);

                // 1. Fetch Page Metadata from GET https://api.notion.com/v1/pages/{page_id}
                try {
                    ResponseEntity<String> pageRes = restTemplate.exchange(
                            NOTION_API_BASE + "/pages/" + cleanId,
                            HttpMethod.GET,
                            entity,
                            String.class
                    );
                    if (pageRes.getStatusCode().is2xxSuccessful() && pageRes.getBody() != null) {
                        JSONObject pageJson = new JSONObject(pageRes.getBody());
                        if (pageJson.has("icon") && !pageJson.isNull("icon")) {
                            JSONObject iconObj = pageJson.getJSONObject("icon");
                            if ("emoji".equals(iconObj.optString("type"))) {
                                pageIcon = iconObj.optString("emoji", "📄");
                            }
                        }
                        if (pageJson.has("properties")) {
                            JSONObject props = pageJson.getJSONObject("properties");
                            for (String key : props.keySet()) {
                                JSONObject prop = props.getJSONObject(key);
                                if ("title".equals(prop.optString("type")) && prop.has("title")) {
                                    JSONArray titleArr = prop.getJSONArray("title");
                                    if (titleArr.length() > 0) {
                                        pageTitle = titleArr.getJSONObject(0).optString("plain_text", pageTitle);
                                    }
                                }
                            }
                        }
                    }
                } catch (Exception ex) {
                    log.warn("Notion page metadata query notice: {}", ex.getMessage());
                }

                // 2. Fetch Block Children from GET https://api.notion.com/v1/blocks/{block_id}/children
                ResponseEntity<String> blockRes = restTemplate.exchange(
                        NOTION_API_BASE + "/blocks/" + cleanId + "/children?page_size=100",
                        HttpMethod.GET,
                        entity,
                        String.class
                );

                if (blockRes.getStatusCode().is2xxSuccessful() && blockRes.getBody() != null) {
                    JSONObject body = new JSONObject(blockRes.getBody());
                    if (body.has("results")) {
                        JSONArray results = body.getJSONArray("results");
                        for (int i = 0; i < results.length(); i++) {
                            JSONObject blk = results.getJSONObject(i);
                            String type = blk.optString("type", "paragraph");
                            String plainText = "";
                            String language = null;
                            Boolean checked = null;
                            String icon = null;

                            if (blk.has(type) && !blk.isNull(type)) {
                                JSONObject content = blk.getJSONObject(type);
                                if (content.has("rich_text")) {
                                    JSONArray richTextArr = content.getJSONArray("rich_text");
                                    StringBuilder sb = new StringBuilder();
                                    for (int j = 0; j < richTextArr.length(); j++) {
                                        sb.append(richTextArr.getJSONObject(j).optString("plain_text", ""));
                                    }
                                    plainText = sb.toString();
                                }
                                if (content.has("language")) {
                                    language = content.optString("language", null);
                                }
                                if (content.has("checked")) {
                                    checked = content.optBoolean("checked", false);
                                }
                                if (content.has("icon")) {
                                    JSONObject iconObj = content.optJSONObject("icon");
                                    if (iconObj != null && "emoji".equals(iconObj.optString("type"))) {
                                        icon = iconObj.optString("emoji", null);
                                    }
                                }
                            }

                            blocks.add(NotionBlockDto.builder()
                                    .id(blk.optString("id", UUID.randomUUID().toString()))
                                    .type(type)
                                    .plainText(plainText)
                                    .language(language)
                                    .checked(checked)
                                    .icon(icon)
                                    .build());
                        }
                        log.info("Notion synced {} blocks for page: {}", blocks.size(), cleanId);
                    }
                }
            } catch (Exception e) {
                log.warn("Notion API block fetch notice: {}", e.getMessage());
            }
        }

        NotionPageDto pageDto = NotionPageDto.builder()
                .pageId(cleanId)
                .title(pageTitle)
                .courseCode("CURR-" + cleanId.substring(0, Math.min(cleanId.length(), 4)).toUpperCase())
                .courseName("Academic Notes")
                .facultyName("Faculty Instructor")
                .lastSyncedAt(Instant.now())
                .icon(pageIcon)
                .coverUrl(null)
                .blocks(blocks)
                .build();

        syncedPages.put(cleanId, pageDto);
        return pageDto;
    }

    private String cleanPageId(String pageId) {
        if (pageId == null) return UUID.randomUUID().toString();
        String trimmed = pageId.trim();
        if (trimmed.contains("/")) {
            trimmed = trimmed.substring(trimmed.lastIndexOf('/') + 1);
        }
        if (trimmed.contains("?")) {
            trimmed = trimmed.substring(0, trimmed.indexOf('?'));
        }
        if (trimmed.contains("-") && trimmed.length() > 32) {
            String[] parts = trimmed.split("-");
            String lastPart = parts[parts.length - 1];
            if (lastPart.length() == 32) {
                return lastPart;
            }
        }
        return trimmed.replace("-", "");
    }
}
