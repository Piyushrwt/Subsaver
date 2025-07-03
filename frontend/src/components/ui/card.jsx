export const Card = ({ children, className = "" }) => (
  <div className={`bg-base-100 rounded-xl shadow-md border border-base-300 dark:border-white ${className}`}>{children}</div>
);
export const CardContent = ({ children, className = "" }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);
