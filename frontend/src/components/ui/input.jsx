export const Input = ({ className = "", ...props }) => (
  <input
    className={`w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300 bg-white text-zinc-900 dark:bg-zinc-800 dark:text-white ${className}`}
    {...props}
  />
);
