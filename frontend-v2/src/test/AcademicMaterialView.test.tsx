import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import React from 'react';
import AcademicMaterialView from '../components/materials/AcademicMaterialView';

describe('AcademicMaterialView Native Notion Block Component', () => {
  it('renders faculty notebook header and synchronized page title', () => {
    render(<AcademicMaterialView />);

    expect(screen.getByText(/NATIVE NOTION WORKSPACE SYNC/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Dr. Aris Thorne/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/CS-302/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Week 04: Raft Consensus Protocol/i).length).toBeGreaterThan(0);
  });

  it('renders native Notion block hierarchy including callout, heading, and code', () => {
    render(<AcademicMaterialView />);

    // Callout
    expect(screen.getByText(/FACULTY NOTE: These lecture notes are directly synchronized/i)).toBeInTheDocument();

    // Headings & paragraphs
    expect(screen.getByText(/1. Replicated State Machine Architecture/i)).toBeInTheDocument();
    expect(screen.getByText(/Replication algorithms manage a distributed collection/i)).toBeInTheDocument();

    // Code block
    expect(screen.getByText(/pub struct AppendEntriesArgs/i)).toBeInTheDocument();
  });

  it('interacts with checklist to-do items', () => {
    render(<AcademicMaterialView />);

    const todoText = screen.getByText(/Simulate split-brain scenario with 5-node cluster/i);
    expect(todoText).toBeInTheDocument();
    expect(todoText).not.toHaveClass('line-through');

    fireEvent.click(todoText);
    expect(todoText).toHaveClass('line-through');
  });

  it('filters document blocks when using search query', () => {
    render(<AcademicMaterialView />);

    const searchInput = screen.getByPlaceholderText(/Search notes in page.../i);
    fireEvent.change(searchInput, { target: { value: 'tokio' } });

    const docContainer = screen.getByTestId('notion-document-container');
    expect(within(docContainer).getByText(/Implement 150ms-300ms randomized election timer with tokio/i)).toBeInTheDocument();
    expect(within(docContainer).queryByText(/Replicated State Machine Architecture/i)).not.toBeInTheDocument();
  });
});
