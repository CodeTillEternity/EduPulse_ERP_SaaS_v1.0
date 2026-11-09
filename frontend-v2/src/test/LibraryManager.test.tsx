import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LibraryManager from '../pages/Operations/LibraryManager';
import * as enterpriseOpsService from '../api/enterpriseOpsService';

vi.mock('../api/enterpriseOpsService', () => ({
  getBooks: vi.fn(),
  addBook: vi.fn(),
  getActiveIssues: vi.fn(),
  issueBook: vi.fn(),
  returnBook: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('LibraryManager Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(enterpriseOpsService.getBooks).mockResolvedValue([
      {
        id: 1,
        title: 'Introduction to Algorithms',
        author: 'Thomas H. Cormen',
        isbn: '978-0262033848',
        totalCopies: 10,
        availableCopies: 8,
      },
      {
        id: 2,
        title: 'Design Patterns',
        author: 'Erich Gamma',
        isbn: '978-0201633610',
        totalCopies: 5,
        availableCopies: 0,
      },
    ]);

    vi.mocked(enterpriseOpsService.getActiveIssues).mockResolvedValue([
      {
        id: 101,
        bookId: 1,
        bookTitle: 'Introduction to Algorithms',
        isbn: '978-0262033848',
        studentId: 5,
        studentName: 'Alan Turing',
        enrollmentNumber: 'ENR-2026-001',
        issueDate: '2026-11-01',
        dueDate: '2026-11-15',
        status: 'ISSUED',
      },
    ]);
  });

  it('renders library header, metric cards, and book inventory list', async () => {
    render(<LibraryManager />, { wrapper: createWrapper() });

    expect(screen.getByText('Library & Resource Center')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Introduction to Algorithms')).toBeInTheDocument();
      expect(screen.getByText('Thomas H. Cormen')).toBeInTheDocument();
      expect(screen.getByText('978-0262033848')).toBeInTheDocument();
      expect(screen.getByText('8 available')).toBeInTheDocument();
      expect(screen.getByText('Design Patterns')).toBeInTheDocument();
      expect(screen.getByText('0 available')).toBeInTheDocument();
    });
  });

  it('switches between Inventory and Circulation tabs and displays active issues', async () => {
    render(<LibraryManager />, { wrapper: createWrapper() });

    // Click Circulation Tab
    const circulationTabBtn = screen.getByRole('button', { name: /Circulation/i });
    fireEvent.click(circulationTabBtn);

    await waitFor(() => {
      expect(screen.getByText('Issue Book to Student')).toBeInTheDocument();
      expect(screen.getByText('Active Lending Circulation')).toBeInTheDocument();
      expect(screen.getByText('Alan Turing')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Return Book/i })).toBeInTheDocument();
    });
  });

  it('opens and closes Add Book modal', async () => {
    render(<LibraryManager />, { wrapper: createWrapper() });

    const addBookBtn = screen.getByRole('button', { name: /Add Book Asset/i });
    fireEvent.click(addBookBtn);

    expect(screen.getByText('Catalog New Book')).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByText('Catalog New Book')).not.toBeInTheDocument();
    });
  });
});
