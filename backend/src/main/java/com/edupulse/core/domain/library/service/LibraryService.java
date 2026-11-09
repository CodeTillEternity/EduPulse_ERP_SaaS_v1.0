package com.edupulse.core.domain.library.service;

import com.edupulse.core.domain.library.dto.BookRequestDTO;
import com.edupulse.core.domain.library.dto.BookResponseDTO;
import com.edupulse.core.domain.library.dto.IssueRequestDTO;
import com.edupulse.core.domain.library.dto.IssueResponseDTO;

import java.util.List;

/**
 * Service contract for library book catalog management and lending circulation.
 */
public interface LibraryService {

    BookResponseDTO addBook(BookRequestDTO request);

    List<BookResponseDTO> getAllBooks();

    BookResponseDTO getBookById(Long id);

    IssueResponseDTO issueBook(IssueRequestDTO request);

    IssueResponseDTO issueBook(Long bookId, Long studentId);

    IssueResponseDTO returnBook(Long issueId);

    List<IssueResponseDTO> getActiveIssues();

    List<IssueResponseDTO> getIssuesByStudent(Long studentId);
}
