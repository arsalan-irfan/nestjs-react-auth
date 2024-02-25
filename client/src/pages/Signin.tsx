import Button from '../components/Button';
import Input from '../components/Input';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Logo from '../assets/secure-logo.png';
import { useState } from 'react';
import { SignInDto, authService } from '../services/AuthService';
import { toast } from 'react-toastify';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email must not be empty'),
  password: Yup.string()
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_]).+$/, {
      message:
        'Password should contain atleast 1 letter, 1 number and 1 special character',
    })
    .min(8, 'Password must be 8 characters long')
    .required('Password must not be empty'),
});

const SignIn = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmitHandler = async ({ email, password }: SignInDto) => {
    setLoading(true);
    try {
      await authService.signIn({ email, password });
      navigate('/home');
    } catch (err: any) {
      toast(err?.message, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: onSubmitHandler,
  });

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          className="mx-auto h-[150px] w-auto"
          src={Logo}
          alt="Your Company"
        />
        <h2 className="mt-8 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 ">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={formik.handleSubmit}>
          <div>
            <Input
              id="email"
              name="email"
              type="email"
              label="Email address"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              autoComplete="username"
            />
            {formik.touched.email && formik.errors.email ? (
              <div className="mt-1 text-sm text-red-500">
                {formik.errors.email}
              </div>
            ) : null}
          </div>

          <div>
            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              autoComplete="current-password"
            />
            {formik.touched.password && formik.errors.password ? (
              <div className="mt-1 text-sm text-red-500">
                {formik.errors.password}
              </div>
            ) : null}
          </div>
          <div>
            <Button disabled={!formik.isValid || loading} type="submit">
              {!loading ? 'Sign in' : 'Signing in....'}
            </Button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
          Don't have account?
          <Link to="/register">
            <span className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
              {' '}
              Click here to register
            </span>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
