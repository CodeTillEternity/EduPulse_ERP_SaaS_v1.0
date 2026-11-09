package com.edupulse.core.domain.library.service;

import com.edupulse.core.domain.base.TenantContext;
import com.edupulse.core.domain.library.BookAsset;
import com.edupulse.core.domain.library.IssueStatus;
import com.edupulse.core.domain.library.LibraryIssue;
import com.edupulse.core.domain.library.dto.BookRequestDTO;
import com.edupulse.core.domain.library.dto.BookResponseDTO;
import com.edupulse.core.domain.library.dto.IssueRequestDTO;
import com.edupulse.core.domain.library.dto.IssueResponseDTO;
import com.edupulse.core.domain.library.repository.BookAssetRepository;
import com.edupulse.core.domain.library.repository.LibraryIssueRepository;
import com.edupulse.core.domain.student.Student;
import com.edupulse.core.domain.student.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Production implementation of LibraryService managing book inventory and circulation lifecycle.
 */
@Service("coreLibraryService")
@Transactional(readOnly = true)
public class LibraryServiceImpl implements LibraryService {

    private final BookAssetRepository bookAssetRepository;
    private final LibraryIssueRepository libraryIssueRepository;
    private final StudentRepository studentRepository;

    public LibraryServiceImpl(
            @Qualifier("coreBookAssetRepository") BookAssetRepository bookAssetRepository,
            @Qualifier("coreLibraryIssueRepository") LibraryIssueRepository libraryIssueRepository,
            @Qualifier("coreStudentRepository") StudentRepository studentRepository) {
        this.bookAssetRepository = bookAssetRepository;
        this.libraryIssueRepository = libraryIssueRepository;
        this.studentRepository = studentRepository;
    }

    private String getEffectiveTenantId() {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null || tenantId.isBlank()) {
            return "tenant-cambridge";
        }
        return tenantId;
    }

    @Override
    @Transactional
    public BookResponseDTO addBook(BookRequestDTO request) {
        String tenantId = getEffectiveTenantId();

        if (bookAssetRepository.existsByIsbnAndTenantId(request.getIsbn(), tenantId)) {
            throw new IllegalArgumentException("Book with ISBN " + request.getIsbn() + " already exists in inventory");
        }

        BookAsset book = BookAsset.builder()
                .title(request.getTitle())
                .author(request.getAuthor())
                .isbn(request.getIsbn())
                .totalCopies(request.getTotalCopies())
                .availableCopies(request.getTotalCopies())
                .build();
        book.setTenantId(tenantId);

        BookAsset saved = bookAssetRepository.save(book);
        return mapToBookResponseDTO(saved);
    }

    @Override
    public List<BookResponseDTO> getAllBooks() {
        String tenantId = getEffectiveTenantId();
        return bookAssetRepository.findByTenantId(tenantId).stream()
                .map(this::mapToBookResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public BookResponseDTO getBookById(Long id) {
        String tenantId = getEffectiveTenantId();
        BookAsset book = bookAssetRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Book not found with ID: " + id));
        return mapToBookResponseDTO(book);
    }

    @Override
    @Transactional
    public IssueResponseDTO issueBook(IssueRequestDTO request) {
        return issueBook(request.getBookId(), request.getStudentId());
    }

    @Override
    @Transactional
    public IssueResponseDTO issueBook(Long bookId, Long studentId) {
        String tenantId = getEffectiveTenantId();

        BookAsset book = bookAssetRepository.findByIdAndTenantId(bookId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Book asset not found with ID: " + bookId));

        if (book.getAvailableCopies() == null || book.getAvailableCopies() <= 0) {
            throw new IllegalStateException("No copies available for issue for book: " + book.getTitle());
        }

        Student student = studentRepository.findByIdAndTenantId(studentId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with ID: " + studentId));

        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookAssetRepository.save(book);

        LocalDate today = LocalDate.now();
        LibraryIssue issue = LibraryIssue.builder()
                .bookAsset(book)
                .student(student)
                .issueDate(today)
                .dueDate(today.plusDays(14))
                .status(IssueStatus.ISSUED)
                .build();
        issue.setTenantId(tenantId);

        LibraryIssue savedIssue = libraryIssueRepository.save(issue);
        return mapToIssueResponseDTO(savedIssue);
    }

    @Override
    @Transactional
    public IssueResponseDTO returnBook(Long issueId) {
        String tenantId = getEffectiveTenantId();

        LibraryIssue issue = libraryIssueRepository.findByIdAndTenantId(issueId, tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Library issue record not found with ID: " + issueId));

        if (issue.getStatus() == IssueStatus.RETURNED) {
            throw new IllegalStateException("Book issue has already been returned: " + issueId);
        }

        issue.setStatus(IssueStatus.RETURNED);
        issue.setReturnDate(LocalDate.now());
        LibraryIssue updatedIssue = libraryIssueRepository.save(issue);

        BookAsset book = issue.getBookAsset();
        if (book != null) {
            int newAvailable = (book.getAvailableCopies() == null ? 0 : book.getAvailableCopies()) + 1;
            if (book.getTotalCopies() != null && newAvailable > book.getTotalCopies()) {
                newAvailable = book.getTotalCopies();
            }
            book.setAvailableCopies(newAvailable);
            bookAssetRepository.save(book);
        }

        return mapToIssueResponseDTO(updatedIssue);
    }

    @Override
    public List<IssueResponseDTO> getActiveIssues() {
        String tenantId = getEffectiveTenantId();
        return libraryIssueRepository.findByStatusNotAndTenantId(IssueStatus.RETURNED, tenantId).stream()
                .map(this::mapToIssueResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<IssueResponseDTO> getIssuesByStudent(Long studentId) {
        String tenantId = getEffectiveTenantId();
        return libraryIssueRepository.findByStudentIdAndTenantId(studentId, tenantId).stream()
                .map(this::mapToIssueResponseDTO)
                .collect(Collectors.toList());
    }

    private BookResponseDTO mapToBookResponseDTO(BookAsset book) {
        return BookResponseDTO.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .isbn(book.getIsbn())
                .totalCopies(book.getTotalCopies())
                .availableCopies(book.getAvailableCopies())
                .tenantId(book.getTenantId())
                .build();
    }

    private IssueResponseDTO mapToIssueResponseDTO(LibraryIssue issue) {
        String studentName = "";
        String enrollmentNumber = "";
        Long studentId = null;

        if (issue.getStudent() != null) {
            studentId = issue.getStudent().getId();
            String firstName = issue.getStudent().getFirstName() != null ? issue.getStudent().getFirstName() : "";
            String lastName = issue.getStudent().getLastName() != null ? issue.getStudent().getLastName() : "";
            studentName = (firstName + " " + lastName).trim();
            enrollmentNumber = issue.getStudent().getEnrollmentNumber() != null ? issue.getStudent().getEnrollmentNumber() : "";
        }

        Long bookId = null;
        String bookTitle = "";
        String isbn = "";
        if (issue.getBookAsset() != null) {
            bookId = issue.getBookAsset().getId();
            bookTitle = issue.getBookAsset().getTitle();
            isbn = issue.getBookAsset().getIsbn();
        }

        return IssueResponseDTO.builder()
                .id(issue.getId())
                .bookId(bookId)
                .bookTitle(bookTitle)
                .isbn(isbn)
                .studentId(studentId)
                .studentName(studentName)
                .enrollmentNumber(enrollmentNumber)
                .issueDate(issue.getIssueDate())
                .dueDate(issue.getDueDate())
                .returnDate(issue.getReturnDate())
                .status(issue.getStatus())
                .tenantId(issue.getTenantId())
                .build();
    }
}
