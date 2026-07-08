import useSignup from "@hooks/useSignup";

interface CheckIfPhoneNumberExistsProps {
  phoneNumber: string;
  displayToasts?: boolean;
  userAddress?: string;
}

const usePhoneNumberSignup = () => {
  const { subscribe, checkIfValueExists, isLoading } = useSignup({
    tableName: "phone_number_signups",
    valueColumn: "phone_number",
    valueLabel: "phone number",
  });

  const subscribePhoneNumber = async (
    phone_number: string,
    user_address: string | null = null,
    showToasts: boolean = true,
  ): Promise<boolean> => subscribe(phone_number, user_address, showToasts);

  const checkIfPhoneNumberExists = async ({
    phoneNumber,
    displayToasts = true,
    userAddress,
  }: CheckIfPhoneNumberExistsProps): Promise<boolean> =>
    checkIfValueExists({ value: phoneNumber, displayToasts, userAddress });

  return { subscribePhoneNumber, checkIfPhoneNumberExists, isLoading };
};

export default usePhoneNumberSignup;
