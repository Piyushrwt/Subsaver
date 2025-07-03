import React from "react";

export function Table({ children, ...props }) {
  return (
    <table
      className="w-full text-sm text-left border border-base-300 dark:border-white shadow-lg"
      {...props}
    >
      {children}
    </table>
  );
}

export function TableHeader({ children }) {
  return <thead className="bg-base-200">{children}</thead>;
}

export function TableBody({ children }) {
  return <tbody>{children}</tbody>;
}

export function TableRow({ children }) {
  return <tr className="bg-base-100 border-b border-base-300 dark:border-white">{children}</tr>;
}

export function TableHead({ children }) {
  return <th className="px-4 py-2 text-base-content font-medium">{children}</th>;
}

export function TableCell({ children }) {
  return <td className="px-4 py-2 text-base-content">{children}</td>;
}
