import { useEmailSend } from "@hooks/useEmailSend";
import useSignup from "@hooks/useSignup";
import { EmailType } from "lib/email/types";

interface CheckIfEmailExistsProps {
  emailAddress: string;
  displayToasts?: boolean;
  userAddress?: string;
}

const useEmailSignup = () => {
  const { sendEmail } = useEmailSend();
  const { subscribe, checkIfValueExists, isLoading } = useSignup({
    tableName: "email_signups",
    valueColumn: "email_address",
    valueLabel: "email",
    onSubscribeSuccess: async userAddress => {
      await sendEmail(userAddress ?? "", EmailType.SignUpConfirmation);
    },
  });

  const subscribeUser = async (
    email_address: string,
    user_address: string | null = null,
    showToasts: boolean = true,
  ): Promise<boolean> => subscribe(email_address, user_address, showToasts);

  const checkIfEmailExists = async ({
    emailAddress,
    displayToasts = true,
    userAddress,
  }: CheckIfEmailExistsProps): Promise<boolean> =>
    checkIfValueExists({ value: emailAddress, displayToasts, userAddress });

  return { subscribeUser, checkIfEmailExists, isLoading };
};

export default useEmailSignup;
