import React from 'react';

interface IButtonProps extends React.ComponentProps<'button'> {
  width?: number;
  height?: number;
  variant?: 'primary' | 'danger' | 'success';
}

const Button: React.FC<IButtonProps> = ({
  children,
  width,
  variant = 'primary',
  ...props
}) => {
  return (
    <button
      {...props}
      className={`btn btn-${variant} ${width ? `w-[${width}]` : 'w-full'}`}
    >
      {children}
    </button>
  );
};

export default Button;
