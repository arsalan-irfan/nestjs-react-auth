import Button from '../components/Button';
import Input from '../components/Input';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Logo from '../assets/secure-logo.png';
import { SignUpDto, authService } from '../services/AuthService';
import { useState } from 'react';
import { toast } from 'react-toastify';

const validationSchema = Yup.object({
  name: Yup.string().required('Name must not be empty'),
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

const SignUp = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmitHandler = async ({ name, email, password }: SignUpDto) => {
    setLoading(true);
    try {
      await authService.signUp({ name, email, password });
      navigate('/home');
    } catch (err: any) {
      toast(err?.message, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: onSubmitHandler,
  });

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img className="mx-auto h-[150px] w-auto" src={Logo} alt="secure app" />
        <h2 className="mt-8 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900 ">
          Create your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={formik.handleSubmit}>
          <div>
            <Input
              id="name"
              name="name"
              type="name"
              label="Full Name"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
              autoComplete="username"
            />
            {formik.touched.name && formik.errors.name ? (
              <div className="mt-1 text-sm text-red-500">
                {formik.errors.name}
              </div>
            ) : null}
          </div>
          <div>
            <Input
              id="email"
              name="email"
              type="email"
              label="Email address"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
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
              {!loading ? 'Sign up' : 'Signing up....'}
            </Button>
          </div>
        </form>

        <p className="mt-10 text-center text-sm text-gray-500">
          Already have an account?
          <Link to="/">
            <span className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
              {' '}
              Click here to sign in
            </span>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
