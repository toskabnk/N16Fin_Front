import { useLocation } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';

const ErrorBoundaryWrapper = ({ children }) => {
  const location = useLocation();

  return (
    <ErrorBoundary location={location}>
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundaryWrapper;