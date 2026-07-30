import { FC, ReactNode } from "react";

interface UpdatesSignupFieldProps {
  label: string;
  htmlFor: string;
  children: ReactNode;
  error?: string | null;
  message?: string | null;
  borderClassName?: string;
}

const UpdatesSignupField: FC<UpdatesSignupFieldProps> = ({
  label,
  htmlFor,
  children,
  error,
  message,
  borderClassName = "border-neutral-17",
}) => {
  return (
    <div className="flex flex-col">
      <div className={`flex flex-col gap-1 h-14 bg-secondary-1 rounded-2xl border ${borderClassName} px-4 justify-center`}>
        <label htmlFor={htmlFor} className="text-neutral-11 text-[12px]">
          {label}
        </label>
        {children}
      </div>
      <div aria-live="polite">
        {error ? (
          <p className="text-negative-11 text-[12px] font-bold pl-2 mt-2">{error}</p>
        ) : message ? (
          <p className="text-positive-11 text-[12px] font-bold pl-2 mt-2">{message}</p>
        ) : null}
      </div>
    </div>
  );
};

export default UpdatesSignupField;
