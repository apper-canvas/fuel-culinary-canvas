import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useContext } from 'react';
import { AuthContext } from '../App';
import getIcon from '../utils/iconUtils';

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isInitialized } = useContext(AuthContext);
  const ChefHatIcon = getIcon('ChefHat');

  useEffect(() => {
    if (isInitialized) {
      // Show login UI in this component
      const { ApperUI } = window.ApperSDK;
      ApperUI.showLogin("#authentication");
    }
  }, [isInitialized]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 dark:bg-surface-900">
      <div className="w-full max-w-md space-y-8 p-6 bg-white dark:bg-surface-800 rounded-lg shadow-md">
        <div className="text-center">
          <ChefHatIcon className="h-12 w-12 text-primary mx-auto" />
          <h1 className="mt-4 text-3xl font-bold text-surface-800 dark:text-surface-100">Welcome Back</h1>
          <p className="mt-2 text-surface-600 dark:text-surface-400">Sign in to your CulinaryCanvas account</p>
        </div>
        <div id="authentication" className="min-h-[400px]" />
        <div className="text-center mt-4">
          <p className="text-sm text-surface-600 dark:text-surface-400">
            Don't have an account?{' '}
            <Link to="/signup" className="font-medium text-primary hover:text-primary-dark">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;