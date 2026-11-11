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

import jakarta.annotation.PostConstruct;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class NotionSyncService {

    private static final Logger log = LoggerFactory.getLogger(NotionSyncService.class);
    private static final String NOTION_API_BASE = "https://api.notion.com/v1";

    @Value("${notion.api-key:}")
    private String notionApiKey;

    @Value("${notion.version:2022-06-28}")
    private String notionVersion;

    private final RestTemplate restTemplate = new RestTemplate();
    private final Map<String, NotionPageDto> syncedPages = new ConcurrentHashMap<>();

    @PostConstruct
    public void init() {
        seedAcademicCurriculumNotes();
    }

    private void seedAcademicCurriculumNotes() {
        // 1. CS-302: Raft Consensus & Distributed Log Replication
        List<NotionBlockDto> cs302Blocks = new ArrayList<>();
        cs302Blocks.add(NotionBlockDto.builder()
                .id("cs-blk-1")
                .type("callout")
                .icon("💡")
                .plainText("FACULTY NOTE: These lecture notes are directly synchronized from Dr. Thorne's faculty Notion workspace. Read section 2 before Friday's lab.")
                .build());

        cs302Blocks.add(NotionBlockDto.builder()
                .id("cs-blk-2")
                .type("heading_1")
                .plainText("1. Replicated State Machine Architecture")
                .build());

        cs302Blocks.add(NotionBlockDto.builder()
                .id("cs-blk-3")
                .type("paragraph")
                .plainText("Replication algorithms manage a distributed collection of machines to compute identical state sequences despite fail-stop network partitions. In Raft, consensus is decomposed into leader election, log replication, and safety enforcement.")
                .build());

        cs302Blocks.add(NotionBlockDto.builder()
                .id("cs-blk-4")
                .type("callout")
                .icon("⚡")
                .plainText("Election Safety: At most one leader can be elected in a given term. A candidate must receive votes from a strict quorum (majority > N/2) of peers.")
                .build());

        cs302Blocks.add(NotionBlockDto.builder()
                .id("cs-blk-5")
                .type("heading_2")
                .plainText("2. The AppendEntries RPC Protocol")
                .build());

        cs302Blocks.add(NotionBlockDto.builder()
                .id("cs-blk-6")
                .type("paragraph")
                .plainText("The leader periodically issues AppendEntries remote procedure calls to transmit log entries and heartbeats. If followers find entries missing or uncommitted, they back off their nextIndex pointer.")
                .build());

        cs302Blocks.add(NotionBlockDto.builder()
                .id("cs-blk-7")
                .type("code")
                .language("rust")
                .plainText("pub struct AppendEntriesArgs {\n    pub term: u64,\n    pub leader_id: NodeId,\n    pub prev_log_index: usize,\n    pub prev_log_term: u64,\n    pub entries: Vec<LogEntry>,\n    pub leader_commit: usize,\n}\n\nimpl RaftNode {\n    pub fn handle_append_entries(&mut self, args: &AppendEntriesArgs) -> bool {\n        if args.term < self.current_term {\n            return false; // Reject outdated leader term\n        }\n        self.reset_election_timeout();\n        self.match_and_commit(args)\n    }\n}")
                .build());

        cs302Blocks.add(NotionBlockDto.builder()
                .id("cs-blk-8")
                .type("heading_2")
                .plainText("3. Core Log Invariants")
                .build());

        cs302Blocks.add(NotionBlockDto.builder()
                .id("cs-blk-9")
                .type("bulleted_list_item")
                .plainText("Leader Append-Only: A leader never overwrites or truncates its own log; it only appends new entries.")
                .build());

        cs302Blocks.add(NotionBlockDto.builder()
                .id("cs-blk-10")
                .type("bulleted_list_item")
                .plainText("Log Matching: If two logs contain an entry with the same index and term, the logs are identical in all entries up through that index.")
                .build());

        cs302Blocks.add(NotionBlockDto.builder()
                .id("cs-blk-11")
                .type("bulleted_list_item")
                .plainText("Leader Completeness: If a log entry is committed in a given term, that entry will be present in the logs of the leaders for all higher-numbered terms.")
                .build());

        cs302Blocks.add(NotionBlockDto.builder()
                .id("cs-blk-12")
                .type("heading_2")
                .plainText("4. Lab 3 Action Items")
                .build());

        cs302Blocks.add(NotionBlockDto.builder()
                .id("cs-blk-13")
                .type("to_do")
                .plainText("Implement 150ms-300ms randomized election timer with tokio")
                .checked(true)
                .build());

        cs302Blocks.add(NotionBlockDto.builder()
                .id("cs-blk-14")
                .type("to_do")
                .plainText("Simulate split-brain scenario with 5-node cluster partition")
                .checked(false)
                .build());

        cs302Blocks.add(NotionBlockDto.builder()
                .id("cs-blk-15")
                .type("to_do")
                .plainText("Submit benchmark report comparing Raft vs Multi-Paxos throughput")
                .checked(false)
                .build());

        NotionPageDto page1 = NotionPageDto.builder()
                .pageId("page-cs302-raft")
                .title("Week 04: Raft Consensus Protocol & Safety Invariants")
                .courseCode("CS-302")
                .courseName("Advanced Distributed Systems")
                .facultyName("Dr. Aris Thorne")
                .lastSyncedAt(Instant.now())
                .icon("🛰️")
                .coverUrl("https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop")
                .blocks(cs302Blocks)
                .build();

        syncedPages.put(page1.getPageId(), page1);

        // 2. SE-404: Cloud Architecture & Multi-Tenancy
        List<NotionBlockDto> se404Blocks = new ArrayList<>();
        se404Blocks.add(NotionBlockDto.builder()
                .id("se-blk-1")
                .type("callout")
                .icon("🏢")
                .plainText("FACULTY NOTE: Prof. Rostova's architectural blueprint for SaaS isolation models.")
                .build());

        se404Blocks.add(NotionBlockDto.builder()
                .id("se-blk-2")
                .type("heading_1")
                .plainText("1. Schema-Based Isolation vs Dedicated Databases")
                .build());

        se404Blocks.add(NotionBlockDto.builder()
                .id("se-blk-3")
                .type("paragraph")
                .plainText("In institutional SaaS, enterprise tenants (tier 3) demand dedicated PostgreSQL schemas and dynamic HikariCP routing pools to comply with FERPA and strict data sovereignty regulations.")
                .build());

        se404Blocks.add(NotionBlockDto.builder()
                .id("se-blk-4")
                .type("code")
                .language("java")
                .plainText("@Component\npublic class TenantContext {\n    private static final ThreadLocal<String> CURRENT_TENANT = new ThreadLocal<>();\n    public static void setTenantId(String tenantId) { CURRENT_TENANT.set(tenantId); }\n    public static String getTenantId() { return CURRENT_TENANT.get(); }\n    public static void clear() { CURRENT_TENANT.remove(); }\n}")
                .build());

        NotionPageDto page2 = NotionPageDto.builder()
                .pageId("page-se404-multitenancy")
                .title("Week 05: Multi-Tenant Schema Routing & HikariCP Pools")
                .courseCode("SE-404")
                .courseName("Cloud Systems Engineering")
                .facultyName("Prof. Elena Rostova")
                .lastSyncedAt(Instant.now())
                .icon("☁️")
                .coverUrl("https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1200&auto=format&fit=crop")
                .blocks(se404Blocks)
                .build();

        syncedPages.put(page2.getPageId(), page2);

        // 3. MA-201: Singular Value Decomposition
        List<NotionBlockDto> ma201Blocks = new ArrayList<>();
        ma201Blocks.add(NotionBlockDto.builder()
                .id("ma-blk-1")
                .type("callout")
                .icon("📐")
                .plainText("FACULTY NOTE: Dr. Marcus Vance's notes on spectral decomposition and low-rank matrix approximation.")
                .build());

        ma201Blocks.add(NotionBlockDto.builder()
                .id("ma-blk-2")
                .type("heading_1")
                .plainText("1. SVD Theorem for Arbitrary Real Matrices")
                .build());

        ma201Blocks.add(NotionBlockDto.builder()
                .id("ma-blk-3")
                .type("paragraph")
                .plainText("Every real matrix A (m x n) admits a factorization A = U Σ V^T where U and V are orthogonal matrices and Σ contains non-negative singular values arranged in descending order.")
                .build());

        NotionPageDto page3 = NotionPageDto.builder()
                .pageId("page-ma201-svd")
                .title("Week 03: Singular Value Decomposition & Low-Rank Approximation")
                .courseCode("MA-201")
                .courseName("Applied Linear Algebra & Tensors")
                .facultyName("Dr. Marcus Vance")
                .lastSyncedAt(Instant.now())
                .icon("📊")
                .coverUrl("https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format&fit=crop")
                .blocks(ma201Blocks)
                .build();

        syncedPages.put(page3.getPageId(), page3);
    }

    /**
     * Lists all synchronized Notion curriculum pages.
     */
    public List<NotionPageDto> getAvailablePages() {
        return new ArrayList<>(syncedPages.values());
    }

    /**
     * Retrieves a synchronized page with all native blocks.
     */
    public Optional<NotionPageDto> getPageById(String pageId) {
        return Optional.ofNullable(syncedPages.get(pageId));
    }

    /**
     * Synchronizes blocks from the Notion API directly.
     */
    public NotionPageDto syncPageFromNotion(String pageId) {
        NotionPageDto existing = syncedPages.get(pageId);
        if (existing == null) {
            existing = NotionPageDto.builder()
                    .pageId(pageId)
                    .title("Synced Notion Workspace Notes")
                    .courseCode("GEN-101")
                    .courseName("General Lecture Notes")
                    .facultyName("Connected Faculty Workspace")
                    .lastSyncedAt(Instant.now())
                    .icon("📝")
                    .blocks(new ArrayList<>())
                    .build();
        }

        // If Notion API Key is present, make REST call to Notion API
        if (notionApiKey != null && !notionApiKey.isBlank() && !notionApiKey.startsWith("placeholder")) {
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setBearerAuth(notionApiKey);
                headers.set("Notion-Version", notionVersion);
                headers.setContentType(MediaType.APPLICATION_JSON);

                HttpEntity<Void> entity = new HttpEntity<>(headers);
                ResponseEntity<String> response = restTemplate.exchange(
                        NOTION_API_BASE + "/blocks/" + pageId + "/children?page_size=100",
                        HttpMethod.GET,
                        entity,
                        String.class
                );

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    JSONObject body = new JSONObject(response.getBody());
                    if (body.has("results")) {
                        JSONArray results = body.getJSONArray("results");
                        List<NotionBlockDto> parsedBlocks = new ArrayList<>();
                        for (int i = 0; i < results.length(); i++) {
                            JSONObject blk = results.getJSONObject(i);
                            String type = blk.optString("type", "paragraph");
                            String plainText = "";
                            if (blk.has(type)) {
                                JSONObject content = blk.getJSONObject(type);
                                if (content.has("rich_text")) {
                                    JSONArray richTextArr = content.getJSONArray("rich_text");
                                    StringBuilder sb = new StringBuilder();
                                    for (int j = 0; j < richTextArr.length(); j++) {
                                        sb.append(richTextArr.getJSONObject(j).optString("plain_text", ""));
                                    }
                                    plainText = sb.toString();
                                }
                            }
                            parsedBlocks.add(NotionBlockDto.builder()
                                    .id(blk.optString("id", UUID.randomUUID().toString()))
                                    .type(type)
                                    .plainText(plainText)
                                    .build());
                        }
                        if (!parsedBlocks.isEmpty()) {
                            existing.setBlocks(parsedBlocks);
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("Notion API sync exception; maintaining local cache: {}", e.getMessage());
            }
        }

        existing.setLastSyncedAt(Instant.now());
        syncedPages.put(pageId, existing);
        return existing;
    }
}

