import { useAuth } from '../../contexts/AuthContext';

export const usePrivacyPolicyLogic = () => {
  const { token } = useAuth();

  const isAuthenticated = !!token;
  const backLink = isAuthenticated ? '/settings' : '/login';

  return {
    isAuthenticated,
    backLink,
  };
};
