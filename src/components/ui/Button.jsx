import { motion } from 'framer-motion';
import { forwardRef } from 'react';
import '../../styles/components/Button.css';

const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  icon = null,
  iconPosition = 'left',
  onClick,
  className = '',
  ...props 
}, ref) => {
  const baseClasses = `btn btn--${variant} btn--${size}`;
  const classes = `${baseClasses} ${className} ${disabled ? 'btn--disabled' : ''} ${loading ? 'btn--loading' : ''}`.trim();

  const buttonContent = (
    <>
      {loading && (
        <div className="btn__spinner">
          <div className="spinner"></div>
        </div>
      )}
      {icon && iconPosition === 'left' && (
        <span className="btn__icon btn__icon--left">{icon}</span>
      )}
      <span className="btn__text">{children}</span>
      {icon && iconPosition === 'right' && (
        <span className="btn__icon btn__icon--right">{icon}</span>
      )}
    </>
  );

  return (
    <motion.button
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      whileHover={!disabled && !loading ? { scale: 1.02 } : undefined}
      whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.15, ease: 'easeInOut' }}
      {...props}
    >
      {buttonContent}
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;