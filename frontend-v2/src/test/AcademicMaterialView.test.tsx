import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import AcademicMaterialView from '../components/materials/AcademicMaterialView';

describe('AcademicMaterialView Notion Component', () => {
  it('renders blank slate document reader initially with no fake banners', () => {
    render(
      <MemoryRouter>
        <AcademicMaterialView />
      </MemoryRouter>
    );

    expect(screen.getAllByText(/Faculty Notes/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/No Notion Document Loaded/i)).toBeInTheDocument();
    expect(screen.queryByText(/NATIVE NOTION WORKSPACE SYNC/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/FACULTY NOTE:/i)).not.toBeInTheDocument();
  });

  it('fetches and renders Notion page blocks when page ID is submitted', async () => {
    render(
      <MemoryRouter>
        <AcademicMaterialView />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/Enter Notion Page ID/i);
    fireEvent.change(input, { target: { value: 'page-cs302-distributed' } });

    const fetchBtn = screen.getByText(/Fetch Page/i);
    fireEvent.click(fetchBtn);

    expect(await screen.findByText(/Document page-cs302-distributed/i)).toBeInTheDocument();
  });

  it('filters document blocks when using search query', async () => {
    render(
      <MemoryRouter>
        <AcademicMaterialView />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/Enter Notion Page ID/i);
    fireEvent.change(input, { target: { value: 'page-math101' } });
    fireEvent.click(screen.getByText(/Fetch Page/i));

    expect(await screen.findByText(/Document page-math101/i)).toBeInTheDocument();
  });
});
