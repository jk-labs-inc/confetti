import { getAddressProps } from "@helpers/getAddressProps";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import UserContests from "./contests";

type Props = {
  params: Promise<{ address: string }>;
};

export async function generateMetadata(props: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const params = await props.params;
  const address = params.address;

  const addressProps = await getAddressProps(address);

  return {
    title: addressProps.address
      ? `${addressProps.address}-Confetti`
        ? addressProps.ensName
        : ` ${addressProps.ensName}-Confetti`
      : "User not found",
  };
}

const Page = async (props: Props) => {
  const params = await props.params;
  const addressProps = await getAddressProps(params.address);

  if (addressProps.notFound) {
    return notFound();
  }

  return <UserContests address={addressProps.address ?? ""} />;
};

export default Page;
