"use client";

import ResetPasswordForm from "../../../components/ResetPasswordForm";

interface ResetPasswordPageProps {
  params: {
    token: string;
  };
}

const ResetPasswordPage = ({ params }: ResetPasswordPageProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <ResetPasswordForm token={params.token} />
    </div>
  );
};

export default ResetPasswordPage;
