import { useMutation } from "@tanstack/react-query";
import { fetchSessionToken, getOnrampUrl } from "../../utils";

interface UseCoinbaseOnrampParams {
  address: string;
  chain: string;
  asset: string;
}

const useCoinbaseOnramp = () => {
  const mutation = useMutation({
    mutationFn: async ({ address, chain, asset }: UseCoinbaseOnrampParams) => {
      const sessionToken = await fetchSessionToken(address, chain, asset);
      return getOnrampUrl(sessionToken, asset, window.location.href);
    },
    onSuccess: (url: string) => {
      window.open(url, "_blank", "noopener,noreferrer");
    },
  });

  return {
    startOnramp: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};

export default useCoinbaseOnramp;
