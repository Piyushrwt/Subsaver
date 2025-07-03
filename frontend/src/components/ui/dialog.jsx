export const Dialog = ({ children }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">{children}</div>
);
export const DialogContent = ({ children }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">{children}</div>
);
export const DialogHeader = ({ title }) => (
  <h2 className="text-xl font-semibold mb-4">{title}</h2>
);
