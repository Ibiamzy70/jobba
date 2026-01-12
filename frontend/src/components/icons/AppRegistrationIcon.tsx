import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

export default function AppRegistrationIcon({
  className,
  ...props
}: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M10 17h4v-2h-4v2Zm-3-4h10v-2H7v2Zm0-4h10V7H7v2ZM5 21q-.825 0-1.413-.588Q3 19.825 3 19V5q0-.825.587-1.413Q4.175 3 5 3h14q.825 0 1.413.587Q21 4.175 21 5v6.275q-.475-.15-.975-.212Q19.525 11 19 11q-.35 0-.675.05t-.625.15V5H5v14h6.075q.1.525.288 1.025.187.5.462.975Zm0-2v2V5v6.375V11v8Zm13.5 2L15 17.5l1.4-1.4 2.1 2.1 4.2-4.2L24 15.4Z" />
    </svg>
  );
}
