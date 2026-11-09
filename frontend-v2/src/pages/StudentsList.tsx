import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageFrame } from '../components/ui/PageFrame';
import { CreateStudentDialog } from '../components/CreateStudentDialog';
import { StudentDirectory } from '../components/StudentDirectory';
import { useAuthStore } from '../store/useAuthStore';

export default function StudentsList() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  React.useEffect(() => {
    if (user?.role === 'STUDENT' || user?.role === 'PARENT') {
      navigate('/dashboard/profile', { replace: true });
    }
  }, [user, navigate]);

  return (
    <PageFrame
      title="Student Directory"
      description="Manage institutional student records, cohort allocations, and profiles using enterprise data grids."
      breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Students' }]}
      actions={isAdmin && <CreateStudentDialog />}
    >
      <StudentDirectory />
    </PageFrame>
  );
}
