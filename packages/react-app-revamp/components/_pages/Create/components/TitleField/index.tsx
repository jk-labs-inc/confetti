import UpdatesSignupField from "@components/UI/UpdatesSignup/components/Field";
import { CONTEST_TITLE_MAX_LENGTH } from "@components/_pages/Create/constants/length";
import { useDeployContestStore } from "@hooks/useDeployContest/store";
import { FC, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useShallow } from "zustand/shallow";
import { TITLE_FIELD_ID, TITLE_INPUT_ID } from "../../hooks/useSectionNavigation";

interface CreateContestTitleFieldProps {
  errorMessage?: string | null;
}

const TITLE_PLACEHOLDER = "Apples or Oranges?";

const CreateContestTitleField: FC<CreateContestTitleFieldProps> = ({ errorMessage }) => {
  const { title, setTitle } = useDeployContestStore(
    useShallow(state => ({
      title: state.title,
      setTitle: state.setTitle,
    })),
  );
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const inputRef = useRef<HTMLInputElement>(null);
  const placeholderRef = useRef<HTMLSpanElement>(null);
  const hasAutoFocused = useRef(false);
  const [placeholderWidth, setPlaceholderWidth] = useState(0);
  const isEmpty = title.length === 0;

  useLayoutEffect(() => {
    if (!isEmpty) return;

    const measure = () => setPlaceholderWidth(placeholderRef.current?.offsetWidth ?? 0);

    measure();
    document.fonts?.ready.then(measure);
  }, [isEmpty]);

  useEffect(() => {
    if (isMobile || hasAutoFocused.current) return;

    const input = inputRef.current;
    if (!input) return;

    hasAutoFocused.current = true;
    input.focus({ preventScroll: true });
    input.setSelectionRange(input.value.length, input.value.length);
  }, [isMobile]);

  return (
    <div id={TITLE_FIELD_ID} className="w-full md:w-[448px] scroll-mt-20">
      <UpdatesSignupField
        label="title (required)"
        htmlFor={TITLE_INPUT_ID}
        error={errorMessage}
        borderClassName="border-secondary-11"
      >
        <div className="relative">
          <input
            ref={inputRef}
            id={TITLE_INPUT_ID}
            type="text"
            value={title}
            maxLength={CONTEST_TITLE_MAX_LENGTH}
            onChange={event => setTitle(event.target.value)}
            style={isEmpty ? { textIndent: placeholderWidth } : undefined}
            className="w-full bg-transparent text-[16px] outline-none text-neutral-11"
          />
          {isEmpty ? (
            <span
              ref={placeholderRef}
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 flex items-center text-[16px] text-primary-3 normal-case"
            >
              {TITLE_PLACEHOLDER}
            </span>
          ) : null}
        </div>
      </UpdatesSignupField>
    </div>
  );
};

export default CreateContestTitleField;
