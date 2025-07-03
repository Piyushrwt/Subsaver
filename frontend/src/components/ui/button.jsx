export const Button = ({ children, className = "", ...props }) => (
  <button
    {...props}
    className={`bg-black text-white px-5 py-2.5 rounded-xl shadow font-semibold hover:bg-gray-800 hover:scale-105 transition-transform duration-150 ${className}`}
  >
    {children}
  </button>
);
