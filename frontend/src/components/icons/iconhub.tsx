import * as React from "react";

export type IconProps = React.SVGProps<SVGSVGElement>;

/* ------------------------------------------------------------------ */
/*  Icon 1: Health & Safety                                            */
/* ------------------------------------------------------------------ */

export function HealthAndSafetyIcon({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M12 2 4 5v6c0 5.55 3.84 10.74 8 11 4.16-.26 8-5.45 8-11V5l-8-3Zm-1 15-3-3 1.41-1.41L11 14.17l4.59-4.58L17 11l-6 6Z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Icon 2: Marketing (Campaign)                                       */
/* ------------------------------------------------------------------ */

export function MarketingIcon({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M720-440v-80h160v80H720Zm48 280-128-96 48-64 128 96-48 64Zm-80-480-48-64 128-96 48 64-128 96ZM200-200v-160h-40q-33 0-56.5-23.5T80-440v-80q0-33 23.5-56.5T160-600h160l200-120v480L320-360h-40v160h-80Zm240-182v-196l-98 58H160v80h182l98 58Zm120 36v-268q27 24 43.5 58.5T620-480q0 41-16.5 75.5T560-346Z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Icon 3: Technology (Computer)                                      */
/* ------------------------------------------------------------------ */

export function TechnologyIcon({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M320-120v-80h80v-80H160q-33 0-56.5-23.5T80-360v-400q0-33 23.5-56.5T160-840h640q33 0 56.5 23.5T880-760v400q0 33-23.5 56.5T800-280H560v80h80v80H320Z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Icon 4: Finance (Trending Up)                                      */
/* ------------------------------------------------------------------ */

export function FinanceIcon({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M320-414v-306h120v306l-60-56-60 56Zm200 60v-526h120v406L520-354ZM120-216v-344h120v224L120-216Zm0 98 258-258 142 122 224-224h-64v-80h200v200h-80v-64L524-146 382-268 232-118H120Z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Icon 5: Design (Celebration)                                       */
/* ------------------------------------------------------------------ */

export function DesignIcon({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="m270-120-10-88 114-314q15 14 32.5 23.5T444-484L334-182l-64 62Zm420 0-64-62-110-302q20-5 37.5-14.5T586-522l114 314-10 88ZM480-520q-50 0-85-35t-35-85q0-39 22.5-69.5T440-752v-88h80v88q35 12 57.5 42.5T600-640q0 50-35 85t-85 35Z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Icon 6: Education (Book)                                           */
/* ------------------------------------------------------------------ */

export function BookIcon({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M270-80q-45 0-77.5-30.5T160-186v-558q0-38 23.5-68t61.5-38l395-78v640l-379 76q-9 2-15 9.5t-6 16.5q0 11 9 18.5t21 7.5h450v-640h80v720H270Z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Icon 7: Upload                                                     */
/* ------------------------------------------------------------------ */

export function UploadIcon({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M440-160v-326L336-382l-56-58 200-200 200 200-56 58-104-104v326h-80ZM160-600v-120q0-33 23.5-56.5T240-800h480q33 0 56.5 23.5T800-720v120h-80v-120H240v120h-80Z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Icon 8: Checklist / Clipboard                                     */
/* ------------------------------------------------------------------ */

export function ChecklistIcon({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M25 5h-3V4a2 2 0 0 0-2-2H12a2 2 0 0 0-2 2v1H7a2 2 0 0 0-2 2v21a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm-13-1h8v4h-8V4Zm13 24H7V7h3v3h12V7h3v21Z" />
      <path d="M10 13h2v2h-2Zm4 0h8v2h-8Zm-4 5h2v2h-2Zm4 0h8v2h-8Zm-4 5h2v2h-2Zm4 0h8v2h-8Z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Icon 9: System / Dashboard Document                               */
/* ------------------------------------------------------------------ */

export function DashboardDocumentIcon({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M10 6h39a3 3 0 0 1 3 3v30a3 3 0 0 1-3 3H10a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3Zm0 4v28h39V10H10Z" />
      <path d="M18 18h20v2H18Zm0 6h28v2H18Zm0 6h20v2H18Z" />
      <path d="M18 14l2 2 4-4 2 2-6 6-4-4 2-2Z" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Icon 10: Analytics / Monitor Chart                                 */
/* ------------------------------------------------------------------ */

export function AnalyticsMonitorIcon({ className, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1024 1024"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M225 252h574v438H225V252Zm0 64v310h574V316H225Z" />
      <path d="M368 544l92-104 72 78 124-128 46 44-170 174-72-78-58 66-34-52Z" />
      <path d="M256 768h512v64H256Z" />
      <path d="M320 832h384l-32-128H352l-32 128Z" />
    </svg>
  );
}
