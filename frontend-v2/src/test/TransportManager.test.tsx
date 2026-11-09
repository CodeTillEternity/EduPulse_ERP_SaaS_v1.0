import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TransportManager from '../pages/Operations/TransportManager';
import * as enterpriseOpsService from '../api/enterpriseOpsService';

vi.mock('../api/enterpriseOpsService', () => ({
  getVehicles: vi.fn(),
  createVehicle: vi.fn(),
  getRoutes: vi.fn(),
  createRoute: vi.fn(),
  assignStudent: vi.fn(),
  getAllAssignments: vi.fn(),
  getRouteAssignments: vi.fn(),
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

describe('TransportManager Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(enterpriseOpsService.getVehicles).mockResolvedValue([
      {
        id: 1,
        registrationNumber: 'KA-01-EQ-9876',
        capacity: 50,
        driverName: 'Robert Vance',
      },
    ]);

    vi.mocked(enterpriseOpsService.getRoutes).mockResolvedValue([
      {
        id: 10,
        routeName: 'Route 4 - North Campus Express',
        stops: 'Central Station, North Gate, Science Block, Main Auditorium',
        vehicleId: 1,
        vehicleRegistrationNumber: 'KA-01-EQ-9876',
        vehicleCapacity: 50,
        driverName: 'Robert Vance',
        monthlyFee: 120.0,
        assignedCount: 42,
        capacityDisplay: '42/50 Seats Filled',
      },
    ]);

    vi.mocked(enterpriseOpsService.getAllAssignments).mockResolvedValue([
      {
        id: 100,
        studentId: 7,
        studentName: 'Katherine Johnson',
        enrollmentNumber: 'ENR-2026-007',
        routeId: 10,
        routeName: 'Route 4 - North Campus Express',
        pickupStop: 'Central Station',
        assignedDate: '2026-11-01',
        active: true,
      },
    ]);
  });

  it('renders transport header and route cards with "42/50 Seats Filled" capacity KPI indicator', async () => {
    render(<TransportManager />, { wrapper: createWrapper() });

    expect(screen.getByText('Transport & Fleet Logistics')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Route 4 - North Campus Express')).toBeInTheDocument();
      expect(screen.getByText('KA-01-EQ-9876')).toBeInTheDocument();
      expect(screen.getByText('Robert Vance')).toBeInTheDocument();
      expect(screen.getByText('42/50 Seats Filled')).toBeInTheDocument();
      expect(screen.getByText('84% Occupancy')).toBeInTheDocument();
    });
  });

  it('switches between Routes, Vehicles, and Passengers tabs', async () => {
    render(<TransportManager />, { wrapper: createWrapper() });

    // Switch to Vehicles tab
    const vehiclesTabBtn = screen.getByRole('button', { name: /Vehicles/i });
    fireEvent.click(vehiclesTabBtn);

    await waitFor(() => {
      expect(screen.getByText('Registered Fleet Vehicles')).toBeInTheDocument();
      expect(screen.getByText('50 Seats')).toBeInTheDocument();
    });

    // Switch to Passengers tab
    const passengersTabBtn = screen.getByRole('button', { name: /Passengers/i });
    fireEvent.click(passengersTabBtn);

    await waitFor(() => {
      expect(screen.getByText('Student Commuter Seat Assignments')).toBeInTheDocument();
      expect(screen.getByText('Katherine Johnson')).toBeInTheDocument();
    });
  });

  it('opens and closes the Map Commuter Route modal', async () => {
    render(<TransportManager />, { wrapper: createWrapper() });

    const mapRouteBtn = screen.getByRole('button', { name: /Map Route/i });
    fireEvent.click(mapRouteBtn);

    expect(screen.getByText('Map Commuter Route')).toBeInTheDocument();

    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);

    await waitFor(() => {
      expect(screen.queryByText('Map Commuter Route')).not.toBeInTheDocument();
    });
  });
});
